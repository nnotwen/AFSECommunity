import $ from "jquery";
import { Duration } from "luxon";
import { convertNum, humanizeDuration, ticksPerStat, validateInput } from "./helper";
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

		const statType = selects.find((x) => x.label === "STAT TYPE")!;
		const statMode = selects.find((x) => x.label === "MODE")!;
		const notifTR = selects.find((x) => x.label === "TARGET REACHED")!;

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
                <span class="d-block font-bold text-glow-blue text-lg">BROWSER NOTIFICATIONS</span>
                <div class="row g-2">
                    <div class="col-sm-6 col-md-4">${notifTR.input}</div>
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
		for (const notification of [notifTR]) {
			if (Notification.permission === "granted" && $storage.has(`notifications:stats:${notification.label}`)) {
				$(`#${notification.id}`).val($storage.get(`notifications:stats:${notification.label}`));
			}
		}

		// Remove invalid classes when input are on focus
		const devalidatedIdsLabels = ["STATS PER TICK", "CURRENT STATS", "TARGET STATS"] as const;
		const devalidatedIds = devalidatedIdsLabels.map((x) => inputs.find((y) => y.label === x)!.id);
		$(devalidatedIds.map((id) => `#${id}`).join(", ")).on("focus", function () {
			$(this).removeClass("invalid");
		});

		// REQUEST NOTIFICATION PERMISSION
		$([notifTR].map((x) => `#${x.id}`).join(", ")).on("change", function () {
			const value = $(this).val();
			const type = [notifTR].find((x) => x.id === $(this).attr("id"))!.label;
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

		// When user clicks "Calculate"
		$("[data-stats-calculate]").on("click touchstart", function () {
			const $statsPrT = $(`#${inputs.find((x) => x.label === "STATS PER TICK")!.id}`);
			const $champSPT = $(`#${inputs.find((x) => x.label === "CHAMPION STAT/TICK")!.id}`);
			const $statType = $(`#${selects.find((x) => x.label === "STAT TYPE")!.id}`);
			const $statMode = $(`#${selects.find((x) => x.label === "MODE")!.id}`);
			const $notifyTR = $(`#${selects.find((x) => x.label === "TARGET REACHED")!.id}`);

			let validated = true;
			let validationErrors: string[] = [];

			// Validate inputs using validateInput function
			const statsPerTickValidation = validateInput($statsPrT.val() as string, "STATS PER TICK");
			if (!statsPerTickValidation.isValid) {
				validated = false;
				validationErrors.push(statsPerTickValidation.error!);
				$(`#${inputs.find((x) => x.label === "STATS PER TICK")!.id}`).addClass("invalid");
			}

			const currentStatsValidation = validateInput($(`#${inputs.find((x) => x.label === "CURRENT STATS")!.id}`).val() as string, "CURRENT STATS");
			if (!currentStatsValidation.isValid) {
				validated = false;
				validationErrors.push(currentStatsValidation.error!);
				$(`#${inputs.find((x) => x.label === "CURRENT STATS")!.id}`).addClass("invalid");
			}

			const targetStatsValidation = validateInput($(`#${inputs.find((x) => x.label === "TARGET STATS")!.id}`).val() as string, "TARGET STATS");
			if (!targetStatsValidation.isValid) {
				validated = false;
				validationErrors.push(targetStatsValidation.error!);
				$(`#${inputs.find((x) => x.label === "TARGET STATS")!.id}`).addClass("invalid");
			}

			const champStatPerTickValidation = validateInput($champSPT.val() as string, "CHAMPION STAT/TICK", 0);
			if (!champStatPerTickValidation.isValid) {
				validated = false;
				validationErrors.push(champStatPerTickValidation.error!);
				$(`#${inputs.find((x) => x.label === "CHAMPION STAT/TICK")!.id}`).addClass("invalid");
			}

			// Check if current stats is less than target stats
			if (currentStatsValidation.isValid && targetStatsValidation.isValid) {
				if (currentStatsValidation.parsed > targetStatsValidation.parsed) {
					validated = false;
					validationErrors.push("Current stats can't be greater than target stats.");
					$(`#${inputs.find((x) => x.label === "TARGET STATS")!.id}`).addClass("invalid");
					$(`#${inputs.find((x) => x.label === "CURRENT STATS")!.id}`).addClass("invalid");
				}
			}

			if (!validated) {
				// Show all validation errors
				validationErrors.forEach((error) => toast.error(error));
				return;
			}

			// Now we know all inputs are valid, get the parsed values
			const statName = $statType.val() as keyof typeof ticksPerStat;
			const basePerTick = statsPerTickValidation.parsed;
			const tickRate = ticksPerStat[statName][$statMode.val() as "CLICKING" | "AFK"];
			const champBonus = champStatPerTickValidation.parsed * 15;
			const boostSeconds = 0; // Removed boost functionality

			// per-minute rates
			const boostedSPM = basePerTick * 1.5 * tickRate + champBonus;
			const normalSPM = basePerTick * tickRate + champBonus;

			const want = targetStatsValidation.parsed;
			const curr = currentStatsValidation.parsed;

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
				`${convertNum(normalSPM, "format")} <span class="text-glow-green">(x1.0)</span>`, // Always show normal rate since boost is removed
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
					`${convertNum(normalSPM, "format")} <span class="text-glow-green">(x1.0)</span>`, // Always show normal rate
				);

				$(`[data-stats-ttr-label]`).text(humanizeDuration(Duration.fromObject({ seconds: remainingSeconds })));
				remainingSeconds--;
			}, 1_000);
		});

		return id;
	},
};
