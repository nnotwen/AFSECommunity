import $ from "jquery";
import { generateUniqueId } from "../../utils/idGenerator";
import { buildFloatingInput, buildSelectInput, FloatingInputOptions } from "../../components/forms";
import $storage from "../../components/storage";
import toast from "../../components/toast";
import { convertNum, humanizeDuration } from "./helper";
import { Duration } from "luxon";

const config = {
	header: "CHIKARA CALCULATOR",
};

const state = {
	timeToReachTargetInterval: 0,
};

const selectClasses = {
	labelClassName: "text-terminal text-cyber-yellow text-glow-yellow",
	selectClassName: "cyber-select-yellow",
};

const targetCrateOpt: FloatingInputOptions = {
	type: "text",
	placeholder: "0",
	labelClassName: "text-terminal text-cyber-yellow text-glow-yellow",
	inputClassName: "cyber-input cyber-input-yellow input-no-spinner text-terminal",
};
const targetCrates = buildFloatingInput("VALUE OF CRATES TO CLICK/TAP", targetCrateOpt);

const chikaraGamePass = buildSelectInput({
	label: "2X CHIKARA GAMEPASS",
	selectOptions: [{ value: "DISABLED" }, { value: "ENABLED" }],
	...selectClasses,
});

const notify = {
	label: "TARGET REACHEDs",
	...buildSelectInput({
		label: "TARGET REACHED",
		selectOptions: [{ value: "DISABLED" }, { value: "ENABLED" }],
		...selectClasses,
	}),
};

export default {
	render(appendTo: string) {
		const id = generateUniqueId();

		$(appendTo).append(/*html*/ `
            <div id="${id}" class="cyber-card cyber-card-yellow">
                <h2 class="text-2xl font-bold mb-6 text-glow-yellow">${config.header}</h2>
                <div class="my-3" data-bs-theme="dark">
                    <span class="d-block font-bold text-glow-yellow text-lg">TARGET SETTINGS</span>
                    <div class="row g-2">
                        <div class="col-sm-6">${targetCrates.input}</div>
                        <div class="col-sm-6">${chikaraGamePass.input}</div>
                    </div>
                    <div class="my-3" data-bs-theme="dark">
                        <span class="d-block font-bold text-glow-yellow text-lg">BROWSER NOTIFICATIONS</span>
                        <div class="row g-2">
                            <div class="col-sm-6 col-md-4">${notify.input}</div>
                        </div>
                    </div>
                    <div class="mt-5 mb-3">
                        <button data-chikara-calculate="true" class="cyber-btn cyber-btn-yellow w-100"><i class="bi bi-calculator me-2"></i>CALCULATE</button>
                    </div>
                    <div class="my-3 stats-display stats-display-yellow">
                        <div class="row g-2">
                            <div class="col-md-6 col-lg-4">
                                <span class="d-block text-sm text-terminal text-cyber-yellow text-glow-yellow">TOTAL CRATES</span>
                                <span data-chikara-crates-label="true" class="d-block text-xl text-terminal text-glow-yellow">--</span>
                            </div>
                            <div class="col-md-6 col-lg-4">
                                <span class="d-block text-sm text-terminal text-cyber-yellow text-glow-yellow">CHIKARA RANGE</span>
                                <span data-chikara-range-label="true" class="d-block text-xl text-terminal text-glow-yellow">--</span>
                            </div>
                            <div class="col-md-6 col-lg-4">
                                <span class="d-block text-sm text-terminal text-cyber-yellow text-glow-yellow">AVERAGE CHIKARA</span>
                                <span data-chikara-average-label="true" class="d-block text-xl text-terminal text-glow-yellow">--</span>
                            </div>
                            <div class="col-md-6 col-lg-4">
                                <span class="d-block text-sm text-terminal text-cyber-yellow text-glow-yellow">TOTAL TIME</span>
                                <span data-chikara-time-label="true" class="d-block text-xl text-terminal text-glow-yellow">--</span>
                            </div>
                            <div class="col-md-6 col-lg-4">
                                <span class="d-block text-sm text-terminal text-cyber-yellow text-glow-yellow">TIME REMAINING</span>
                                <span data-chikara-time-rem-label="true" class="d-block text-xl text-terminal text-glow-yellow">--</span>
                            </div>
                            <div class="col-md-6 col-lg-4">
                                <span class="d-block text-sm text-terminal text-cyber-yellow text-glow-yellow">GAME PASS STATUS</span>
                                <span data-chikara-gamepass-label="true" class="d-block text-xl text-terminal text-glow-yellow">--</span>
                            </div>
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

		targetCrates.$().on("focus", function () {
			$(this).removeClass("invalid");
		});

		$("[data-chikara-calculate]").on("click touchstart", function () {
			const $targetCrates = targetCrates.$();

			if (!($targetCrates.val() as string).length) {
				$targetCrates.val(targetCrateOpt.placeholder!);
			}

			const crateVal = convertNum($targetCrates.val() as string, "parse");
			if (isNaN(crateVal) || crateVal <= 0) {
				$targetCrates.addClass("invalid");
				toast.error(`Invalid value for value of crates!`);
				return;
			}

			const chikaraRange = chikaraGamePass.$().val() === "ENABLED" ? { min: 500, max: 600 } : { min: 200, max: 300 };
			const chikaraMinRange = Math.floor(chikaraRange.min * crateVal);
			const chikaraMaxRange = Math.floor(chikaraRange.max * crateVal);
			const chikaraAveRange = Math.floor((chikaraMaxRange + chikaraMinRange) / 2);
			const totalSeconds = crateVal * 60;

			$("[data-chikara-crates-label").text(crateVal);
			$("[data-chikara-range-label]").text(`${convertNum(chikaraMinRange, "format")} - ${convertNum(chikaraMaxRange, "format")}`);
			$("[data-chikara-average-label]").text(convertNum(chikaraAveRange, "format"));
			$("[data-chikara-time-rem-label], [data-chikara-time-label]").text(Duration.fromObject({ seconds: totalSeconds }).toFormat("d'D' hh:mm:ss"));

			const gamepassEnabled = chikaraGamePass.$().val() === "ENABLED";
			$("[data-chikara-gamepass-label]")
				.removeClass("text-glow-yellow")
				.removeClass(gamepassEnabled ? "text-glow-red" : "text-glow-green")
				.addClass(gamepassEnabled ? "text-glow-green" : "text-glow-red")
				.text(gamepassEnabled ? "ACTIVE" : "INACTIVE");

			clearInterval(state.timeToReachTargetInterval);
			let remainingSeconds = totalSeconds;

			state.timeToReachTargetInterval = setInterval(() => {
				if (remainingSeconds === 0) {
					clearInterval(state.timeToReachTargetInterval);
					state.timeToReachTargetInterval = 0;
					$("[data-chikara-time-label]").text("TARGET REACHED");
					$("[data-chikara-time-rem-label]").text("0D 00:00:00");
					if (notify.$().val() === "ENABLED") {
						new Notification(config.header, {
							body: "Target crates has been reached!",
							icon: "/icons/icon-256.png",
						});
					}
					return;
				}

				$("[data-chikara-time-rem-label]").text(Duration.fromObject({ seconds: remainingSeconds }).toFormat("d'D' hh:mm:ss"));
				remainingSeconds--;
			}, 1_000);
		});

		return id;
	},
};
