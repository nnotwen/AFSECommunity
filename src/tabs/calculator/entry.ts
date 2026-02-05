import $ from "jquery";
import tabStats from "./tab-stats";
import tabIncremental from "./tab-incremental";
import tabNpckills from "./tab-npckills";
import tabYen from "./tab-yen";
import { generateUniqueId } from "../../utils/idGenerator";
import tabChikara from "./tab-chikara";
import { Tooltip } from "bootstrap";

export default {
	render(id: string) {
		const selector = `#${id}`;
		$(selector).removeClass("cyber-card").addClass("flex flex-column gap-4").html("");

		// append stats calculator
		const statsCalcId = tabStats.render(selector);
		const statsCalcTabBtnId = generateUniqueId();

		// append incremental calculator
		const incCalcId = tabIncremental.render(selector);
		const incCalcTabBtnId = generateUniqueId();

		// append npc kills calculator
		const npckillsCalcId = tabNpckills.render(selector);
		const npckillsCalcTabBtnId = generateUniqueId();

		// append yen calculator
		const yenCalcId = tabYen.render(selector);
		const yenCalcTabBtnId = generateUniqueId();

		// append chikara calculator
		const chikaraCalcId = tabChikara.render(selector);
		const chikaraCalcTabBtnId = generateUniqueId();

		// Hide other calculators on init
		$(`#${statsCalcId}`).siblings().not("[data-calc-navigation]").hide(0);

		$(selector).prepend(/*html*/ `
			<div data-calc-navigation="true" class="tab-bar rounded-3 justify-center" data-bs-theme="dark">
				<button id="${statsCalcTabBtnId}" class="cyber-tab active"><i class="bi bi-bar-chart"></i></button>
				<button id="${incCalcTabBtnId}" class="cyber-tab cyber-tab-purple"><i class="bi bi-diagram-3"></i></button>
				<button id="${npckillsCalcTabBtnId}" class="cyber-tab cyber-tab-red"><bi class="bi bi-crosshair"></bi></button>
				<button id="${yenCalcTabBtnId}" class="cyber-tab cyber-tab-pink"><i class="bi bi-currency-yen"></i></button>
				<button id="${chikaraCalcTabBtnId}" class="cyber-tab cyber-tab-yellow"><i class="bi bi-gem"></i></button>
			</div>
		`);

		new Tooltip(`#${statsCalcTabBtnId}`, {
			animation: true,
			title: "STATS CALCULATOR",
			customClass: "bg-dark-2 text-glow-blue bg-opacity-90 border-cyber border-opacity-30 rounded text-terminal tracking-widest",
			placement: "bottom",
		});

		new Tooltip(`#${incCalcTabBtnId}`, {
			animation: true,
			title: "INCREMENTAL CALCULATOR",
			customClass: "bg-dark-2 text-glow-purple bg-opacity-90 border-cyber border-cyber-purple border-opacity-30 rounded text-terminal tracking-widest",
			placement: "bottom",
			trigger: "hover",
		});

		new Tooltip(`#${npckillsCalcTabBtnId}`, {
			animation: true,
			title: "NPC KILLS FARMING CALCULATOR",
			customClass: "bg-dark-2 text-glow-red bg-opacity-90 border-cyber border-cyber-red border-opacity-30 rounded text-terminal tracking-widest",
			placement: "bottom",
			trigger: "hover",
		});

		new Tooltip(`#${yenCalcTabBtnId}`, {
			animation: true,
			title: "YEN CALCULATOR",
			customClass: "bg-dark-2 text-glow-pink bg-opacity-90 border-cyber border-cyber-pink border-opacity-30 rounded text-terminal tracking-widest",
			placement: "bottom",
			trigger: "hover",
		});

		new Tooltip(`#${chikaraCalcTabBtnId}`, {
			animation: true,
			title: "CHIKARA CALCULATOR",
			customClass: "bg-dark-2 text-glow-yellow bg-opacity-90 border-cyber border-cyber-yellow border-opacity-30 rounded text-terminal tracking-widest",
			placement: "bottom",
			trigger: "hover",
		});

		$([statsCalcTabBtnId, incCalcTabBtnId, npckillsCalcTabBtnId, yenCalcTabBtnId, chikaraCalcTabBtnId].map((x) => `#${x}`).join(", ")).on(
			"click touchstart",
			function () {
				$(this).siblings().removeClass("active");
				$(this).addClass("active");

				let $tab;
				if ($(this).attr("id") === statsCalcTabBtnId) {
					$tab = $(`#${statsCalcId}`);
				} else if ($(this).attr("id") === incCalcTabBtnId) {
					$tab = $(`#${incCalcId}`);
				} else if ($(this).attr("id") === npckillsCalcTabBtnId) {
					$tab = $(`#${npckillsCalcId}`);
				} else if ($(this).attr("id") === yenCalcTabBtnId) {
					$tab = $(`#${yenCalcId}`);
				} else if ($(this).attr("id") === chikaraCalcTabBtnId) {
					$tab = $(`#${chikaraCalcId}`);
				}

				console.log($tab?.attr(id));

				$tab?.siblings().not("[data-calc-navigation]").hide(0);
				$tab?.fadeIn("slow");
			},
		);
	},
};
