import $ from "jquery";
import { GachaEntry } from "../types/data";
import { buildCarousel, CarouselData } from "../components/carousel";
import { buildModal } from "../components/modal";

export default {
	render(data: { location: GachaEntry[]; tokens: GachaEntry[] }, id: string, label: string) {
		$(`#${id}`).html(/*html*/ `
                <h2 class="text-2xl font-bold mb-6 text-glow-green">${label}</h2>
                <p class="mb-5 terminal-text">ALL GACHA NPC LOCATIONS AND TOKEN AREAS</p>
                <div class="gacha-section">
                    <div class="section-title font-bold">GACHA LOCATION</div>
                    <div class="row g-2">${data.location.map(format).join("")}</div>
                </div>
                <div class="gacha-section font-bold">
                    <div class="section-title">GACHA TOKENS</div>
                    <div class="row g-2">${data.tokens.map(format).join("")}</div>
                </div>
            `);
	},
};

function format(entry: GachaEntry) {
	const carousel = buildCarousel(toCarouselData(entry.images, "heading"), {
		controls: true,
		indicators: true,
		crossfade: false,
		autoplay: true,
		touchSwipe: true,
	});

	const targetId = buildModal({
		htmlHeading: /*html*/ `<div class="gacha-title mb-0">${entry.heading}</div>`,
		htmlBody: /*html*/ `
            <div class="rounded-3 overflow-hidden">${carousel}</div>
            <p class="terminal-text text-center mt-2">${entry.description}</p>`,
		className: "hover:box-shadow-purple bg-card border-gacha",
	});

	function toCarouselData(
		data: GachaEntry["images"],
		captionType: keyof NonNullable<CarouselData["captions"]> = "regular",
		className?: string,
	): CarouselData | CarouselData[] {
		return data.map((e) => ({
			className,
			imgsrc: `./images/${e.path.replace(/^\/+/, "")}`,
			imgalt: entry.heading,
			...(e.caption.trim().length ? { captions: { [captionType]: e.caption } } : {}),
		}));
	}

	function toThumbCarouselData(
		data: GachaEntry["images"],
		captionType: keyof NonNullable<CarouselData["captions"]> = "regular",
		className?: string,
	): CarouselData | CarouselData[] {
		return data.map((e) => ({
			className,
			imgsrc: `./images/thumb-${e.path.replace(/^\/+/, "")}`,
			imgalt: entry.heading,
			...(e.caption.trim().length ? { captions: { [captionType]: e.caption } } : {}),
		}));
	}

	return /*html*/ `
    <div class="col-sm-6 col-md-4">
        <div class="gacha-card group h-100" data-bs-toggle="modal" data-bs-target="#${targetId}">
            <div class="gacha-title">${entry.heading}</div>
            <div class="rounded-3 overflow-hidden">${buildCarousel(toThumbCarouselData(entry.images, "regular"), { className: "opacity-25 group-hover:opacity-100" })}</div>
            <p class="gacha-description mt-2">${entry.description}</p>
        </div>
    </div>`;
}
