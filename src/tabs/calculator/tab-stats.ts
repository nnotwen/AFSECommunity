import $ from "jquery";
import { Duration } from "luxon";
import { convertNum, humanizeDuration, ticksPerStat } from "./helper";
import { buildFloatingInput, buildSelectInput } from "../../components/forms";
import { generateUniqueId } from "../../utils/idGenerator";
import toast from "../../components/toast";
import $storage from "../../components/storage";

const config = {
	header: "STAT CALCULATOR V2.0",
};

let state = {
	boostActive: false,
	boostInterval: 0,
	timeToReachTargetInterval: 0,
	lastBoostedStatPerMinute: 0,
	lastUnboostedStatPerMinute: 0,
};

const statClasses = {
	labelClassName: "text-terminal text-cyber-blue text-glow-blue",
	inputClassName: "cyber-input text-terminal",
};

const inputKeys = [
	{
		label: "STATS PER TICK",
		placeholder: "e.g. 1M",
	},
	{
		label: "CURRENT STATS",
		placeholder: "e.g. 10M",
	},
	{
		label: "TARGET STATS",
		placeholder: "e.g. 1B",
	},
	{
		label: "CHAMPION STAT/TICK",
		placeholder: "Optional",
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
		label: "TARGET REACHED",
		selectOptions: [{ value: "DISABLED" }, { value: "ENABLED" }],
	},
	{
		label: "BOOST ENDED",
		selectOptions: [{ value: "DISABLED" }, { value: "ENABLED" }],
	},
] as const;

const inputs = inputKeys.map(({ label, placeholder }) => ({
	label,
	...buildFloatingInput(label, { type: "text", placeholder, ...statClasses }),
}));

const selects = selectKeys.map(({ label, selectOptions }) => ({
	label,
	...buildSelectInput({ label, selectOptions: [...selectOptions], labelClassName: "text-cyber-blue text-glow-blue" }),
}));

export default {
	render(appendTo: string) {
		const id = generateUniqueId();
		const serverBoostId = generateUniqueId();

		const statType = selects.find((x) => x.label === "STAT TYPE")!;
		const statMode = selects.find((x) => x.label === "MODE")!;
		const notifTR = selects.find((x) => x.label === "TARGET REACHED")!;
		const notifBE = selects.find((x) => x.label === "BOOST ENDED")!;

		const statInputs = inputs.map((x) => /*html*/ `<div class="col-sm-6 col-md-4">${x.input}</div>`);

		$(appendTo).append(/*html*/ `
        <div id="${id}" class="cyber-card">
            <h2 class="text-2xl font-bold mb-6 text-glow-blue">${config.header}</h2>
            <div class="my-3" data-bs-theme="dark">
                <span class="d-block font-bold text-glow-blue text-lg">STATS</span>
                <div class="row g-2">
                    <div class="col-sm-6 col-md-4">${statType.input}</div>
                    ${statInputs.join("")}
                    <div class="col-sm-6 col-md-4">${statMode.input}</div>
                </div>
            </div>
            <div class="my-3" data-bs-theme="dark">
                <label for="input-${serverBoostId}" class="font-bold text-glow-blue text-lg">SERVER BOOST CONTROL</label>
                <div class="row g-2">
                    <div class="col-md-6">
                        <div id="${serverBoostId}" class="input-group h-100">
                            <input id="input-${serverBoostId}" type="number" class="form-control input-no-spinner cyber-input h-100" placeholder="DURATION (MINUTES)">
                            <button class="btn cyber-btn cyber-btn-success hover:border-cyber-blue" type="button">ACTIVATE</button>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="d-flex flex-column text-glow-blue cyber-input text-center h-100">
                            <span data-server-boost-label="true" class="text-terminal text-cyber-red text-glow-red">BOOST INACTIVE (x1)</span>
                            <span data-server-boost-duration="0" class="text-terminal">00:00</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="my-3" data-bs-theme="dark">
                <span class="d-block font-bold text-glow-blue text-lg">BROWSER NOTIFICATIONS</span>
                <div class="row g-2">
                    <div class="col-sm-6 col-md-4">${notifTR.input}</div>
                    <div class="col-sm-6 col-md-4">${notifBE.input}</div>
                </div>
            </div>
            <div class="mt-5 mb-3">
                <button data-stats-calculate="true" class="cyber-btn cyber-btn-primary w-100"><i class="bi bi-calculator me-2"></i>CALCULATE</button>
            </div>
            <div class="my-3 stats-display">
                <div class="row g-2">
                    <div class="col-md-6">
                        <span class="d-block text-sm text-terminal text-cyber-blue text-glow-blue">STATS GAIN PER MINUTE</span>
                        <span data-stats-gpm-label="true" class="d-block text-xl text-terminal text-glow-blue">0</span>
                    </div>
                    <div class="col-md-6">
                        <span class="d-block text-sm text-terminal text-cyber-blue text-glow-blue">TIME TO REACH TARGET</span>
                        <span data-stats-ttr-label="true" class="d-block text-xl text-terminal text-glow-blue">TARGET REACHED</span>
                    </div>
                </div>
            </div>
        </div>`);

		// Set default values for notifications on init
		for (const notification of [notifTR, notifBE]) {
			if (Notification.permission === "granted" && $storage.has(`notifications:stats:${notification.label}`)) {
				$(`#${notification.id}`).val($storage.get(`notifications:stats:${notification.label}`));
			}
		}

		// Remove invalid classes when input are on focus
		const devalidatedIdsLabels = ["STATS PER TICK", "CURRENT STATS", "TARGET STATS"] as const;
		const devalidatedIds = devalidatedIdsLabels.map((x) => inputs.find((y) => y.label === x)!.id);
		$(`#input-${serverBoostId}, ${devalidatedIds.map((id) => `#${id}`).join(", ")}`).on("focus", function () {
			$(this).removeClass("invalid");
		});

		// REQUEST NOTIFICATION PERMISSION
		$([notifTR, notifBE].map((x) => `#${x.id}`).join(", ")).on("change", function () {
			const value = $(this).val();
			const type = [notifTR, notifBE].find((x) => x.id === $(this).attr("id"))!.label;
			$storage.set(`notifications:stats:${type}`, value);

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

		// When boost is activated
		$(`#${serverBoostId} > button`).on("click touchstart", function () {
			const $input = $(`#input-${serverBoostId}`);
			const val = parseFloat($input.val() as string) || null;

			// Invalid input
			if (!val || val <= 0) {
				toast.error("Invalid value! Please enter a valid value.");
				return $input.addClass("invalid");
			}

			let remainingSeconds = val * 60;
			state.boostActive = true;
			clearInterval(state.boostInterval);

			if (state.timeToReachTargetInterval !== 0) {
				toast.warning("Boost Value changed. Please recalculate to avoid duration mismatch!");
			}

			$("[data-server-boost-label]") // Update boost label
				.text("BOOST ACTIVE (x1.5)")
				.addClass("text-cyber-green text-glow-green")
				.removeClass("text-cyber-red text-glow-red");

			state.boostInterval = setInterval(() => {
				if (remainingSeconds <= 0) {
					clearInterval(state.boostInterval);
					state.boostActive = false;

					$("[data-server-boost-label]")
						.text("BOOST INACTIVE (x1)")
						.addClass("text-cyber-red text-glow-red")
						.removeClass("text-cyber-green text-glow-green");

					if ($(`#${[notifTR, notifBE].find((x) => x.label === "BOOST ENDED")!.id}`).val() === "ENABLED") {
						new Notification("Stat Calculator v2.0", {
							body: "Boost has been exhausted!",
							icon: "/icons/icon-256.png",
						});
					}

					return $("[data-server-boost-duration]") // update duration
						.attr("data-server-boost-duration", "0")
						.text("00:00:00");
				}

				$("[data-server-boost-duration]")
					.attr("data-server-boost-duration", `${remainingSeconds}`)
					.text(Duration.fromObject({ seconds: remainingSeconds }).toFormat("hh:mm:ss"));

				remainingSeconds--;
			}, 1_000);
		});

		// When user clicks "Calculate"
		$("[data-stats-calculate]").on("click touchstart", function () {
			const $statsPrT = $(`#${inputs.find((x) => x.label === "STATS PER TICK")!.id}`);
			const $champSPT = $(`#${inputs.find((x) => x.label === "CHAMPION STAT/TICK")!.id}`);
			const $statType = $(`#${selects.find((x) => x.label === "STAT TYPE")!.id}`);
			const $statMode = $(`#${selects.find((x) => x.label === "MODE")!.id}`);
			const $notifyTR = $(`#${selects.find((x) => x.label === "TARGET REACHED")!.id}`);

			let validated = true;
			const statName = $statType.val() as keyof typeof ticksPerStat;
			const basePerTick = convertNum($statsPrT.val() as string, "parse");
			const tickRate = ticksPerStat[statName][$statMode.val() as "CLICKING" | "AFK"];
			const champBonus = convertNum($champSPT.val() as string, "parse") * 15;
			const boostSeconds = parseFloat($("[data-server-boost-duration]").attr("data-server-boost-duration") as string) ?? 0;

			// per-minute rates
			const boostedSPM = basePerTick * 1.5 * tickRate + champBonus;
			const normalSPM = basePerTick * tickRate + champBonus;

			const want = convertNum($(`#${inputs.find((x) => x.label === "TARGET STATS")!.id}`).val() as string, "parse");
			const curr = convertNum($(`#${inputs.find((x) => x.label === "CURRENT STATS")!.id}`).val() as string, "parse");

			// validate
			if (basePerTick <= 0) {
				validated = false;
				$(`#${inputs.find((x) => x.label === "STATS PER TICK")!.id}`).addClass("invalid");
			}

			if (want <= 0) {
				validated = false;
				$(`#${inputs.find((x) => x.label === "TARGET STATS")!.id}`).addClass("invalid");
			}

			if (curr <= 0) {
				validated = false;
				$(`#${inputs.find((x) => x.label === "CURRENT STATS")!.id}`).addClass("invalid");
			}

			if (curr > want) {
				validated = false;
				$(`#${inputs.find((x) => x.label === "TARGET STATS")!.id}`).addClass("invalid");
				$(`#${inputs.find((x) => x.label === "CURRENT STATS")!.id}`).addClass("invalid");
				toast.error("Current stats can't be lesser than target stats.");
			}

			if (!validated) {
				return toast.error("Please fix all validation errors!");
			}

			// Phase 1: stats gained during boost
			const boostMinutes = boostSeconds / 60;
			const gainedDuringBoost = boostedSPM * boostMinutes;

			let remaining = want - curr - gainedDuringBoost;

			let totalMinutes: number;
			if (remaining <= 0) {
				// target reached during boost
				totalMinutes = (want - curr) / boostedSPM;
			} else {
				// target not reached during boost → add boost time + normal time
				const normalMinutes = remaining / normalSPM;
				totalMinutes = boostMinutes + normalMinutes;
			}

			state.lastBoostedStatPerMinute = boostedSPM;
			state.lastUnboostedStatPerMinute = normalSPM;

			$(`[data-stats-gpm-label]`).html(
				state.boostActive
					? `${convertNum(boostedSPM, "format")} <span class="text-glow-green">(x1.5)</span>`
					: `${convertNum(normalSPM, "format")} <span class="text-glow-green">(x1.0)</span>`,
			);

			$(`[data-stats-ttr-label]`).text(want > curr ? humanizeDuration(Duration.fromObject({ minutes: totalMinutes })) : "TARGET REACHED");

			clearInterval(state.timeToReachTargetInterval);
			let remainingSeconds = Math.floor(totalMinutes * 60);

			state.timeToReachTargetInterval = setInterval(() => {
				if (remainingSeconds === 0) {
					clearInterval(state.timeToReachTargetInterval);
					state.timeToReachTargetInterval = 0;
					$(`[data-stats-ttr-label]`).text("TARGET REACHED");
					if ($notifyTR.val() === "ENABLED") {
						new Notification(config.header, {
							body: "Target stats has been reached!",
							icon: "/icons/icon-256.png",
						});
					}
					return;
				}

				$(`[data-stats-gpm-label]`).html(
					state.boostActive
						? `${convertNum(boostedSPM, "format")} <span class="text-glow-green">(x1.5)</span>`
						: `${convertNum(normalSPM, "format")} <span class="text-glow-green">(x1.0)</span>`,
				);

				$(`[data-stats-ttr-label]`).text(humanizeDuration(Duration.fromObject({ seconds: remainingSeconds })));
				remainingSeconds--;
			}, 1_000);
		});

		return id;
	},
};
