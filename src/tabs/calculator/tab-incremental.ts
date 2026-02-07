import $ from "jquery";
import { buildFloatingInput, buildSelectInput } from "../../components/forms";
import { convertNum, humanizeDuration, ticksPerStat, validateInput } from "./helper";
import { Duration } from "luxon";
import toast from "../../components/toast";
import $storage from "../../components/storage";
import { generateUniqueId } from "../../utils/idGenerator";

const config = {
	header: "INCREMENTAL CALCULATOR",
};

const state = {
	timeToReachTargetInterval: 0,
};

const inputClasses = {
	labelClassName: "text-terminal text-cyber-purple text-glow-purple",
	inputClassName: "cyber-input cyber-input-purple input-no-spinner text-terminal",
};

const selectClasses = {
	labelClassName: "text-terminal text-cyber-purple text-glow-purple",
	selectClassName: "cyber-select-purple",
};

const inputKeys = [
	{
		label: "CURRENT",
		placeholder: "1",
		key: "current",
	},
	{
		label: "TARGET",
		placeholder: "20",
		key: "target",
	},
] as const;

const selectKeys = [
	{
		label: "STAT TYPE",
		selectOptions: [{ value: "STRENGTH" }, { value: "DURABILITY" }, { value: "CHAKRA" }, { value: "SWORD" }],
	},
	{
		label: "MODE",
		selectOptions: [{ value: "AFK" }, { value: "CLICKING" }],
	},
	{
		label: "CHAMPION",
		selectOptions: [{ value: "DISABLED" }, { value: "ENABLED" }],
	},
	{
		label: "2X STATS",
		selectOptions: [{ value: "DISABLED" }, { value: "ENABLED" }],
	},
	{
		label: "TARGET REACHED",
		selectOptions: [{ value: "DISABLED" }, { value: "ENABLED" }],
	},
] as const;

const inputs = inputKeys.map(({ label, placeholder }) => ({
	label,
	...buildFloatingInput(label, { type: "text", placeholder, ...inputClasses }),
}));

const selects = selectKeys.map(({ label, selectOptions }) => ({
	label,
	...buildSelectInput({ label, selectOptions: [...selectOptions], ...selectClasses }),
}));

export default {
	render(appendTo: string) {
		const id = generateUniqueId();

		const stype = selects.find((x) => x.label === "STAT TYPE")!;
		const smode = selects.find((x) => x.label === "MODE")!;
		const champ = selects.find((x) => x.label === "CHAMPION")!;
		const stat2x = selects.find((x) => x.label === "2X STATS")!;
		const notify = selects.find((x) => x.label === "TARGET REACHED")!;
		const currInp = inputs.find((x) => x.label === "CURRENT")!;
		const wantInp = inputs.find((x) => x.label === "TARGET")!;

		const statInputs = [stype, ...inputs, smode, champ, stat2x].map(
			(x) => /*html*/ `
            <div class="col-sm-6 col-md-4">${x.input}</div>`,
		);

		$(appendTo).append(/*html*/ `
            <div id="${id}" class="cyber-card cyber-card-purple">
                <h2 class="text-2xl font-bold mb-6 text-glow-purple">${config.header}</h2>
                <div class="my-3" data-bs-theme="dark">
                    <span class="d-block font-bold text-glow-purple text-lg">STATS</span>
                    <div class="row g-2">${statInputs.join("")}</div>
                </div>
                <div class="my-3" data-bs-theme="dark">
                    <span class="d-block font-bold text-glow-purple text-lg">BROWSER NOTIFICATIONS</span>
                    <div class="row g-2">
                        <div class="col-sm-6 col-md-4">${notify.input}</div>
                    </div>
                </div>
                <div class="mt-5 mb-3">
                    <button data-inc-calculate="true" class="cyber-btn cyber-btn-purple w-100"><i class="bi bi-calculator me-2"></i>CALCULATE</button>
                </div>
                <div class="my-3 stats-display stats-display-purple">
                    <div class="row g-2">
                        <div class="col-md-6">
                            <span class="d-block text-sm text-terminal text-cyber-purple text-glow-purple">INC/MIN</span>
                            <span data-inc-ipm-label="true" class="d-block text-xl text-terminal text-glow-purple">0</span>
                        </div>
                        <div class="col-md-6">
                            <span class="d-block text-sm text-terminal text-cyber-purple text-glow-purple">TIME</span>
                            <span data-inc-ttr-label="true" class="d-block text-xl text-terminal text-glow-purple">TARGET REACHED</span>
                        </div>
                    </div>
                </div>
            </div>
        `);

		if (Notification.permission === "granted" && $storage.has(`notifications:inc:${notify.label}`)) {
			$(`#${notify.id}`).val($storage.get(`notifications:inc:${notify.label}`));
		}

		// REQUEST NOTIFICATION PERMISSION
		$(`#${notify.id}`).on("change", function () {
			const value = $(this).val();
			$storage.set(`notifications:inc:${notify.label}`, value);

			if (value !== "ENABLED") return;
			const toastInfo = "Browser notification only works when the tab is open.";
			const toastWarn = "Please allow browser notifications to use the Notification feature.";

			if (Notification.permission === "granted") return toast.info(toastInfo);

			Notification.requestPermission().then((permission) => {
				if (permission !== "granted") {
					$(this).val("DISABLED");
					return toast.warning(toastWarn);
				}

				toast.info(toastInfo);
			});
		});

		// Remove invalid class on focus
		inputs.forEach((input) => {
			$(`#${input.id}`).on("focus", function () {
				$(this).removeClass("invalid");
			});
		});

		// Recalculate when select inputs change
		selects
			.filter((x) => x.label !== "TARGET REACHED")
			.forEach((select) => {
				$(`#${select.id}`).on("change", function () {
					if (state.timeToReachTargetInterval !== 0) {
						toast.warning("Input change detected. Recalculating values...");
						$("[data-inc-calculate]").trigger("click touchstart");
					}
				});
			});

		// When user clicks "Calculate"
		$("[data-inc-calculate]").on("click touchstart", function () {
			const currValue = currInp.$().val() as string;
			const wantValue = wantInp.$().val() as string;

			// Remove invalid class from all inputs first
			currInp.$().removeClass("invalid");
			wantInp.$().removeClass("invalid");

			// Validate all inputs
			const currValidation = validateInput(currValue, "CURRENT");
			const wantValidation = validateInput(wantValue, "TARGET");

			// Check for validation errors
			let hasError = false;

			if (!currValidation.isValid) {
				toast.error(currValidation.error || "Invalid CURRENT value");
				currInp.$().addClass("invalid");
				hasError = true;
			}

			if (!wantValidation.isValid) {
				toast.error(wantValidation.error || "Invalid TARGET value");
				wantInp.$().addClass("invalid");
				hasError = true;
			}

			if (hasError) {
				return; // Stop calculation if any input is invalid
			}

			const curr = currValidation.parsed;
			const want = wantValidation.parsed;

			// Check logical errors
			if (curr > want) {
				toast.error("Target stat must be greater than the current stat.");
				wantInp.$().addClass("invalid");
				return;
			}

			const statName = stype.$().val() as Extract<(typeof selectKeys)[number], { label: "STAT TYPE" }>["selectOptions"][number]["value"];
			const statMode = smode.$().val() as Extract<(typeof selectKeys)[number], { label: "MODE" }>["selectOptions"][number]["value"];
			const statChamp = champ.$().val() as Extract<(typeof selectKeys)[number], { label: "CHAMPION" }>["selectOptions"][number]["value"];
			const doubleStat = stat2x.$().val() as Extract<(typeof selectKeys)[number], { label: "2X STATS" }>["selectOptions"][number]["value"];
			const notifyValue = notify.$().val() as Extract<(typeof selectKeys)[number], { label: "TARGET REACHED" }>["selectOptions"][number]["value"];

			let incPerMin = 0;

			// Calculate increments per minute
			if (ticksPerStat[statName]) {
				incPerMin = ticksPerStat[statName][statMode];
			}

			if (statChamp === "ENABLED") {
				incPerMin += 15;
			}

			if (doubleStat === "ENABLED") {
				incPerMin *= 2;
			}

			// Handle zero or negative increments
			if (incPerMin <= 0) {
				if (curr >= want) {
					$("[data-inc-ttr-label]").text("TARGET REACHED");
					$("[data-inc-ipm-label]").text("0");
				} else {
					toast.error("Increments per minute is 0 or negative. Check your settings.");
					$("[data-inc-ttr-label]").text("NO PROGRESS");
					$("[data-inc-ipm-label]").text("0");
				}
				clearInterval(state.timeToReachTargetInterval);
				state.timeToReachTargetInterval = 0;
				return;
			}

			const minutesNeeded = (want - curr) / incPerMin;

			$("[data-inc-ipm-label]").text(incPerMin.toFixed(2));

			// Handle extremely large time values
			if (minutesNeeded >= 1e9 || !isFinite(minutesNeeded)) {
				$("[data-inc-ttr-label]").text("NEARLY INFINITE TIME");
				clearInterval(state.timeToReachTargetInterval);
				state.timeToReachTargetInterval = 0;
				toast.info("Time required is extremely long. Consider adjusting your settings.");
				return;
			}

			clearInterval(state.timeToReachTargetInterval);
			let remainingSeconds = Math.floor(minutesNeeded * 60);

			// If already at or past target
			if (remainingSeconds <= 0) {
				$("[data-inc-ttr-label]").text("TARGET REACHED");
				if (notifyValue === "ENABLED") {
					new Notification(config.header, {
						body: "Target stats has been reached!",
						icon: "/icons/icon-256.png",
					});
				}
				return;
			}

			state.timeToReachTargetInterval = setInterval(() => {
				if (remainingSeconds === 0) {
					clearInterval(state.timeToReachTargetInterval);
					state.timeToReachTargetInterval = 0;
					$("[data-inc-ttr-label]").text("TARGET REACHED");
					if (notifyValue === "ENABLED") {
						new Notification(config.header, {
							body: "Target stats has been reached!",
							icon: "/icons/icon-256.png",
						});
					}
					return;
				}

				$("[data-inc-ttr-label]").text(humanizeDuration(Duration.fromObject({ seconds: remainingSeconds })));
				remainingSeconds--;
			}, 1_000);
		});

		return id;
	},
};
