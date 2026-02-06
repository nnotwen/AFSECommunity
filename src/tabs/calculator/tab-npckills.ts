import $ from "jquery";
import { buildFloatingInput, buildSelectInput } from "../../components/forms";
import $storage from "../../components/storage";
import toast from "../../components/toast";
import { convertNum, humanizeDuration } from "./helper";
import { Duration } from "luxon";
import { generateUniqueId } from "../../utils/idGenerator";

const config = {
	header: "NPC KILLS FARMING CALCULATOR",
	npcKPM: 20, // NPC Kills Per Minute
};

const state = {
	timeToReachTargetInterval: 0,
};

const inputClasses = {
	labelClassName: "text-terminal text-cyber-red text-glow-red",
	inputClassName: "cyber-input cyber-input-red input-no-spinner text-terminal",
};

const selectClasses = {
	labelClassName: "text-terminal text-cyber-red text-glow-red",
	selectClassName: "cyber-select-red",
};

const inputKeys = [
	{
		label: "CURRENT KILLS",
		placeholder: "1",
		key: "currentKills",
	},
	{
		label: "WANTED KILLS",
		placeholder: "20",
		key: "wantedKills",
	},
	{
		label: "AMOUNT OF NPC PER SPAWN",
		placeholder: "4",
		key: "npcsPerSpawn",
	},
] as const;

const selectKeys = [
	{
		label: "TARGET REACHED",
		selectOptions: [{ value: "DISABLED" }, { value: "ENABLED" }],
		key: "notify",
	},
];

const inputs = inputKeys.map(({ label, placeholder, key }) => ({
	label,
	key,
	...buildFloatingInput(label, { type: "text", placeholder, ...inputClasses }),
}));

const selects = selectKeys.map(({ label, selectOptions, key }) => ({
	label,
	key,
	...buildSelectInput({ label, selectOptions: [...selectOptions], ...selectClasses }),
}));

// Helper function to validate input (simplified like other calculators)
function isValidNumber(value: string, fieldName: string): { isValid: boolean; parsed: number; error?: string } {
	const trimmed = value.trim();

	// Check if empty
	if (!trimmed) {
		return { isValid: false, parsed: 0, error: `${fieldName} cannot be empty` };
	}

	try {
		// Try to parse the value - convertNum should handle all suffix formats
		const parsed = convertNum(trimmed, "parse");

		// Check for negative values (only real validation we care about)
		if (parsed < 0) {
			return { isValid: false, parsed: parsed, error: `${fieldName} cannot be negative` };
		}

		// Check for zero or negative (kills should be >= 0, but 0 is allowed for current kills)
		if (parsed < 0) {
			return { isValid: false, parsed: parsed, error: `${fieldName} cannot be negative` };
		}

		// Check for NaN or Infinity
		if (!isFinite(parsed) || isNaN(parsed)) {
			return { isValid: false, parsed: 0, error: `${fieldName}: Invalid number` };
		}

		return { isValid: true, parsed: parsed };
	} catch (error) {
		// If convertNum throws an error, the format is invalid
		return {
			isValid: false,
			parsed: 0,
			error: `${fieldName}: Invalid format. Use numbers like 100, 1M, 1.5B, 1T, 1QD, etc.`,
		};
	}
}

export default {
	render(appendTo: string) {
		const id = generateUniqueId();

		const currInp = inputs.find((x) => x.label === "CURRENT KILLS")!;
		const wantInp = inputs.find((x) => x.label === "WANTED KILLS")!;
		const npcsInp = inputs.find((x) => x.label === "AMOUNT OF NPC PER SPAWN")!;
		const notify = selects.find((x) => x.label === "TARGET REACHED")!;

		const statInputs = inputs.map((x) => /*html*/ `<div class="col-sm-6 col-md-4">${x.input}</div>`);

		$(appendTo).append(/*html*/ `
            <div id="${id}" class="cyber-card cyber-card-red">
                <h2 class="text-2xl font-bold mb-6 text-glow-red">${config.header}</h2>
                <div class="my-3" data-bs-theme="dark">
                    <span class="d-block font-bold text-glow-red text-lg">STATS</span>
                    <div class="row g-2">${statInputs.join("")}</div>
                </div>
                <div class="my-3" data-bs-theme="dark">
                    <span class="d-block font-bold text-glow-red text-lg">BROWSER NOTIFICATIONS</span>
                    <div class="row g-2">
                        <div class="col-sm-6 col-md-4">${notify.input}</div>
                    </div>
                </div>
                <div class="mt-5 mb-3">
                    <button data-npckills-calculate="true" class="cyber-btn cyber-btn-red w-100"><i class="bi bi-calculator me-2"></i>CALCULATE</button>
                </div>
                <div class="my-3 stats-display stats-display-red">
                    <div class="row g-2">
                        <div class="col-md-6">
                            <span class="d-block text-sm text-terminal text-cyber-red text-glow-red">KILLS/MIN</span>
                            <span data-npck-kpm-label="true" class="d-block text-xl text-terminal text-glow-red">0</span>
                        </div>
                        <div class="col-md-6">
                            <span class="d-block text-sm text-terminal text-cyber-red text-glow-red">KILLS REMAINING</span>
                            <span data-npck-krem-label="true" class="d-block text-xl text-terminal text-glow-red">0</span>
                        </div>
                        <div class="col-md-6">
                            <span class="d-block text-sm text-terminal text-cyber-red text-glow-red">TIME NEEDED</span>
                            <span data-npck-ttr-label="true" class="d-block text-xl text-terminal text-glow-red">TARGET REACHED</span>
                        </div>
                    </div>
                </div>
            </div>
        `);

		if (Notification.permission === "granted" && $storage.has(`notifications:npck:${notify.label}`)) {
			$(`#${notify.id}`).val($storage.get(`notifications:npck:${notify.label}`));
		}

		// Remove invalid class on focus for all inputs
		inputs.forEach((input) => {
			$(`#${input.id}`).on("focus", function () {
				$(this).removeClass("invalid");
			});
		});

		// REQUEST NOTIFICATION PERMISSION
		$(`#${notify.id}`).on("change", function () {
			const value = $(this).val();
			$storage.set(`notifications:npck:${notify.label}`, value);

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

		$("[data-npckills-calculate]").on("click touchstart", function () {
			const currValue = currInp.$().val() as string;
			const wantValue = wantInp.$().val() as string;
			const npcsValue = npcsInp.$().val() as string;

			// Remove invalid class from all inputs first
			currInp.$().removeClass("invalid");
			wantInp.$().removeClass("invalid");
			npcsInp.$().removeClass("invalid");

			// Validate all inputs
			const currValidation = isValidNumber(currValue, "CURRENT KILLS");
			const wantValidation = isValidNumber(wantValue, "WANTED KILLS");
			const npcsValidation = isValidNumber(npcsValue, "AMOUNT OF NPC PER SPAWN");

			// Check for validation errors
			let hasError = false;

			if (!currValidation.isValid) {
				toast.error(currValidation.error || "Invalid CURRENT KILLS value");
				currInp.$().addClass("invalid");
				hasError = true;
			}

			if (!wantValidation.isValid) {
				toast.error(wantValidation.error || "Invalid WANTED KILLS value");
				wantInp.$().addClass("invalid");
				hasError = true;
			}

			if (!npcsValidation.isValid) {
				toast.error(npcsValidation.error || "Invalid AMOUNT OF NPC PER SPAWN value");
				npcsInp.$().addClass("invalid");
				hasError = true;
			}

			if (hasError) {
				return; // Stop calculation if any input is invalid
			}

			const curr = currValidation.parsed;
			const want = wantValidation.parsed;
			const npcs = npcsValidation.parsed;

			// Check for logical errors
			if (curr > want) {
				toast.error("Wanted kills must be greater than current kills");
				wantInp.$().addClass("invalid");
				return;
			}

			if (npcs === 0) {
				toast.error("Amount of NPC per spawn cannot be 0");
				npcsInp.$().addClass("invalid");
				return;
			}

			const kpm = npcs * config.npcKPM;
			const killsRemaining = Math.max(0, want - curr);

			// Handle case where kills per minute is 0 (shouldn't happen with validation above)
			if (kpm === 0) {
				toast.error("Kills per minute is 0. Check your inputs.");
				$("[data-npck-kpm-label]").text("0");
				$("[data-npck-krem-label]").text(convertNum(killsRemaining.toFixed(2), "format"));
				$("[data-npck-ttr-label]").text("NO PROGRESS");
				return;
			}

			const minutesNeeded = killsRemaining / kpm;

			$("[data-npck-kpm-label]").text(kpm.toFixed(2));
			$("[data-npck-krem-label]").text(convertNum(killsRemaining.toFixed(2), "format"));

			clearInterval(state.timeToReachTargetInterval);
			let remainingSeconds = Math.floor(minutesNeeded * 60);

			// If already at target
			if (remainingSeconds <= 0) {
				$("[data-npck-ttr-label]").text("TARGET REACHED");
				$("[data-npck-krem-label]").text("0");
				if (notify.$().val() === "ENABLED") {
					new Notification(config.header, {
						body: "Target kills has been reached!",
						icon: "/icons/icon-256.png",
					});
				}
				return;
			}

			state.timeToReachTargetInterval = setInterval(() => {
				if (remainingSeconds === 0) {
					clearInterval(state.timeToReachTargetInterval);
					state.timeToReachTargetInterval = 0;
					$("[data-npck-ttr-label]").text("TARGET REACHED");
					$("[data-npck-krem-label]").text("0");
					if (notify.$().val() === "ENABLED") {
						new Notification(config.header, {
							body: "Target kills has been reached!",
							icon: "/icons/icon-256.png",
						});
					}
					return;
				}

				$("[data-npck-krem-label]").text(convertNum(Math.floor((remainingSeconds / 60) * kpm), "format"));
				$("[data-npck-ttr-label]").text(humanizeDuration(Duration.fromObject({ seconds: remainingSeconds })));
				remainingSeconds--;
			}, 1_000);
		});

		return id;
	},
};
