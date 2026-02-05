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
	},
	{
		label: "WANTED KILLS",
		placeholder: "20",
	},
	{
		label: "AMOUNT OF NPC PER SPAWN",
		placeholder: "4",
	},
] as const;

const selectKeys = [
	{
		label: "TARGET REACHED",
		selectOptions: [{ value: "DISABLED" }, { value: "ENABLED" }],
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

		const devalidatedIdsLabels = ["WANTED KILLS"] as const;
		const devalidatedIds = devalidatedIdsLabels.map((x) => inputs.find((y) => y.label === x)!.id);
		$(devalidatedIds.map((id) => `#${id}`).join(", ")).on("focus", function () {
			$(this).removeClass("invalid");
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
			const $curr = currInp.$();
			const $want = wantInp.$();
			const $npcs = npcsInp.$();

			// Assign default values if input are empty
			for (const $$ of [$curr, $want, $npcs]) {
				if (!($$.val() as string).length) {
					$$.val(inputKeys.find((x) => x.label === inputs.find((y) => y.id === $$.attr("id"))!.label)!.placeholder);
				}
			}

			const curr = convertNum($curr.val() as string, "parse");
			const want = convertNum($want.val() as string, "parse");
			const npcs = convertNum($npcs.val() as string, "parse");

			const kpm = npcs * config.npcKPM;
			const killsRemaining = Math.max(0, want - curr);
			const minutesNeeded = killsRemaining / kpm;

			if (curr > want) {
				toast.error("Wanted kills must be greater than current kills");
				return $want.addClass("invalid");
			}

			$("[data-npck-kpm-label]").text(kpm.toFixed(2));
			$("[data-npck-krem-label]").text(convertNum(killsRemaining.toFixed(2), "format"));

			clearInterval(state.timeToReachTargetInterval);
			let remainingSeconds = Math.floor(minutesNeeded * 60);

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
