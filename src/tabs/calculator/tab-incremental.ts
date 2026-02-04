import $ from "jquery";
import { buildFloatingInput, buildSelectInput } from "../../components/forms";
import { convertNum, humanizeDuration, ticksPerStat } from "./helper";
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
	},
	{
		label: "TARGET",
		placeholder: "20",
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

		const stype = { ...selects.find((x) => x.label === "STAT TYPE")! };
		const smode = selects.find((x) => x.label === "MODE")!;
		const champ = selects.find((x) => x.label === "CHAMPION")!;
		const stat2x = selects.find((x) => x.label === "2X STATS")!;
		const notify = selects.find((x) => x.label === "TARGET REACHED")!;

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

		const devalidatedIdsLabels = ["CURRENT", "TARGET"] as const;
		const devalidatedIds = devalidatedIdsLabels.map((x) => inputs.find((y) => y.label === x)!.id);
		$(devalidatedIds.map((id) => `#${id}`).join(", ")).on("focus", function () {
			$(this).removeClass("invalid");
		});

		$(selects.map((x) => `#${x.id}`).join(", ")).on("change", function () {
			const ignoredLabels = ["TARGET REACHED"];
			if (ignoredLabels.includes(selects.find((x) => x.id === $(this).attr("id"))!.label)) return;

			if (state.timeToReachTargetInterval !== 0) {
				toast.warning("Input change detected. Recalculating values...");
				$("[data-inc-calculate]").trigger("click");
			}
		});

		// When user clicks "Calculate"
		$("[data-inc-calculate]").on("click", function () {
			const $curr = $(`#${inputs.find((x) => x.label === "CURRENT")!.id}`);
			const $want = $(`#${inputs.find((x) => x.label === "TARGET")!.id}`);
			const $notify = $(`#${selects.find((x) => x.label === "TARGET REACHED")!.id}`);

			const statName = stype.$().val() as Extract<(typeof selectKeys)[number], { label: "STAT TYPE" }>["selectOptions"][number]["value"];
			const statMode = smode.$().val() as Extract<(typeof selectKeys)[number], { label: "MODE" }>["selectOptions"][number]["value"];
			const statChamp = champ.$().val() as Extract<(typeof selectKeys)[number], { label: "CHAMPION" }>["selectOptions"][number]["value"];
			const doubleStat = stat2x.$().val() as Extract<(typeof selectKeys)[number], { label: "2X STATS" }>["selectOptions"][number]["value"];

			const curr = convertNum($curr.val() as string, "parse");
			const want = convertNum($want.val() as string, "parse");

			let incPerMin = 0,
				minutesNeeded = 0,
				validated = true;

			if (curr <= 0) {
				validated = false;
				toast.error("Current Stat be a positive, non-zero number.");
				$curr.addClass("invalid");
			}

			if (want <= 0) {
				validated = false;
				toast.error("Target Stat be a positive, non-zero number.");
				$want.addClass("invalid");
			}

			if (curr > 0 && want > 0 && curr > want) {
				validated = false;
				toast.error("Target stat must be greater than the current stat.");
				$want.addClass("invalid");
			}

			if (!validated) return;

			if (ticksPerStat[statName]) incPerMin = ticksPerStat[statName][statMode];
			if (statChamp === "ENABLED") incPerMin += 15;
			if (doubleStat === "ENABLED") incPerMin *= 2;
			if (want > curr && incPerMin > 0) minutesNeeded = (want - curr) / incPerMin;

			$("[data-inc-ipm-label]").text(incPerMin.toFixed(2));

			clearInterval(state.timeToReachTargetInterval);
			let remainingSeconds = Math.floor(minutesNeeded * 60);

			state.timeToReachTargetInterval = setInterval(() => {
				if (remainingSeconds === 0) {
					clearInterval(state.timeToReachTargetInterval);
					state.timeToReachTargetInterval = 0;
					$("[data-inc-ttr-label]").text("TARGET REACHED");
					if ($notify.val() === "ENABLED") {
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
