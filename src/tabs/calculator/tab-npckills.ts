import $ from "jquery";
import { buildFloatingInput, buildSelectInput } from "../../components/forms";
import $storage from "../../components/storage";
import toast from "../../components/toast";
import { convertNum, humanizeDuration, validateInput } from "./helper";
import { Duration } from "luxon";
import { generateUniqueId } from "../../utils/idGenerator";

const config = {
	header: "NPC KILLS FARMING CALCULATOR",
	npcKPM: 20, // NPC Kills Per Minute
};

const state = {
	timeToReachTargetInterval: 0,
	heartCountdownInterval: 0,
	heartRemainingSeconds: 0,
	lastHeartCalculation: {
		heartRemaining: 0,
		heartsPerMin: 0,
	},
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
		placeholder: "1 (Optional)",
	},
	{
		label: "WANTED KILLS",
		placeholder: "20 (Optional)",
	},
	{
		label: "NPC PER SPAWN",
		placeholder: "4 (Optional)",
	},
	{
		label: "MINI BOSS PER SPAWN",
		placeholder: "1 (Optional)",
	},
] as const;

const selectKeys = [
	{
		label: "TARGET REACHED",
		selectOptions: [{ value: "DISABLED" }, { value: "ENABLED" }],
	},
	{
		label: "2X TOKENS",
		selectOptions: [{ value: "DISABLED" }, { value: "ENABLED" }],
	},
	{
		label: "HEARTS MULTIPLIER",
		selectOptions: [
			{ label: "NONE", value: "1500" },
			{ label: "CRUSH", value: "1800" },
			{ label: "IN LOVE", value: "2100" },
			{ label: "SUPER IN LOVE", value: "2400" },
			{ label: "OBESSESED", value: "2700" },
			{ label: "WEIRDLY OBSSESED", value: "3000" },
		],
	},
];

const inputs = inputKeys.map(({ label, placeholder }) => ({
	label,
	...buildFloatingInput(label, { type: "text", placeholder, ...inputClasses }),
}));

const selects = selectKeys.map(({ label, selectOptions }) => ({
	label,
	...buildSelectInput({ label, selectOptions: [...selectOptions], ...selectClasses }),
}));

// Add Champ Heart Multi as a separate input
const champHeartMultiInput = {
	label: "CHAMP HEART MULTI",
	...buildFloatingInput("CHAMP HEART MULTI", {
		type: "text",
		placeholder: "1",
		...inputClasses,
	}),
};

// Add Current Heart and Required Heart as separate inputs
const currentHeartInput = {
	label: "CURRENT HEART",
	...buildFloatingInput("CURRENT HEART", {
		type: "text",
		placeholder: "0",
		...inputClasses,
	}),
};

const requiredHeartInput = {
	label: "REQUIRED HEART",
	...buildFloatingInput("REQUIRED HEART", {
		type: "text",
		placeholder: "0",
		...inputClasses,
	}),
};

// List of valid suffixes (uppercase)
const VALID_SUFFIXES = ["K", "M", "B", "T", "QD", "QN", "SX", "SP", "OC", "N", "DE", "UD", "DD"];

// SIMPLE AND RELIABLE NUMBER PARSER
function parseNumberWithSuffix(value: string): number {
	if (!value || value.trim() === "") return 0;

	// Convert to uppercase and remove all commas and spaces
	const cleanValue = value.trim().toUpperCase().replace(/,/g, "").replace(/\s/g, "");

	// Define suffix multipliers
	const suffixMultipliers: Record<string, number> = {
		K: 1000,
		M: 1000000,
		B: 1000000000,
		T: 1000000000000,
		QD: 1000000000000000,
		QN: 1000000000000000000,
		SX: 1e21,
		SP: 1e24,
		OC: 1e27,
		N: 1e30,
		DE: 1e33,
		UD: 1e36,
		DD: 1e39,
	};

	// Check if value ends with a valid suffix
	for (const suffix of VALID_SUFFIXES) {
		if (cleanValue.endsWith(suffix)) {
			// Extract the numeric part before the suffix
			const numericPart = cleanValue.substring(0, cleanValue.length - suffix.length);
			const number = parseFloat(numericPart);

			if (!isNaN(number) && numericPart !== "") {
				return number * suffixMultipliers[suffix];
			}
		}
	}

	// If no valid suffix found, try to parse as plain number
	const number = parseFloat(cleanValue);
	if (!isNaN(number)) {
		return number;
	}

	return 0;
}

// VALIDATION FUNCTION - Checks if input is valid
function isValidNumberInput(value: string): { isValid: boolean; error?: string } {
	if (!value || value.trim() === "") {
		return { isValid: true }; // Empty is valid (optional field)
	}

	const trimmed = value.trim().toUpperCase().replace(/,/g, "").replace(/\s/g, "");

	// Check for empty string after trimming
	if (trimmed === "") {
		return { isValid: true };
	}

	// Check for negative numbers
	if (trimmed.startsWith("-")) {
		return {
			isValid: false,
			error: "Negative numbers are not allowed. Please enter a positive value.",
		};
	}

	// Check if it's just a number (no suffix)
	const plainNumber = parseFloat(trimmed);
	if (!isNaN(plainNumber) && trimmed.match(/^[0-9]*\.?[0-9]+$/)) {
		return { isValid: true };
	}

	// Check for valid suffix patterns
	for (const suffix of VALID_SUFFIXES) {
		const suffixPattern = new RegExp(`^[0-9]*\\.?[0-9]+${suffix}$`);
		if (suffixPattern.test(trimmed)) {
			return { isValid: true };
		}
	}

	// Check for invalid suffix
	const invalidSuffixMatch = trimmed.match(/^[0-9]*\.?[0-9]+([A-Z]+)$/);
	if (invalidSuffixMatch) {
		const foundSuffix = invalidSuffixMatch[1];
		return {
			isValid: false,
			error: `Invalid suffix "${foundSuffix}". Valid suffixes are: ${VALID_SUFFIXES.join(", ")}`,
		};
	}

	// Check for completely non-numeric input
	const hasNumbers = trimmed.match(/[0-9]/);
	if (!hasNumbers) {
		return {
			isValid: false,
			error: "Invalid input. Please enter a valid number (e.g., 1000, 1K, 2.5M, etc.)",
		};
	}

	// Default invalid case
	return {
		isValid: false,
		error: "Invalid format. Use: 1000, 1K, 500k, 5M, 2.5M, 3B, etc.",
	};
}

// Helper function to validate number input with parsing
function validateNumberInput(value: string, inputName: string): { isValid: boolean; parsedValue: number; error?: string } {
	if (!value || value.trim() === "") {
		return { isValid: true, parsedValue: 0 };
	}

	const validation = isValidNumberInput(value);
	if (!validation.isValid) {
		return {
			isValid: false,
			parsedValue: 0,
			error: `${inputName}: ${validation.error}`,
		};
	}

	const parsedValue = parseNumberWithSuffix(value);
	return { isValid: true, parsedValue };
}

// Helper function to format number with suffix for display
function formatNumberWithSuffix(num: number): string {
	if (num === 0) return "0";
	if (num < 1000) return num.toLocaleString();

	const suffixes = ["", "K", "M", "B", "T", "Qd", "Qn", "Sx", "Sp", "Oc", "N", "De", "Ud", "Dd"];
	const tier = Math.floor(Math.log10(num) / 3);

	if (tier === 0) return num.toLocaleString();

	const suffix = suffixes[tier];
	const scale = Math.pow(10, tier * 3);
	const scaled = num / scale;

	// Format to 2 decimal places if needed
	return scaled.toFixed(2).replace(/\.?0+$/, "") + suffix;
}

// Function to update heart countdown display
function updateHeartCountdownDisplay() {
	if (state.heartRemainingSeconds <= 0) {
		$("[data-npck-heart-time-label]").text("GOAL REACHED");
		return;
	}

	const duration = Duration.fromObject({ seconds: state.heartRemainingSeconds });
	$("[data-npck-heart-time-label]").text(humanizeDuration(duration));
}

// Function to start or update heart countdown
function startHeartCountdown(heartRemaining: number, heartsPerMin: number) {
	// Clear existing interval
	clearInterval(state.heartCountdownInterval);

	if (heartRemaining <= 0 || heartsPerMin <= 0) {
		$("[data-npck-heart-time-label]").text("GOAL REACHED");
		state.heartRemainingSeconds = 0;
		state.heartCountdownInterval = 0;
		return;
	}

	// Calculate initial time needed in seconds
	state.heartRemainingSeconds = Math.ceil((heartRemaining / heartsPerMin) * 60);
	state.lastHeartCalculation.heartRemaining = heartRemaining;
	state.lastHeartCalculation.heartsPerMin = heartsPerMin;

	// Update display immediately
	updateHeartCountdownDisplay();

	// Start countdown interval
	state.heartCountdownInterval = setInterval(() => {
		if (state.heartRemainingSeconds <= 0) {
			clearInterval(state.heartCountdownInterval);
			state.heartCountdownInterval = 0;
			$("[data-npck-heart-time-label]").text("GOAL REACHED");

			// Trigger notification if enabled
			const notify = selects.find((x) => x.label === "TARGET REACHED")!;
			if (notify && notify.$().val() === "ENABLED") {
				new Notification(config.header, {
					body: "Heart goal has been reached!",
					icon: "/icons/icon-256.png",
				});
			}
			return;
		}

		state.heartRemainingSeconds--;
		updateHeartCountdownDisplay();

		// Update heart remaining value in real-time
		if (state.lastHeartCalculation.heartsPerMin > 0) {
			const heartsGained = state.lastHeartCalculation.heartsPerMin / 60; // Hearts per second
			const newHeartRemaining = Math.max(0, state.lastHeartCalculation.heartRemaining - heartsGained);
			state.lastHeartCalculation.heartRemaining = newHeartRemaining;

			// Update display
			$("[data-npck-heart-remaining-label]").text(formatNumberWithSuffix(newHeartRemaining));
		}
	}, 1000);
}

// Function to recalculate heart stats (ONLY CALLED FROM CALCULATE BUTTON)
function recalculateHeartStats() {
	const heartsMultiplier = selects.find((x) => x.label === "HEARTS MULTIPLIER")!;
	const champHeartMultiValue = champHeartMultiInput.$().val() as string;
	const currentHeartValue = currentHeartInput.$().val() as string;
	const requiredHeartValue = requiredHeartInput.$().val() as string;

	// Validate champ heart multi
	const champHeartMultiValidation = validateNumberInput(champHeartMultiValue, "Champ Heart Multi");
	if (!champHeartMultiValidation.isValid) {
		champHeartMultiInput.$().addClass("invalid");
		toast.error(champHeartMultiValidation.error!);
		return;
	}
	champHeartMultiInput.$().removeClass("invalid");

	// Validate current heart
	const currentHeartValidation = validateNumberInput(currentHeartValue, "Current Heart");
	if (!currentHeartValidation.isValid) {
		currentHeartInput.$().addClass("invalid");
		toast.error(currentHeartValidation.error!);
		return;
	}
	currentHeartInput.$().removeClass("invalid");

	// Validate required heart
	const requiredHeartValidation = validateNumberInput(requiredHeartValue, "Required Heart");
	if (!requiredHeartValidation.isValid) {
		requiredHeartInput.$().addClass("invalid");
		toast.error(requiredHeartValidation.error!);
		return;
	}
	requiredHeartInput.$().removeClass("invalid");

	// Parse values
	const heartsMultiplierValue = parseFloat(heartsMultiplier.$().val() as string) || 1500;
	const champHeartMulti = champHeartMultiValidation.parsedValue || 1;
	const currentHeart = currentHeartValidation.parsedValue;
	const requiredHeart = requiredHeartValidation.parsedValue;

	// Validate required heart > current heart
	if (requiredHeart > 0 && currentHeart >= requiredHeart) {
		$("[data-npck-heart-remaining-label]").text("0");
		$("[data-npck-hearts-per-min-label]").text(heartsMultiplierValue.toFixed(2));
		startHeartCountdown(0, heartsMultiplierValue * champHeartMulti);
		toast.info("Current heart is already at or above required heart!");
		return;
	}

	// Calculate Hearts Per Min
	const heartsPerMin = heartsMultiplierValue * champHeartMulti;

	// Calculate Heart Remaining (difference between required and current)
	const heartRemaining = Math.max(0, requiredHeart - currentHeart);

	// Update display
	$("[data-npck-hearts-per-min-label]").text(heartsPerMin.toFixed(2));
	$("[data-npck-heart-remaining-label]").text(formatNumberWithSuffix(heartRemaining));

	// Start or update countdown
	startHeartCountdown(heartRemaining, heartsPerMin);
}

// Function to validate all inputs before calculation
function validateAllInputs(): boolean {
	let allValid = true;

	// Validate NPC kill inputs
	inputs.forEach((input) => {
		const value = input.$().val() as string;
		if (value && value.trim() !== "") {
			const validation = isValidNumberInput(value);
			if (!validation.isValid) {
				input.$().addClass("invalid");
				toast.error(`${input.label}: ${validation.error}`);
				allValid = false;
			} else {
				input.$().removeClass("invalid");
			}
		}
	});

	// Validate champ heart multi
	const champHeartMultiValue = champHeartMultiInput.$().val() as string;
	if (champHeartMultiValue && champHeartMultiValue.trim() !== "") {
		const validation = isValidNumberInput(champHeartMultiValue);
		if (!validation.isValid) {
			champHeartMultiInput.$().addClass("invalid");
			toast.error(`CHAMP HEART MULTI: ${validation.error}`);
			allValid = false;
		} else {
			champHeartMultiInput.$().removeClass("invalid");
		}
	}

	// Validate current heart
	const currentHeartValue = currentHeartInput.$().val() as string;
	if (currentHeartValue && currentHeartValue.trim() !== "") {
		const validation = isValidNumberInput(currentHeartValue);
		if (!validation.isValid) {
			currentHeartInput.$().addClass("invalid");
			toast.error(`CURRENT HEART: ${validation.error}`);
			allValid = false;
		} else {
			currentHeartInput.$().removeClass("invalid");
		}
	}

	// Validate required heart
	const requiredHeartValue = requiredHeartInput.$().val() as string;
	if (requiredHeartValue && requiredHeartValue.trim() !== "") {
		const validation = isValidNumberInput(requiredHeartValue);
		if (!validation.isValid) {
			requiredHeartInput.$().addClass("invalid");
			toast.error(`REQUIRED HEART: ${validation.error}`);
			allValid = false;
		} else {
			requiredHeartInput.$().removeClass("invalid");
		}
	}

	return allValid;
}

export default {
	render(appendTo: string) {
		const id = generateUniqueId();

		const currInp = inputs.find((x) => x.label === "CURRENT KILLS")!;
		const wantInp = inputs.find((x) => x.label === "WANTED KILLS")!;
		const npcsInp = inputs.find((x) => x.label === "NPC PER SPAWN")!;
		const miniBossInp = inputs.find((x) => x.label === "MINI BOSS PER SPAWN")!;
		const notify = selects.find((x) => x.label === "TARGET REACHED")!;
		const doubleTokens = selects.find((x) => x.label === "2X TOKENS")!;
		const heartsMultiplier = selects.find((x) => x.label === "HEARTS MULTIPLIER")!;

		const statInputs = inputs.map((x) => /*html*/ `<div class="col-sm-6 col-md-4 col-lg-3">${x.input}</div>`);

		$(appendTo).append(/*html*/ `
            <div id="${id}" class="cyber-card cyber-card-red">
                <h2 class="text-2xl font-bold mb-6 text-glow-red">${config.header}</h2>
                
                <!-- STATS SECTION -->
                <div class="my-3" data-bs-theme="dark">
                    <span class="d-block font-bold text-glow-red text-lg">STATS</span>
                    <div class="row g-2">
                        ${statInputs.join("")}
                        <div class="col-sm-6 col-md-4 col-lg-3">${doubleTokens.input}</div>
                    </div>
                </div>
                
                <!-- Separator between STATS and HEART CALCULATION -->
                <div class="separator separator-red my-4"></div>
                
                <!-- HEART CALCULATION SECTION -->
                <div class="my-3" data-bs-theme="dark">
                    <span class="d-block font-bold text-glow-red text-lg">HEART CALCULATION</span>
                    <div class="row g-2">
                        <div class="col-sm-6 col-md-4 col-lg-3">${heartsMultiplier.input}</div>
                        <div class="col-sm-6 col-md-4 col-lg-3">${champHeartMultiInput.input}</div>
                        <div class="col-sm-6 col-md-4 col-lg-3">${currentHeartInput.input}</div>
                        <div class="col-sm-6 col-md-4 col-lg-3">${requiredHeartInput.input}</div>
                    </div>
                </div>
                
                <!-- Separator between HEART CALCULATION and BROWSER NOTIFICATIONS -->
                <div class="separator separator-red my-4"></div>
                
                <!-- BROWSER NOTIFICATIONS SECTION -->
                <div class="my-3" data-bs-theme="dark">
                    <span class="d-block font-bold text-glow-red text-lg">BROWSER NOTIFICATIONS</span>
                    <div class="row g-2">
                        <div class="col-sm-6 col-md-4">${notify.input}</div>
                    </div>
                </div>
                
                <!-- CALCULATE BUTTON -->
                <div class="mt-5 mb-3">
                    <button data-npckills-calculate="true" class="cyber-btn cyber-btn-red w-100"><i class="bi bi-calculator me-2"></i>CALCULATE</button>
                </div>
                
                <!-- NPC KILLS RESULTS -->
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
                            <span class="d-block text-sm text-terminal text-cyber-red text-glow-red">MINI BOSS REMAINING</span>
                            <span data-npck-miniboss-rem-label="true" class="d-block text-xl text-terminal text-glow-red">0</span>
                        </div>
                        <div class="col-md-6">
                            <span class="d-block text-sm text-terminal text-cyber-red text-glow-red">TIME NEEDED</span>
                            <span data-npck-ttr-label="true" class="d-block text-xl text-terminal text-glow-red">TARGET REACHED</span>
                        </div>
                        <div class="col-md-6">
                            <span class="d-block text-sm text-terminal text-cyber-red text-glow-red">TOKEN</span>
                            <span data-npck-token-label="true" class="d-block text-xl text-terminal text-glow-red">0</span>
                        </div>
                        <div class="col-md-6">
                            <span class="d-block text-sm text-terminal text-cyber-red text-glow-red">NPC HEARTS</span>
                            <span data-npck-npc-hearts-label="true" class="d-block text-xl text-terminal text-glow-red">0</span>
                        </div>
                        <div class="col-md-6">
                            <span class="d-block text-sm text-terminal text-cyber-red text-glow-red">MINI BOSS HEARTS</span>
                            <span data-npck-miniboss-hearts-label="true" class="d-block text-xl text-terminal text-glow-red">0</span>
                        </div>
                    </div>
                </div>
                
                <!-- HEART CALCULATION RESULTS -->
                <div class="my-3 stats-display stats-display-red">
                    <div class="row g-2">
                        <div class="col-md-6">
                            <span class="d-block text-sm text-terminal text-cyber-red text-glow-red">HEARTS PER MIN</span>
                            <span data-npck-hearts-per-min-label="true" class="d-block text-xl text-terminal text-glow-red">0</span>
                        </div>
                        <div class="col-md-6">
                            <span class="d-block text-sm text-terminal text-cyber-red text-glow-red">HEART REMAINING</span>
                            <span data-npck-heart-remaining-label="true" class="d-block text-xl text-terminal text-glow-red">0</span>
                        </div>
                        <div class="col-md-12">
                            <span class="d-block text-sm text-terminal text-cyber-red text-glow-red">HEART TIME NEEDED</span>
                            <span data-npck-heart-time-label="true" class="d-block text-xl text-terminal text-glow-red">0</span>
                        </div>
                    </div>
                </div>
            </div>
        `);

		// Add CSS for the separator
		$(appendTo).append(/*html*/ `
			<style>
				.separator {
					height: 2px;
					background: linear-gradient(90deg, transparent, currentColor, transparent);
					margin: 1rem 0;
				}
				.separator-red {
					color: var(--cyber-red);
					box-shadow: 0 0 10px var(--cyber-red);
				}
				.stats-display {
					border: 1px solid var(--cyber-red);
					border-radius: 8px;
					padding: 15px;
					margin-bottom: 15px;
				}
				.stats-display-red {
					background: rgba(255, 0, 0, 0.05);
					border-color: var(--cyber-red);
					box-shadow: 0 0 10px rgba(255, 0, 0, 0.2);
				}
				.invalid {
					border-color: #ff3860 !important;
					box-shadow: 0 0 0 0.2rem rgba(255, 56, 96, 0.25) !important;
				}
			</style>
		`);

		// Load saved values
		if (Notification.permission === "granted" && $storage.has(`notifications:npck:${notify.label}`)) {
			$(`#${notify.id}`).val($storage.get(`notifications:npck:${notify.label}`));
		}

		if ($storage.has(`multiplier:npck:${doubleTokens.label}`)) {
			$(`#${doubleTokens.id}`).val($storage.get(`multiplier:npck:${doubleTokens.label}`));
		}

		if ($storage.has(`heartsMultiplier:npck:${heartsMultiplier.label}`)) {
			$(`#${heartsMultiplier.id}`).val($storage.get(`heartsMultiplier:npck:${heartsMultiplier.label}`));
		} else {
			$(`#${heartsMultiplier.id}`).val("3000"); // Default to WEIRDLY OBSESSED
		}

		if ($storage.has(`champHeartMulti:npck`)) {
			$(`#${champHeartMultiInput.id}`).val($storage.get(`champHeartMulti:npck`));
		} else {
			$(`#${champHeartMultiInput.id}`).val("1");
		}

		if ($storage.has(`currentHeart:npck`)) {
			$(`#${currentHeartInput.id}`).val($storage.get(`currentHeart:npck`));
		} else {
			// Set default example value - but don't calculate automatically
			$(`#${currentHeartInput.id}`).val("");
		}

		if ($storage.has(`requiredHeart:npck`)) {
			$(`#${requiredHeartInput.id}`).val($storage.get(`requiredHeart:npck`));
		} else {
			// Set default example value - but don't calculate automatically
			$(`#${requiredHeartInput.id}`).val("");
		}

		// Function to validate a single input (visual only, no calculation)
		function validateInputField($input: JQuery<HTMLElement>, fieldName: string) {
			const value = $input.val() as string;

			if (!value || value.trim() === "") {
				$input.removeClass("invalid");
				return true;
			}

			const validation = isValidNumberInput(value);
			if (validation.isValid) {
				$input.removeClass("invalid");
				return true;
			} else {
				$input.addClass("invalid");
				return false;
			}
		}

		// Set up validation for all text inputs (visual only, no calculation)
		const allTextInputs = [
			...inputs.map((input) => ({ $input: $(`#${input.id}`), name: input.label })),
			{ $input: $(`#${champHeartMultiInput.id}`), name: "CHAMP HEART MULTI" },
			{ $input: $(`#${currentHeartInput.id}`), name: "CURRENT HEART" },
			{ $input: $(`#${requiredHeartInput.id}`), name: "REQUIRED HEART" },
		];

		allTextInputs.forEach(({ $input, name }) => {
			// Validate on focus out (when user leaves the field)
			$input.on("blur", function () {
				validateInputField($(this), name);
			});

			// Validate on input change (real-time)
			$input.on("input", function () {
				const value = $(this).val() as string;

				if (!value || value.trim() === "") {
					$(this).removeClass("invalid");
					return;
				}

				const validation = isValidNumberInput(value);
				if (validation.isValid) {
					$(this).removeClass("invalid");
				} else {
					$(this).addClass("invalid");
				}
			});

			// Remove invalid class on focus
			$input.on("focus", function () {
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

		// Save 2x tokens setting - NO AUTO CALCULATION
		$(`#${doubleTokens.id}`).on("change", function () {
			const value = $(this).val();
			$storage.set(`multiplier:npck:${doubleTokens.label}`, value);

			const status = value === "ENABLED" ? "enabled" : "disabled";
			toast.info(`2X Tokens ${status}.`);
			// NO auto calculation - wait for CALCULATE button
		});

		// Save hearts multiplier setting - NO AUTO CALCULATION
		$(`#${heartsMultiplier.id}`).on("change", function () {
			const value = $(this).val();
			$storage.set(`heartsMultiplier:npck:${heartsMultiplier.label}`, value);

			const multiplierText = $(this).find("option:selected").text();
			toast.info(`Hearts Multiplier set to ${multiplierText}.`);
			// NO auto calculation - wait for CALCULATE button
		});

		// Save champ heart multi value - NO AUTO CALCULATION, just validation
		$(`#${champHeartMultiInput.id}`).on("change", function () {
			const value = $(this).val() as string;
			$storage.set(`champHeartMulti:npck`, value);

			// Only validate, don't calculate
			validateInputField($(this), "CHAMP HEART MULTI");
		});

		// Save current heart value - NO AUTO CALCULATION, just validation
		$(`#${currentHeartInput.id}`).on("change", function () {
			const value = $(this).val() as string;
			$storage.set(`currentHeart:npck`, value);

			// Only validate, don't calculate
			validateInputField($(this), "CURRENT HEART");
		});

		// Save required heart value - NO AUTO CALCULATION, just validation
		$(`#${requiredHeartInput.id}`).on("change", function () {
			const value = $(this).val() as string;
			$storage.set(`requiredHeart:npck`, value);

			// Only validate, don't calculate
			validateInputField($(this), "REQUIRED HEART");
		});

		// CALCULATE BUTTON - ONLY PLACE WHERE CALCULATIONS HAPPEN
		$("[data-npckills-calculate]").on("click touchstart", function () {
			// Validate all inputs before calculation
			if (!validateAllInputs()) {
				toast.error("Please fix invalid inputs before calculating.");
				return;
			}

			const currValue = currInp.$().val() as string;
			const wantValue = wantInp.$().val() as string;
			const npcsValue = npcsInp.$().val() as string;
			const miniBossValue = miniBossInp.$().val() as string;
			const isDoubleTokens = doubleTokens.$().val() === "ENABLED";

			// Clear existing intervals
			clearInterval(state.timeToReachTargetInterval);
			clearInterval(state.heartCountdownInterval);
			state.timeToReachTargetInterval = 0;
			state.heartCountdownInterval = 0;
			state.heartRemainingSeconds = 0;

			// Parse all values (all optional)
			const curr = parseNumberWithSuffix(currValue);
			const want = parseNumberWithSuffix(wantValue);
			const npcs = parseNumberWithSuffix(npcsValue);
			const miniBossPerSpawn = parseNumberWithSuffix(miniBossValue);

			// Validate only if values are provided
			let hasError = false;

			// Check for logical errors only if both current and wanted kills are provided
			if (curr > 0 && want > 0 && curr > want) {
				toast.error("Wanted kills must be greater than current kills");
				wantInp.$().addClass("invalid");
				hasError = true;
			}

			if (hasError) {
				return;
			}

			// Calculate NPC Kills Stats (only if we have kill data)
			if (curr > 0 || want > 0) {
				// Calculate KPM for both NPC types
				const npcKPM = npcs * config.npcKPM;
				const miniBossKPM = miniBossPerSpawn * config.npcKPM;
				const totalKPM = npcKPM + miniBossKPM;
				const effectiveKPM = totalKPM > 0 ? totalKPM : config.npcKPM;

				const killsRemaining = Math.max(0, want - curr);

				// Calculate expected tokens (33% drop rate)
				let expectedTokens = killsRemaining * 0.33;
				if (isDoubleTokens) {
					expectedTokens *= 2;
				}

				// Calculate expected hearts for NPCs (20% drop rate, 50 hearts each)
				const npcHearts = killsRemaining * 0.2 * 50;

				// Calculate expected hearts for Mini Bosses (20% drop rate, 150 hearts each)
				const miniBossHearts = killsRemaining * 0.2 * 150;

				// Update NPC kills results
				if (effectiveKPM === 0) {
					$("[data-npck-kpm-label]").text("0");
					$("[data-npck-krem-label]").text(formatNumberWithSuffix(killsRemaining));
					$("[data-npck-miniboss-rem-label]").text(formatNumberWithSuffix(killsRemaining));
					$("[data-npck-ttr-label]").text("NO PROGRESS");
				} else {
					$("[data-npck-kpm-label]").text(effectiveKPM.toFixed(2));
					$("[data-npck-krem-label]").text(formatNumberWithSuffix(killsRemaining));
					$("[data-npck-miniboss-rem-label]").text(formatNumberWithSuffix(killsRemaining));

					if (killsRemaining <= 0) {
						$("[data-npck-ttr-label]").text("TARGET REACHED");
					} else {
						const minutesNeeded = killsRemaining / effectiveKPM;
						let remainingSeconds = Math.floor(minutesNeeded * 60);
						$("[data-npck-ttr-label]").text(humanizeDuration(Duration.fromObject({ seconds: remainingSeconds })));

						// Start NPC kills countdown
						state.timeToReachTargetInterval = setInterval(() => {
							if (remainingSeconds <= 0) {
								clearInterval(state.timeToReachTargetInterval);
								state.timeToReachTargetInterval = 0;
								$("[data-npck-ttr-label]").text("TARGET REACHED");
								$("[data-npck-krem-label]").text("0");
								$("[data-npck-miniboss-rem-label]").text("0");

								if (notify.$().val() === "ENABLED") {
									new Notification(config.header, {
										body: "Target kills has been reached!",
										icon: "/icons/icon-256.png",
									});
								}
								return;
							}

							const currentKillsRemaining = Math.floor((remainingSeconds / 60) * effectiveKPM);
							$("[data-npck-krem-label]").text(formatNumberWithSuffix(currentKillsRemaining));
							$("[data-npck-miniboss-rem-label]").text(formatNumberWithSuffix(currentKillsRemaining));
							$("[data-npck-ttr-label]").text(humanizeDuration(Duration.fromObject({ seconds: remainingSeconds })));
							remainingSeconds--;
						}, 1_000);
					}
				}

				$("[data-npck-token-label]").text(formatNumberWithSuffix(expectedTokens));
				$("[data-npck-npc-hearts-label]").text(formatNumberWithSuffix(npcHearts));
				$("[data-npck-miniboss-hearts-label]").text(formatNumberWithSuffix(miniBossHearts));
			} else {
				// No kill data provided
				$("[data-npck-kpm-label]").text("N/A");
				$("[data-npck-krem-label]").text("N/A");
				$("[data-npck-miniboss-rem-label]").text("N/A");
				$("[data-npck-ttr-label]").text("N/A");
				$("[data-npck-token-label]").text("N/A");
				$("[data-npck-npc-hearts-label]").text("N/A");
				$("[data-npck-miniboss-hearts-label]").text("N/A");
			}

			// Calculate Heart Stats (ONLY HERE)
			recalculateHeartStats();

			// Show success message
			toast.success("Calculation completed!");
		});

		// REMOVED: Initial calculation with default values
		// No automatic calculation on page load

		return id;
	},
};
