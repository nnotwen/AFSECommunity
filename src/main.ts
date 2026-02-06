import $ from "jquery";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/cyber.css";

import type { AutoClickEntry, Champion, CommandSubGroup, DataConfig, GachaEntry, Quest, TrainingArea } from "./types/data";
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
import trainingarea from "./tabs/trainingareas";
import { backgroundMusic } from "./components/audiomanager";
import $storage from "./components/storage";
import { Tooltip } from "bootstrap";

const tabsBase = [
	{ icon: "bi-terminal", label: "DASHBOARD", active: true },
	{ icon: "bi-calculator", label: "CALCULATOR" },
	{ icon: "bi-lightning-charge", label: "POWERS" },
	{ icon: "bi-cpu", label: "CHAMPIONS" },
	{ icon: "bi-dice-5", label: "GACHA" },
	{ icon: "bi-geo-alt", label: "TRAINING AREAS" },
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

	$("#init").on("click touchstart", function () {
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

		// Add tooltip
		new Tooltip(`#${tab.btnId}`, {
			animation: true,
			title: tab.label,
			customClass: "bg-dark-2 text-glow-blue bg-opacity-90 border-cyber border-opacity-30 rounded text-terminal tracking-widest",
			placement: "bottom",
			trigger: "hover",
		});
	});

	$("[data-main-navbar] button").on("click touchstart", function (e) {
		e.preventDefault();

		const btnId = $(this).attr("id");
		const tab = tabs.find((x) => x.btnId === btnId);

		if (!tab) throw new Error(`Unable to find content for btnId="${btnId}"`);
		$storage.set("tabs:navigation:lastVisited", tab.label);

		// Highlight the active tab button
		$(this).addClass("active").siblings().removeClass("active");

		// Show the active tab and hide others
		$(`#${tab.contentId}`).siblings().hide(0);
		$(`#${tab.contentId}`).fadeIn("slow");

		// Load data on demand
		if ($(`#${tab.contentId}`).attr("data-content-loaded") === "false") {
			loadTab(tab.label);
		}

		$("html, body").animate({ scrollTop: "100vh" });
	});

	$(`#${tabs.find((x) => x.label === $storage.getOrSet("tabs:navigation:lastVisited", tabs[0].label))?.btnId}`)
		.trigger("click")
		.trigger("touchstart");

	// always load dashboard at the start
	loadTab("DASHBOARD");

	function loadTab(label: (typeof tabs)[number]["label"]) {
		const tab = tabs.find((x) => x.label === label)!;
		let dataHref, doneCallbackFn;

		switch (label) {
			case "DASHBOARD":
				dataHref = "./data/config.json";
				doneCallbackFn = (data: DataConfig) => dashboard.render(data, tab.contentId);
				break;
			case "CALCULATOR":
				doneCallbackFn = () => calculator.render(tab.contentId);
				break;
			case "POWERS":
				dataHref = "./data/powerskill.json";
				doneCallbackFn = (data: Record<string, { name: string; val: string }[]>) => powerskill.render(data, tab.contentId, tab.label);
				break;
			case "CHAMPIONS":
				dataHref = "./data/champion.json";
				doneCallbackFn = (data: Champion[]) => champion.render(data, tab.contentId, tab.label);
				break;
			case "GACHA":
				dataHref = "./data/gacha.json";
				doneCallbackFn = (data: { location: GachaEntry[]; tokens: GachaEntry[] }) => gacha.render(data, tab.contentId, tab.label);
				break;
			case "TRAINING AREAS":
				dataHref = "./data/trainingareas.json";
				doneCallbackFn = (data: TrainingArea[]) => trainingarea.render(data, tab.contentId, tab.label);
				break;
			case "CODES":
				dataHref = "./data/codes.json";
				doneCallbackFn = (data: string[]) => codes.render(data, tab.contentId, tab.label);
				break;
			case "CREDITS":
				doneCallbackFn = () => credits.render(tab.contentId);
				break;
			case "SPECIALS":
				dataHref = "./data/specials.json";
				doneCallbackFn = (data: Record<string, { name: string; abilities: string[] }[]>) => specials.render(data, tab.contentId, tab.label);
				break;
			case "QUESTS":
				dataHref = "./data/questline.json";
				doneCallbackFn = (data: Record<string, Quest[]>) => questline.render(data, tab.contentId, tab.label);
				break;
			case "COMMANDS":
				dataHref = "./data/commands.json";
				doneCallbackFn = (data: Record<string, CommandSubGroup>) => commands.render(data, tab.contentId, tab.label);
				break;
			case "AUTO TRAIN":
				dataHref = "./data/autoclick.json";
				doneCallbackFn = (data: AutoClickEntry[]) => autotrain.render(data, tab.contentId, tab.label);
				break;
			default:
				doneCallbackFn = () => {};
		}

		if (dataHref) {
			$.getJSON(dataHref)
				.done(doneCallbackFn)
				.done(() => $(`#${tab.contentId}`).attr("data-content-loaded", "true"))
				.fail((_, textStatus, error) => console.error(`Error loading ${dataHref}`, textStatus, error));
		} else {
			(doneCallbackFn as () => void)();
		}
	}
}
