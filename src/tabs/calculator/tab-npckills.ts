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
	},
	{
		label: "WANTED KILLS",
		placeholder: "20",
	},
	{
		label: "NPC PER SPAWN",
		placeholder: "4",
	},
	{
		label: "MINI BOSS PER SPAWN",
		placeholder: "1",
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
			{ label: "NONE (1x)", value: "1" },
			{ label: "E (1.2x)", value: "1.2" },
			{ label: "D (1.4x)", value: "1.4" },
			{ label: "C (1.6x)", value: "1.6" },
			{ label: "B (1.8x)", value: "1.8" },
			{ label: "A (2x)", value: "2" },
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
                <div class="my-3" data-bs-theme="dark">
                    <span class="d-block font-bold text-glow-red text-lg">STATS</span>
                    <div class="row g-2">
                        ${statInputs.join("")}
                        <div class="col-sm-6 col-md-4 col-lg-3">${doubleTokens.input}</div>
                        <div class="col-sm-6 col-md-4 col-lg-3">${heartsMultiplier.input}</div>
                    </div>
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
            </div>
        `);

		if (Notification.permission === "granted" && $storage.has(`notifications:npck:${notify.label}`)) {
			$(`#${notify.id}`).val($storage.get(`notifications:npck:${notify.label}`));
		}

		if ($storage.has(`multiplier:npck:${doubleTokens.label}`)) {
			$(`#${doubleTokens.id}`).val($storage.get(`multiplier:npck:${doubleTokens.label}`));
		}

		if ($storage.has(`heartsMultiplier:npck:${heartsMultiplier.label}`)) {
			$(`#${heartsMultiplier.id}`).val($storage.get(`heartsMultiplier:npck:${heartsMultiplier.label}`));
		} else {
			// Set default to NONE (1x)
			$(`#${heartsMultiplier.id}`).val("1");
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

		// Save 2x tokens setting with toast notification
		$(`#${doubleTokens.id}`).on("change", function () {
			const value = $(this).val();
			$storage.set(`multiplier:npck:${doubleTokens.label}`, value);

			// Show toast notification if timer is running
			if (state.timeToReachTargetInterval > 0) {
				const status = value === "ENABLED" ? "enabled" : "disabled";
				toast.info(`2X Tokens ${status}. Token count updated in real-time.`);
			}
		});

		// Save hearts multiplier setting with toast notification
		$(`#${heartsMultiplier.id}`).on("change", function () {
			const value = $(this).val();
			$storage.set(`heartsMultiplier:npck:${heartsMultiplier.label}`, value);

			// Show toast notification if timer is running
			if (state.timeToReachTargetInterval > 0) {
				const multiplierText = $(this).find("option:selected").text();
				toast.info(`Hearts Multiplier set to ${multiplierText}. Heart counts updated in real-time.`);
			}
		});

		$("[data-npckills-calculate]").on("click touchstart", function () {
			const currValue = currInp.$().val() as string;
			const wantValue = wantInp.$().val() as string;
			const npcsValue = npcsInp.$().val() as string;
			const miniBossValue = miniBossInp.$().val() as string;
			const isDoubleTokens = doubleTokens.$().val() === "ENABLED";
			const heartsMultiplierValue = parseFloat(heartsMultiplier.$().val() as string) || 1;

			// Remove invalid class from all inputs first
			currInp.$().removeClass("invalid");
			wantInp.$().removeClass("invalid");
			npcsInp.$().removeClass("invalid");
			miniBossInp.$().removeClass("invalid");

			// Validate all inputs
			const currValidation = validateInput(currValue, "CURRENT KILLS");
			const wantValidation = validateInput(wantValue, "WANTED KILLS");
			const npcsValidation = validateInput(npcsValue, "AMOUNT OF NPC PER SPAWN");
			const miniBossValidation = validateInput(miniBossValue, "AMOUNT OF MINI BOSS PER SPAWN");

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

			if (!miniBossValidation.isValid) {
				toast.error(miniBossValidation.error || "Invalid AMOUNT OF MINI BOSS PER SPAWN value");
				miniBossInp.$().addClass("invalid");
				hasError = true;
			}

			if (hasError) {
				return; // Stop calculation if any input is invalid
			}

			const curr = currValidation.parsed;
			const want = wantValidation.parsed;
			const npcs = npcsValidation.parsed;
			const miniBossPerSpawn = miniBossValidation.parsed;

			// Check for logical errors
			if (curr > want) {
				toast.error("Wanted kills must be greater than current kills");
				wantInp.$().addClass("invalid");
				return;
			}

			if (npcs === 0 && miniBossPerSpawn === 0) {
				toast.error("Amount of NPC per spawn or Mini Boss per spawn cannot both be 0");
				npcsInp.$().addClass("invalid");
				miniBossInp.$().addClass("invalid");
				return;
			}

			// Calculate KPM for both NPC types
			const npcKPM = npcs * config.npcKPM;
			const miniBossKPM = miniBossPerSpawn * config.npcKPM;
			const totalKPM = npcKPM + miniBossKPM;

			const killsRemaining = Math.max(0, want - curr);

			// Calculate expected tokens (33% drop rate)
			let expectedTokens = killsRemaining * 0.33;

			// Apply 2x multiplier if enabled
			if (isDoubleTokens) {
				expectedTokens *= 2;
			}

			// Calculate expected hearts for NPCs (20% drop rate, 50 hearts each)
			const npcHearts = killsRemaining * 0.2 * 50 * heartsMultiplierValue;

			// Calculate expected hearts for Mini Bosses (20% drop rate, 150 hearts each)
			const miniBossHearts = killsRemaining * 0.2 * 150 * heartsMultiplierValue;

			// Handle case where total kills per minute is 0
			if (totalKPM === 0) {
				toast.error("Total kills per minute is 0. Check your inputs.");
				$("[data-npck-kpm-label]").text("0");
				$("[data-npck-krem-label]").text(convertNum(killsRemaining.toFixed(2), "format"));
				$("[data-npck-miniboss-rem-label]").text(convertNum(killsRemaining.toFixed(2), "format"));
				$("[data-npck-ttr-label]").text("NO PROGRESS");
				$("[data-npck-token-label]").text(convertNum(expectedTokens.toFixed(2), "format"));
				$("[data-npck-npc-hearts-label]").text(convertNum(npcHearts.toFixed(2), "format"));
				$("[data-npck-miniboss-hearts-label]").text(convertNum(miniBossHearts.toFixed(2), "format"));
				return;
			}

			const minutesNeeded = killsRemaining / totalKPM;

			$("[data-npck-kpm-label]").text(totalKPM.toFixed(2));
			$("[data-npck-krem-label]").text(convertNum(killsRemaining.toFixed(2), "format"));
			$("[data-npck-miniboss-rem-label]").text(convertNum(killsRemaining.toFixed(2), "format"));
			$("[data-npck-token-label]").text(convertNum(expectedTokens.toFixed(2), "format"));
			$("[data-npck-npc-hearts-label]").text(convertNum(npcHearts.toFixed(2), "format"));
			$("[data-npck-miniboss-hearts-label]").text(convertNum(miniBossHearts.toFixed(2), "format"));

			clearInterval(state.timeToReachTargetInterval);
			let remainingSeconds = Math.floor(minutesNeeded * 60);

			// If already at target
			if (remainingSeconds <= 0) {
				$("[data-npck-ttr-label]").text("TARGET REACHED");
				$("[data-npck-krem-label]").text("0");
				$("[data-npck-miniboss-rem-label]").text("0");
				$("[data-npck-token-label]").text("0");
				$("[data-npck-npc-hearts-label]").text("0");
				$("[data-npck-miniboss-hearts-label]").text("0");
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
					$("[data-npck-miniboss-rem-label]").text("0");
					$("[data-npck-token-label]").text("0");
					$("[data-npck-npc-hearts-label]").text("0");
					$("[data-npck-miniboss-hearts-label]").text("0");
					if (notify.$().val() === "ENABLED") {
						new Notification(config.header, {
							body: "Target kills has been reached!",
							icon: "/icons/icon-256.png",
						});
					}
					return;
				}

				const currentKillsRemaining = Math.floor((remainingSeconds / 60) * totalKPM);
				let currentExpectedTokens = currentKillsRemaining * 0.33;
				const currentNpcHearts = currentKillsRemaining * 0.2 * 50 * heartsMultiplierValue;
				const currentMiniBossHearts = currentKillsRemaining * 0.2 * 150 * heartsMultiplierValue;

				// Apply 2x multiplier if enabled
				if (doubleTokens.$().val() === "ENABLED") {
					currentExpectedTokens *= 2;
				}

				$("[data-npck-krem-label]").text(convertNum(currentKillsRemaining, "format"));
				$("[data-npck-miniboss-rem-label]").text(convertNum(currentKillsRemaining, "format"));
				$("[data-npck-token-label]").text(convertNum(currentExpectedTokens.toFixed(2), "format"));
				$("[data-npck-npc-hearts-label]").text(convertNum(currentNpcHearts.toFixed(2), "format"));
				$("[data-npck-miniboss-hearts-label]").text(convertNum(currentMiniBossHearts.toFixed(2), "format"));
				$("[data-npck-ttr-label]").text(humanizeDuration(Duration.fromObject({ seconds: remainingSeconds })));
				remainingSeconds--;
			}, 1_000);
		});

		return id;
	},
};
