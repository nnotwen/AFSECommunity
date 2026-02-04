import $ from "jquery";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import type { AutoClickEntry, Champion, CommandSubGroup, GachaEntry, Quest } from "./types/data";
import { generateUniqueId } from "./utils/idGenerator";

import calculator from "./tabs/calculator/entry";
import dashboard from "./tabs/dashboard";
import champion from "./tabs/champion";
import codes from "./tabs/codes";
import commands from "./tabs/commands";
import powerskill from "./tabs/powerskill";
import questline from "./tabs/questline";
import specials from "./tabs/specials";
import autotrain from "./tabs/autotrain";
import credits from "./tabs/credits";
import gacha from "./tabs/gacha";
import { backgroundMusic } from "./components/audiomanager";
import $storage from "./components/storage";

const tabsBase = [
	{ icon: "bi-terminal", label: "DASHBOARD", active: true },
	{ icon: "bi-calculator", label: "CALCULATOR" },
	{ icon: "bi-lightning-charge", label: "POWERS" },
	{ icon: "bi-cpu", label: "CHAMPIONS" },
	{ icon: "bi-dice-5", label: "GACHA" },
	{ icon: "bi-code-slash", label: "CODES" },
	{ icon: "bi-people", label: "CREDITS" },
	{ icon: "bi-star", label: "SPECIALS" },
	{ icon: "bi-flag", label: "QUESTS" },
	{ icon: "bi-terminal-fill", label: "COMMANDS" },
	{ icon: "bi-robot", label: "AUTO TRAIN" },
] as const;

$(function () {
	$(".animation-typing-caret").each((idx, e) => {
		const $element = $(e);
		const chars: string[] = $element.text().split("");
		const view: string[] = [];
		$element.text("");

		const interval = setInterval(() => {
			const newchar = chars.shift();
			if (!newchar) return clearInterval(interval);

			view.push(newchar);
			$element.text(`${view.join("")}`);
		}, 100);
	});

	$("#init").on("click", function () {
		$(this).fadeOut("slow", function () {
			$(this).remove();
			$("body").removeClass("overflow-hidden");
			init();
		});
	});
});

function init() {
	// initialize bgm
	backgroundMusic();

	const tabs: ((typeof tabsBase)[number] & { active?: boolean; btnId: string; contentId: string })[] = tabsBase.map((x) => ({
		btnId: generateUniqueId(),
		contentId: generateUniqueId(),
		...x,
	}));

	tabs.forEach((tab) => {
		// Initialize Navigation Buttons
		$("[data-main-navbar]").append(/*html*/ `
            <button id=${tab.btnId} class="cyber-tab ${tab.active ? "active" : ""}">
                <i class="bi ${tab.icon}"></i>
                <span class="hidden md:inline">${tab.label}</span>
            </button>
        `);

		// Initialize tab content
		$("[data-main-content]").append(/*html*/ `
            <div id=${tab.contentId} data-content-loaded="false" class="cyber-card w-100" style="${tab.active ? "" : "display:none;"}">
                <div data-spinner="true" class="d-flex gap-4 justify-center items-center flex-column">
                    <div class="spinner-border text-2xl" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <span class="text-3xl text-glow-blue cyber-font">Loading ${tab.label}...</span>
                </div>
            </div>
        `);
	});

	$("[data-main-navbar] button").on("click", function () {
		const btnId = $(this).attr("id");
		const tab = tabs.find((x) => x.btnId === btnId);

		if (!tab) throw new Error(`Unable to find content for btnId="${btnId}"`);
		$storage.set("tabs:navigation:lastVisited", tab.label);

		$("[data-main-navbar] button").each((_, el) => {
			$(el)[$(el).attr("id") === btnId ? "addClass" : "removeClass"]("active");
		});

		$("[data-main-content] > div").each((_, el) => {
			if ($(el).attr("id") === tab.contentId) {
				$(el).fadeIn("slow");
			} else {
				$(el).hide();
			}
		});
	});

	// LOAD DASHBOARD TAB @ src/tabs/dashboard.ts
	const dashboardTab = tabs.find((x) => x.label === "DASHBOARD")!;
	$.getJSON("./data/config.json")
		.done((data: Record<string, any>) => dashboard.render(data, dashboardTab.contentId))
		.fail((_, textStatus, error) => console.error("Error loading config.json:", textStatus, error));

	// LOAD CALC TAB @ src/tabs/calculator/entry.ts
	const calcTab = tabs.find((x) => x.label === "CALCULATOR")!;
	calculator.render(calcTab.contentId);

	// LOAD POWER SKILL TAB @ src/tabs/powerskill.ts
	const powerskillTab = tabs.find((x) => x.label === "POWERS")!;
	$.getJSON("./data/powerskill.json")
		.done((data: Record<string, { name: string; val: string }[]>) => powerskill.render(data, powerskillTab.contentId, powerskillTab.label))
		.fail((_, textStatus, error) => console.error("Error loading powerskill.json:", textStatus, error));

	// LOAD CHAMPION TAB @ src/tabs/champion.ts
	const championTab = tabs.find((x) => x.label === "CHAMPIONS")!;
	$.getJSON("./data/champion.json")
		.done((data: Champion[]) => champion.render(data, championTab.contentId, championTab.label))
		.fail((_, textStatus, error) => console.error("Error loading champions.json:", textStatus, error));

	// LOAD GACHA TAB @ src/tabs/gacha.ts
	const gachaTab = tabs.find((x) => x.label === "GACHA")!;
	$.getJSON("./data/gacha.json")
		.done((data: { location: GachaEntry[]; tokens: GachaEntry[] }) => gacha.render(data, gachaTab.contentId, gachaTab.label))
		.fail((_, textStatus, error) => console.error("Error loading questline.json:", textStatus, error));

	// LOAD CODES TAB @ src/tabs/codes.ts
	const codesTab = tabs.find((x) => x.label === "CODES")!;
	$.getJSON("./data/codes.json")
		.done((data: string[]) => codes.render(data, codesTab.contentId, codesTab.label))
		.fail((_, textStatus, error) => console.error("Error loading codes.json:", textStatus, error));

	// LOAD CREDITS TAB @ src/tabs/credits.ts
	const creditsTab = tabs.find((x) => x.label === "CREDITS")!;
	credits.render(creditsTab.contentId);

	// LOAD SPECIALS TAB @ src/tabs/specials.ts
	const specialsTab = tabs.find((x) => x.label === "SPECIALS")!;
	$.getJSON("./data/specials.json")
		.done((data: Record<string, { name: string; abilities: string[] }[]>) => specials.render(data, specialsTab.contentId, specialsTab.label))
		.fail((_, textStatus, error) => console.error("Error loading specials.json:", textStatus, error));

	// LOAD QUESTLINE TAB @ src/tabs/questline.ts
	const questlineTab = tabs.find((x) => x.label === "QUESTS")!;
	$.getJSON("./data/questline.json")
		.done((data: Record<string, Quest[]>) => questline.render(data, questlineTab.contentId, questlineTab.label))
		.fail((_, textStatus, error) => console.error("Error loading questline.json:", textStatus, error));

	// LOAD COMMANDS TAB @ src/tabs/commands.ts
	const commandsTab = tabs.find((x) => x.label === "COMMANDS")!;
	$.getJSON("./data/commands.json")
		.done((data: Record<string, CommandSubGroup>) => commands.render(data, commandsTab.contentId, commandsTab.label))
		.fail((_, textStatus, error) => console.error("Error loading commands.json:", textStatus, error));

	// LOAD AUTO TRAIN TAB @ src/tabs/powerskill.ts
	const autotrainTab = tabs.find((x) => x.label === "AUTO TRAIN")!;
	$.getJSON("./data/autoclick.json")
		.done((data: AutoClickEntry[]) => autotrain.render(data, autotrainTab.contentId, autotrainTab.label))
		.fail((_, textStatus, error) => console.error("Error loading specials.json:", textStatus, error));

	if ($storage.has("tabs:navigation:lastVisited")) {
		const label = $storage.get("tabs:navigation:lastVisited");
		const id = tabs.find((x) => x.label === label)?.btnId;

		$(`#${id}`).trigger("click");
	}
}
