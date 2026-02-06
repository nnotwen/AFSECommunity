import $ from "jquery";
import { buildCarousel, CarouselData } from "../components/carousel";
import { buildModal } from "../components/modal";
import { TrainingArea } from "../types/data";
import { generateUniqueId } from "../utils/idGenerator";
import { Tooltip } from "bootstrap";
import $storage from "../components/storage";

// ADD 'export' here

export default {
	render(data: TrainingArea[], id: string, label: string) {
		const buttons = data.map((entry, idx) => {
			const id = generateUniqueId();
			return {
				id,
				name: entry.name,
				btn: /*html*/ `<div id="${id}" class="cyber-tab ${idx === 0 ? "active" : ""}" data-training-target-tab="${entry.name}"><i class="${entry.icon}"></i></div>`,
			};
		});

		function formatCategory(area: TrainingArea) {
			return /*html*/ `
                <div class="training-section" data-training-category="${area.name}">
                    <div class="section-title bold-font text-uppercase">${area.name} - ${area.attributeName}</div>
                    <div class="row g-2">${area.entries.map((e) => format(e, area.name)).join("")}</div>
                </div>
            `;
		}

		$(`#${id}`).html(/*html*/ `
            <div class="flex flex-wrap justify-content-between mb-2" data-training-header="true">
                <div>
                    <h2 class="text-2xl font-bold mb-6 text-glow-green">${label}</h2>
                    <p class="terminal-text">ALL TRAINING AREAS AND THEIR LOCATIONS</p>
                </div>
                <div class="flex flex-wrap justify-content-end gap-2 items-center">${buttons.map((x) => x.btn).join("")}</div>
            </div>
            ${data.map(formatCategory).join("")}
        `);

		buttons.map(
			({ id, name }) =>
				new Tooltip(`#${id}`, {
					animation: true,
					title: name,
					customClass: "bg-dark-2 text-glow-blue bg-opacity-90 border-cyber border-opacity-30 rounded text-terminal tracking-widest",
					placement: "top",
				}),
		);

		$(`[data-training-target-tab]`).on("click touchstart", function () {
			$(this).siblings().removeClass("active");
			$(this).addClass("active");

			const $activeTab = $(`[data-training-category="${$(this).attr("data-training-target-tab")}"]`);
			$activeTab.fadeIn("slow");
			$activeTab.siblings().not("[data-training-header]").hide(0);

			$storage.set("training-tab:navigation", $(this).attr("data-training-target-tab"));
		});

		// Set to last clicked tab
		$(`[data-training-target-tab="${$storage.getOrSet("training-tab:navigation", data[0].name)}"]`).trigger("click");
	},
};

function format(entry: TrainingArea["entries"][number], areaName: string) {
	// Create carousel for modal
	const carouselModal = buildCarousel(toCarouselData(entry.images, "heading"), {
		controls: true,
		indicators: true,
		crossfade: false,
		autoplay: true,
		touchSwipe: true,
	});

	// Use thumbnail to reduce lag and framedrops
	const thumbimg = entry.images.map((x) => ({
		...x,
		path: x.path.replace("/trainingareas/", "/trainingareas/thumb-"),
	}));

	const carouselCard = buildCarousel(toCarouselData(thumbimg, "regular"), {
		className: "opacity-25 group-hover:opacity-100",
	});

	const targetId = buildModal({
		htmlHeading: /*html*/ `
            <div class="d-flex justify-content-between align-items-center w-100">
                <div class="text-orbitron text-glow-blue text-cyber-blue me-2">${entry.name}</div>
                <span class="text-cyber-blue bg-cyber-blue py-1 px-3 text-xs font-semibold text-glow border-cyber bg-opacity-10 text-uppercase text-terminal tracking-widest">${areaName}</span>
            </div>
        `,
		htmlBody: /*html*/ `
            <div class="rounded-3 overflow-hidden">${carouselModal}</div>
            <div class="row g-2 mt-2">
                <div class="col col-12 col-sm-6">
                    <div class="text-terminal text-cyber-green text-glow-green text-center p-2">Location: ${entry.details}</div>
                </div>
                <div class="col col-12 col-sm-6">
                    <div class="text-terminal text-cyber-green text-glow-green text-center p-2">Requirement: ${entry.name.split(" - ")[0]}</div>
                </div>
            </div>
        `,
		className: "hover:border-glow-blue bg-card border-training",
	});

	function toCarouselData(
		data: TrainingArea["entries"][number]["images"],
		captionType: keyof NonNullable<CarouselData["captions"]> = "regular",
		className?: string,
	): CarouselData | CarouselData[] {
		return data.map((e) => ({
			className,
			imgsrc: `./images/${e.path.replace(/^\/+/, "")}`,
			imgalt: entry.name,
			...(e.caption.trim().length ? { captions: { [captionType]: e.caption } } : {}),
		}));
	}

	return /*html*/ `
    <div class="col-sm-6 col-md-4">
        <div class="bg-dark-1 p-3 rounded-3 border-cyber-blue border-opacity-30 hover:border-opacity-80 group h-100 hover:border-glow-blue hover:transform-translate-y-[-2] transition duration-300 cubic-beizer cursor-pointer" data-bs-toggle="modal" data-bs-target="#${targetId}">
            <div class="text-center p-2">
                <span class="opacity-70 group-hover:opacity-100 group-hover:text-glow-purple text-terminal group-hover:text-cyber-purple tracking-widest text-sm">${entry.name.split(" - ")[0]}</span>
                <div class="opacity-70 group-hover:opacity-100 group-hover:text-glow-blue font-bold text-orbitron group-hover:text-cyber-blue">
                    <div class="line-clamp-1">${entry.name.split(" - ")[1] || entry.name}</div>
                </div>
            </div>
            <div class="rounded-3 overflow-hidden">${carouselCard}</div>
            <div class="d-flex my-2 w-100 text-terminal tracking-widest opacity-70 group-hover:opacity-100 group-hover:text-cyber-green group-hover:text-glow-green">
                <i class="bi bi-geo-alt flex-shrink-0 me-2"></i>
                <div class="text-xs">${entry.details}</div>
            </div>
        </div>
    </div>`;
}
