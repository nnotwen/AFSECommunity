import $ from "jquery";
import { buildFloatingInput, buildSelectInput } from "../../components/forms";
import $storage from "../../components/storage";
import toast from "../../components/toast";
import { convertNum, humanizeDuration, validateInput } from "./helper";
import { Duration } from "luxon";
import { generateUniqueId } from "../../utils/idGenerator";

const config = {
	header: "NPC KILLS FARMING CALCULATOR",
	npcKPM: 20, // 60 seconds / 3 seconds = 20 kills per minute
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
		placeholder: "1",
	},
	{
		label: "WANTED KILLS",
		placeholder: "20",
	},
	{
		label: "NUMBER OF UNITS",
		placeholder: "1",
	},
] as const;

const selectKeys = [
	{
		label: "SPAWN TYPE",
		selectOptions: [{ value: "NPC" }, { value: "MINIBOSS" }],
	},
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
			{ label: "STALKER", value: "2700" },
			{ label: "OBESSESED", value: "3000" },
			{ label: "WEIRDLY OBSESSED", value: "3375" },
		],
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

// Add Champ Heart Multi as a separate input
const champHeartMultiInput = {
	label: "CHAMP HEART MULTI",
	...buildFloatingInput("CHAMP HEART MULTI", {
		type: "text",
		placeholder: "1",
		...inputClasses,
	}),
} as const;

// Add Current Heart and Required Heart as separate inputs
const currentHeartInput = {
	label: "CURRENT HEART",
	...buildFloatingInput("CURRENT HEART", {
		type: "text",
		placeholder: "0",
		...inputClasses,
	}),
} as const;

const requiredHeartInput = {
	label: "REQUIRED HEART",
	...buildFloatingInput("REQUIRED HEART", {
		type: "text",
		placeholder: "0",
		...inputClasses,
	}),
} as const;

export default {
	render(appendTo: string) {
		const id = generateUniqueId();

		const currInp = inputs.find((x) => x.label === "CURRENT KILLS")!;
		const wantInp = inputs.find((x) => x.label === "WANTED KILLS")!;
		const spawnType = selects.find((x) => x.label === "SPAWN TYPE")!;
		const unitsInp = inputs.find((x) => x.label === "NUMBER OF UNITS")!;
		const notify = selects.find((x) => x.label === "TARGET REACHED")!;
		const doubleTokens = selects.find((x) => x.label === "2X TOKENS")!;
		const heartsMultiplier = selects.find((x) => x.label === "HEARTS MULTIPLIER")!;

		const statInputs = inputs.map((x) => /*html*/ `<div class="col-sm-6 col-md-4">${x.input}</div>`);

		$(appendTo).append(/*html*/ `
            <div id="${id}" class="cyber-card cyber-card-red">
                <h2 class="text-2xl font-bold mb-6 text-glow-red">${config.header}</h2>
                
                <!-- STATS SECTION -->
                <div class="my-3" data-bs-theme="dark">
                    <span class="d-block font-bold text-glow-red text-lg">STATS</span>
                    <div class="row g-2">
						<div class="col-sm-6 col-md-4">${currInp.input}</div>
						<div class="col-sm-6 col-md-4">${wantInp.input}</div>
						<div class="col-sm-6 col-md-4">${spawnType.input}</div>
						<div class="col-sm-6 col-md-4">${unitsInp.input}</div>
                        <div class="col-sm-6 col-md-4">${doubleTokens.input}</div>
                    </div>
                </div>
                
                <!-- Separator between STATS and HEART CALCULATION -->
                <div class="separator separator-red my-4"></div>
                
                <!-- HEART CALCULATION SECTION -->
                <div class="my-3" data-bs-theme="dark">
                    <span class="d-block font-bold text-glow-red text-lg">HEART CALCULATION</span>
                    <div class="row g-2">
                        <div class="col-sm-6 col-md-4">${heartsMultiplier.input}</div>
                        <div class="col-sm-6 col-md-4">${champHeartMultiInput.input}</div>
                        <div class="col-sm-6 col-md-4">${currentHeartInput.input}</div>
                        <div class="col-sm-6 col-md-4">${requiredHeartInput.input}</div>
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

				<div class="mt-5 mb-3 row g-2">
					<!-- NPC KILLS RESULTS -->
					<div class="col-12 col-md-6 d-flex flex-column">
						<button data-npckills-calculate="true" class="cyber-btn cyber-btn-red w-100"><i class="bi bi-calculator me-2"></i>CALCULATE NPC KILLS</button>
						<div class="my-3 stats-display stats-display-red flex-grow-1">
							<div class="row g-2">
								<div class="col-md-6">
									<span class="d-block text-sm text-terminal text-cyber-red text-glow-red">KILLS/MIN</span>
									<span data-npck-kpm-label="true" class="d-block text-xl text-terminal text-glow-red">0</span>
								</div>
								<div class="col-md-6">
									<span class="d-block text-sm text-terminal text-cyber-red text-glow-red">UNIT KILL REMAINING</span>
									<span data-npck-krem-label="true" class="d-block text-xl text-terminal text-glow-red">0</span>
								</div>
								<div class="col-md-6">
									<span class="d-block text-sm text-terminal text-cyber-red text-glow-red">SPAWN TYPE</span>
									<span data-npck-type-rem-label="true" class="d-block text-xl text-terminal text-glow-red">0</span>
								</div>
								<div class="col-md-6">
									<span class="d-block text-sm text-terminal text-cyber-red text-glow-red">UNIT HEARTS</span>
									<span data-npck-unit-hearts-label="true" class="d-block text-xl text-terminal text-glow-red">0</span>
								</div>
								<div class="col-md-6">
									<span class="d-block text-sm text-terminal text-cyber-red text-glow-red">TOKEN TYPE</span>
									<span data-npck-token-type-label="true" class="d-block text-xl text-terminal text-glow-red">0</span>
								</div>
								<div class="col-md-6">
									<span class="d-block text-sm text-terminal text-cyber-red text-glow-red">TOKEN AMOUNT</span>
									<span data-npck-expc-token-label="true" class="d-block text-xl text-terminal text-glow-red">0</span>
								</div>
								<div class="col-12">
									<span class="d-block text-sm text-terminal text-cyber-red text-glow-red">TIME NEEDED</span>
									<span data-npck-ttr-label="true" class="d-block text-xl text-terminal text-glow-red">TARGET REACHED</span>
								</div>
							</div>
						</div>
					</div>
					<!-- HEART CALCULATION RESULTS -->
					<div class="col-12 col-md-6 d-flex flex-column">
						<button data-hearts-calculate="true" class="cyber-btn cyber-btn-red w-100"><i class="bi bi-calculator me-2"></i>CALCULATE HEARTS</button>
						<div class="my-3 stats-display stats-display-red flex-grow-1">
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
				</div>
            </div>
        `);

		// Load saved values
		if (Notification.permission === "granted" && $storage.has(`notifications:npck:${notify.label}`)) {
			notify.$().val($storage.get(`notifications:npck:${notify.label}`));
		}

		if ($storage.has(`multiplier:npck:${doubleTokens.label}`)) {
			doubleTokens.$().val($storage.get(`multiplier:npck:${doubleTokens.label}`));
		}

		heartsMultiplier.$().val($storage.get(`heartsMultiplier:npck:${heartsMultiplier.label}`) ?? "3000");
		champHeartMultiInput.$().val($storage.get(`champHeartMulti:npck`) ?? "1");
		currentHeartInput.$().val($storage.get(`currentHeart:npck`) ?? "");
		requiredHeartInput.$().val($storage.get(`requiredHeart:npck`) ?? "");

		$([...inputs.map((x) => x.id), champHeartMultiInput.id, currentHeartInput.id, requiredHeartInput.id].map((x) => `#${x}`).join(", ")).on(
			"focus",
			function () {
				$(this).removeClass("invalid");
			},
		);

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

		const savedSettings = [doubleTokens, heartsMultiplier, champHeartMultiInput, currentHeartInput, requiredHeartInput] as const;
		$(savedSettings.map((x) => `#${x.id}`).join(", ")).on("change", function () {
			const input = savedSettings.find((x) => x.id === $(this).attr("id"))!;
			const value = $(this).val() as string;

			$storage.set(`multiplier:npck:${input.label}`, value);

			if ([doubleTokens.id, heartsMultiplier.id].includes($(this).attr("id")!)) {
				toast.info(`${input.label} set to ${value}.`);
			}
		});

		// CALCULATE BUTTON FOR NPC KILLS
		$("[data-npckills-calculate]").on("click touchstart", function () {
			let isValid = true;
			const values: { label: (typeof inputs)[number]["label"]; value: number }[] = [];

			// Validate input values
			for (const input of inputs) {
				const { parsed, error } = validateInput(input.$().val() as string, input.label);

				if (error) {
					isValid = false;
					toast.error(error);
					input.$().addClass("invalid");
				}

				values.push({ label: input.label, value: parsed });
			}

			if (!isValid) return toast.error("Please fix invalid inputs before calculating.");

			// Clear existing intervals
			clearInterval(state.timeToReachTargetInterval);
			state.timeToReachTargetInterval = 0;

			// Parse all values
			const curr = values.find((v) => v.label === "CURRENT KILLS")?.value!;
			const want = values.find((v) => v.label === "WANTED KILLS")?.value!;
			const spawnTypeVal = spawnType.$().val() as (typeof selectKeys)[0]["selectOptions"][number]["value"];
			const units = values.find((v) => v.label === "NUMBER OF UNITS")?.value!;
			const isDoubleTokens = doubleTokens.$().val() === "ENABLED";

			// Inner validation: Validate only if values are provided
			// Check for logical errors only if both current and wanted kills are provided
			if (curr > want) {
				toast.error("Wanted kills must be greater than current kills");
				wantInp.$().addClass("invalid");
				isValid = false;
				return;
			}

			if (units === 0) {
				toast.error("Amount of units per spawn cannot be 0");
				unitsInp.$().addClass("invalid");
				return;
			}

			const effectiveKPM = units * config.npcKPM;
			const killsRemaining = Math.max(0, want - curr);

			// Calculate expected tokens (33% drop rate)
			let expectedTokens = 0,
				npcHearts = 0,
				miniBossHearts = 0;

			if (spawnTypeVal === "NPC") {
				// Gacha Tokens only from regular NPCs
				expectedTokens = killsRemaining * 0.33 * (isDoubleTokens ? 2 : 1);
				// Calculate NPC hearts (20% drop rate, 50 hearts each)
				npcHearts = killsRemaining * 0.2 * 50;
			} else {
				// Valentine's Token calculation - 25% drop rate from Mini Bosses only
				expectedTokens = killsRemaining * 0.25 * (isDoubleTokens ? 2 : 1);
				// Calculate NPC hearts (20% drop rate, 150 hearts each)
				miniBossHearts = killsRemaining * 0.2 * 150;
			}

			// Update stats display
			$("[data-npck-kpm-label]").text(effectiveKPM.toFixed(2));
			$("[data-npck-krem-label]").text(convertNum(killsRemaining, "format"));
			$("[data-npck-type-rem-label]").text(spawnTypeVal);
			$("[data-npck-unit-hearts-label]").text(convertNum(spawnTypeVal === "NPC" ? npcHearts : miniBossHearts, "format"));
			$("[data-npck-expc-token-label]").text(convertNum(expectedTokens, "format"));
			$("[data-npck-token-type-label]").text(spawnTypeVal === "NPC" ? "GACHA TOKENS" : "VALENTINE'S TOKENS");

			const minutesNeeded = killsRemaining / effectiveKPM;
			let remainingSeconds = Math.floor(minutesNeeded * 60);
			$("[data-npck-ttr-label]").text(humanizeDuration(Duration.fromObject({ seconds: remainingSeconds })));

			// Clear any existing interval first
			clearInterval(state.timeToReachTargetInterval);

			// Start NPC kills countdown
			state.timeToReachTargetInterval = setInterval(() => {
				if (remainingSeconds <= 0) {
					clearInterval(state.timeToReachTargetInterval);
					state.timeToReachTargetInterval = 0;
					$("[data-npck-ttr-label]").text("TARGET REACHED");
					$("[data-npck-krem-label]").text("0");
					$("[data-npck-type-rem-label]").text("0");

					if (notify.$().val() === "ENABLED") {
						new Notification(config.header, {
							body: "Target kills has been reached!",
							icon: "/icons/icon-256.png",
						});
					}
					return;
				}

				// Update remaining kills
				const currentKillsRemaining = Math.floor((remainingSeconds / 60) * effectiveKPM);
				$("[data-npck-krem-label]").text(convertNum(currentKillsRemaining, "format"));
				$("[data-npck-ttr-label]").text(humanizeDuration(Duration.fromObject({ seconds: remainingSeconds })));
				remainingSeconds--;
			}, 1_000);
		});

		// CALCULATE BUTTON FOR HEART
		$("[data-hearts-calculate]").on("click touchstart", function () {
			let isValid = true;
			const heartInputs = [champHeartMultiInput, currentHeartInput, requiredHeartInput];
			const values: { label: (typeof heartInputs)[number]["label"]; value: number }[] = [];
			const defaultVals: Record<string, number> = {
				"CHAMP HEART MULTI": 1,
			};

			// Setup default values
			for (const [k, v] of Object.entries(defaultVals)) {
				const input = heartInputs.find((x) => (k as (typeof heartInputs)[number]["label"]) === x.label);
				if (!input) return;
				input.$().val(v);
			}

			// Validate input values
			for (const input of heartInputs) {
				const { parsed, error } = validateInput(input.$().val() as string, input.label);

				if (error) {
					isValid = false;
					toast.error(error);
					input.$().addClass("invalid");
				}

				values.push({ label: input.label, value: parsed });
			}

			if (!isValid) return toast.error("Please fix invalid inputs before calculating.");
			const heartsMultiplier = selects.find((x) => x.label === "HEARTS MULTIPLIER")!;

			// Parse values
			const heartsMultiplierValue = parseInt(heartsMultiplier.$().val() as string) || 1;
			const champHeartMulti = values.find((x) => x.label === "CHAMP HEART MULTI")!;
			const currentHeart = values.find((x) => x.label === "CURRENT HEART")!;
			const requiredHeart = values.find((x) => x.label === "REQUIRED HEART")!;

			if (champHeartMulti.value > requiredHeart.value) {
				return toast.warning("Current heart is already at or above required heart!");
			}

			// Calculate Hearts Per Min
			const heartsPerMin = heartsMultiplierValue * champHeartMulti.value;
			// Calculate Heart Remaining (difference between required and current)
			const heartRemaining = Math.max(0, requiredHeart.value - currentHeart.value);

			// Clear existing timeout
			const notifyValue = notify.$().val() as Extract<(typeof selectKeys)[number], { label: "TARGET REACHED" }>["selectOptions"][number]["value"];
			clearInterval(state.heartCountdownInterval);
			state.heartCountdownInterval = 0;

			$("[data-npck-hearts-per-min-label]").text(heartsPerMin.toFixed(2));
			$("[data-npck-heart-remaining-label]").text(convertNum(heartRemaining, "format"));

			let heartRemainingSeconds = Math.ceil((heartRemaining / heartsPerMin) * 60);
			state.heartCountdownInterval = setInterval(() => {
				if (heartRemainingSeconds <= 0) {
					clearInterval(state.heartCountdownInterval);
					$("[data-npck-heart-time-label]").text("GOAL REACHED");
					$("[data-npck-hearts-per-min-label]").text("0");
					$("[data-npck-heart-remaining-label]").text("0");
					if (notifyValue === "ENABLED") {
						new Notification(config.header, {
							body: "Heart Goals has been reached!",
							icon: "/icons/icon-256.png",
						});
					}
					return;
				}

				const heartRemaining = Math.floor((heartRemainingSeconds / 60) * heartsPerMin);
				$("[data-npck-heart-time-label]").text(humanizeDuration(Duration.fromObject({ seconds: heartRemainingSeconds })));
				$("[data-npck-heart-remaining-label]").text(convertNum(heartRemaining, "format"));

				heartRemainingSeconds--;
			}, 1_000);
		});

		return id;
	},
};
