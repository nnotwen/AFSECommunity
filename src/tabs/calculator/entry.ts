import $ from "jquery";
import tabStats from "./tab-stats";
import tabIncremental from "./tab-incremental";
import tabNpckills from "./tab-npckills";
import tabYen from "./tab-yen";
import { generateUniqueId } from "../../utils/idGenerator";
import tabChikara from "./tab-chikara";

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
				<button id="${statsCalcTabBtnId}" class="cyber-tab active">STAT</button>
				<button id="${incCalcTabBtnId}" class="cyber-tab cyber-tab-purple">INC</button>
				<button id="${npckillsCalcTabBtnId}" class="cyber-tab cyber-tab-red">NPC</button>
				<button id="${yenCalcTabBtnId}" class="cyber-tab cyber-tab-pink">YEN</button>
				<button id="${chikaraCalcTabBtnId}" class="cyber-tab cyber-tab-yellow">CHIKARA</button>
			</div>
		`);

		$([statsCalcTabBtnId, incCalcTabBtnId, npckillsCalcTabBtnId, yenCalcTabBtnId, chikaraCalcTabBtnId].map((x) => `#${x}`).join(", ")).on(
			"click",
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
