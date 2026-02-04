import $ from "jquery";
import { buildFloatingInput, buildSelectInput } from "../../components/forms";
import $storage from "../../components/storage";
import toast from "../../components/toast";
import { convertNum, humanizeDuration } from "./helper";
import { Duration } from "luxon";
import { generateUniqueId } from "../../utils/idGenerator";

const config = {
	header: "YEN CALCULATOR",
};

const state = {
	timeToReachTargetInterval: 0,
};

const data = [
	{ value: 5, label: "FIGHTER" },
	{ value: 10, label: "SHINOBI" },
	{ value: 25, label: "PIRATE" },
	{ value: 50, label: "GHOUL" },
	{ value: 100, label: "HERO" },
	{ value: 500, label: "REAPER" },
	{ value: 1e3, label: "SAIYAN" },
	{ value: 25e2, label: "SIN" },
	{ value: 1e4, label: "MAGI" },
	{ value: 45e3, label: "AKUMA" },
	{ value: 1e5, label: "YONKO" },
	{ value: 25e4, label: "GOROSEI" },
	{ value: 75e4, label: "OVERLORD" },
	{ value: 45e5, label: "HOKAGE" },
	{ value: 25e6, label: "KAIOSHIN" },
	{ value: 15e7, label: "SAGE" },
	{ value: 5e8, label: "ESPADA" },
	{ value: 75e8, label: "SHINIGAMI" },
	{ value: 3e10, label: "HASHIRA" },
	{ value: 15e10, label: "HAKAISHIN" },
	{ value: 45e10, label: "OTSTSUTSUKI" },
	{ value: 135e10, label: "PIRATE KING" },
	{ value: 405e10, label: "KISHIN" },
	{ value: 1215e10, label: "ANGEL" },
	{ value: 6075e10, label: "DEMON KING" },
	{ value: 3037e11, label: "ULTRA INSTINCT" },
	{ value: 1518e12, label: "UPPER MOON" },
];

const inputClasses = {
	labelClassName: "text-terminal text-cyber-pink text-glow-pink",
	inputClassName: "cyber-input cyber-input-pink input-no-spinner text-terminal",
};

const selectClasses = {
	selectClassName: "cyber-select-pink",
	labelClassName: "text-cyber-pink text-glow-pink",
};

const inputKeys = [
	{
		label: "CHAMP YEN MULTI",
		placeholder: "1M",
	},
	{
		label: "CURRENT YEN",
		placeholder: "100M",
	},
	{
		label: "REQUIRED YEN",
		placeholder: "10B",
	},
] as const;

const selectKeys = [
	{
		label: "RANK MULTIPLIER",
		selectOptions: data.map((x) => ({ value: `${x.value}`, label: x.label })),
		...selectClasses,
	},
	{
		label: "x2 YEN GAMEPASS",
		selectOptions: [{ value: "DISABLED" }, { value: "ENABLED" }],
		...selectClasses,
	},
	{
		label: "NEN MULTIPLIER",
		selectOptions: [
			{ label: "NONE (1x)", value: "1" },
			{ label: "E (1.05x)", value: "1.05" },
			{ label: "D (1.1x)", value: "1.1" },
			{ label: "C (1.15x)", value: "1.15" },
			{ label: "B (1.2x)", value: "1.2" },
			{ label: "A (1.25x)", value: "1.25" },
		],
		...selectClasses,
	},
	{
		label: "HERO MULTIPLIER",
		selectOptions: [
			{ label: "NONE (1x)", value: "1" },
			{ label: "E (1.05x)", value: "1.05" },
			{ label: "D (1.1x)", value: "1.1" },
			{ label: "C (1.15x)", value: "1.15" },
			{ label: "B (1.2x)", value: "1.2" },
			{ label: "A (1.25x)", value: "1.25" },
			{ label: "S (1.3x)", value: "1.3" },
		],
		...selectClasses,
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

		const champYenMulti = inputs.find((x) => x.label === "CHAMP YEN MULTI")!;
		const currYen = inputs.find((x) => x.label === "CURRENT YEN")!;
		const wantYen = inputs.find((x) => x.label === "REQUIRED YEN")!;
		const rankMulti = selects.find((x) => x.label === "RANK MULTIPLIER")!;
		const x2GamePass = selects.find((x) => x.label === "x2 YEN GAMEPASS")!;
		const yenMulti = selects.find((x) => x.label === "NEN MULTIPLIER")!;
		const heroMulti = selects.find((x) => x.label === "HERO MULTIPLIER")!;
		const notify = selects.find((x) => x.label === "TARGET REACHED")!;

		const statInputs = inputs.map((x) => /*html*/ `<div class="col-sm-6 col-md-4">${x.input}</div>`);
		const statSelect = selects.filter((x) => x.label !== "TARGET REACHED").map((x) => /*html*/ `<div class="col-sm-6 col-md-4">${x.input}</div>`);

		$(appendTo).append(/*html*/ `
            <div id="${id}" class="cyber-card cyber-card-pink">
                <h2 class="text-2xl font-bold mb-6 text-glow-pink">${config.header}</h2>
                <div class="my-3" data-bs-theme="dark">
                    <span class="d-block font-bold text-glow-pink text-lg">STATS</span>
                    <div class="row g-2">
                        ${statInputs.join("")}
                        ${statSelect.join("")}
                    </div>
                </div>
                <div class="my-3" data-bs-theme="dark">
                    <span class="d-block font-bold text-glow-pink text-lg">BROWSER NOTIFICATIONS</span>
                    <div class="row g-2">
                        <div class="col-sm-6 col-md-4">${notify.input}</div>
                    </div>
                </div>
                <div class="mt-5 mb-3">
                    <button data-yen-calculate="true" class="cyber-btn cyber-btn-pink w-100"><i class="bi bi-calculator me-2"></i>CALCULATE</button>
                </div>
                <div class="my-3 stats-display stats-display-pink">
                    <div class="row g-2">
                        <div class="col-md-6">
                            <span class="d-block text-sm text-terminal text-cyber-pink text-glow-pink">BASE YEN / MIN</span>
                            <span data-yen-bypm-label="true" class="d-block text-xl text-terminal text-glow-pink">0</span>
                        </div>
                        <div class="col-md-6">
                            <span class="d-block text-sm text-terminal text-cyber-pink text-glow-pink">YEN / MIN</span>
                            <span data-yen-ypm-label="true" class="d-block text-xl text-terminal text-glow-pink">0</span>
                        </div>
                        <div class="col-md-6">
                            <span class="d-block text-sm text-terminal text-cyber-pink text-glow-pink">TIME REQUIRED</span>
                            <span data-yen-ttr-label="true" class="d-block text-xl text-terminal text-glow-pink">TARGET REACHED</span>
                        </div>
                    </div>
                </div>
            </div>
        `);

		if (Notification.permission === "granted" && $storage.has(`notifications:yen:${notify.label}`)) {
			$(`#${notify.id}`).val($storage.get(`notifications:yen:${notify.label}`));
		}

		// REQUEST NOTIFICATION PERMISSION
		$(`#${notify.id}`).on("change", function () {
			const value = $(this).val();
			$storage.set(`notifications:yen:${notify.label}`, value);

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

		$("[data-yen-calculate]").on("click", function () {
			const $champYen = champYenMulti.$();
			const $currYen = currYen.$();
			const $wantYen = wantYen.$();

			// Assign default values if input are empty
			for (const $$ of [$champYen, $currYen, $wantYen]) {
				if (!($$.val() as string).length) {
					$$.val(inputKeys.find((x) => x.label === inputs.find((y) => y.id === $$.attr("id"))!.label)!.placeholder);
				}
			}

			const curr = convertNum($currYen.val() as string, "parse");
			const want = convertNum($wantYen.val() as string, "parse");

			if (curr > want) {
				toast.error("Wanted yen must be greater than current yen.");
				return $wantYen.addClass("invalid");
			}

			const baseVal = convertNum(rankMulti.$().val() as string, "parse") * (x2GamePass.$().val() === "ENABLED" ? 2 : 1);
			const total =
				baseVal *
				parseFloat(yenMulti.$().val() as string) *
				parseFloat(heroMulti.$().val() as string) *
				convertNum(champYenMulti.$().val() as string, "parse");

			const minutesNeeded = Math.max(0, (want - curr) / total);

			$("[data-yen-bypm-label]").text(convertNum(baseVal, "format"));
			$("[data-yen-ypm-label]").text(convertNum(total, "format"));

			clearInterval(state.timeToReachTargetInterval);
			let remainingSeconds = Math.floor(minutesNeeded * 60);

			state.timeToReachTargetInterval = setInterval(() => {
				if (remainingSeconds === 0) {
					clearInterval(state.timeToReachTargetInterval);
					state.timeToReachTargetInterval = 0;
					$("[data-yen-ttr-label]").text("TARGET REACHED");
					if (notify.$().val() === "ENABLED") {
						new Notification(config.header, {
							body: "Required coins have been reached!",
							icon: "/icons/icon-256.png",
						});
					}
					return;
				}

				$("[data-yen-ttr-label]").text(humanizeDuration(Duration.fromObject({ seconds: remainingSeconds })));
				remainingSeconds--;
			}, 1_000);
		});

		return id;
	},
};
