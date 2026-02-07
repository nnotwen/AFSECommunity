// devilfruitloc.tss
import $ from "jquery";
import { buildModal } from "../components/modal";
import { DevilFruitEntry, DevilFruitLocations } from "../types/data";
import $storage from "../components/storage";
import { buildCarousel, CarouselData } from "../components/carousel";

// Main module
export default {
	render(data: DevilFruitLocations[], id: string, label: string) {
		function formatCategory(fruit: DevilFruitLocations) {
			const entriesHtml = fruit.entries.map((e) => formatEntry(e, fruit.name)).join("");
			return /*html*/ `
                <div class="fruit-section" data-fruit-category="${fruit.name}">
                    <!-- <div class="mb-2 text-orbitron text-2xl font-bold text-uppercase text-cyber-red text-glow-red">${fruit.name} - ${fruit.attributeName}</div> -->
                    <div class="row g-2">${entriesHtml}</div>
                </div>
            `;
		}

		const categoriesHtml = data.map(formatCategory).join("");

		$(`#${id}`).addClass("cyber-card-red").html(/*html*/ `
            <div class="flex flex-wrap justify-content-between mb-2" data-fruit-header="true">
                <div>
                    <h2 class="text-2xl font-bold mb-6 text-glow-red">${label}</h2>
                    <p class="text-terminal text-cyber-red text-glow-red font-bold">DEVIL FRUITS AND THEIR LOCATIONS</p>
                </div>
            </div>
            ${categoriesHtml}
        `);

		// Tab click handler
		$(`[data-fruit-target-tab]`).on("click touchstart", function () {
			$(this).siblings().removeClass("active");
			$(this).addClass("active");

			const targetTab = $(this).attr("data-fruit-target-tab");
			if (!targetTab) return;

			const $activeTab = $(`[data-fruit-category="${targetTab}"]`);
			const $siblings = $activeTab.siblings().not("[data-fruit-header]");

			$activeTab.fadeIn("slow");
			$siblings.hide(0);

			$storage.set("fruit-tab:navigation", targetTab);
		});

		// Set to last clicked tab
		const defaultTab = $storage.getOrSet("fruit-tab:navigation", data[0].name);
		$(`[data-fruit-target-tab="${defaultTab}"]`).trigger("click");
	},
};

function formatEntry(entry: DevilFruitLocations["entries"][number], categoryName: string) {
	const carousel = buildCarousel(toCarouselData(entry.images, "heading"), {
		controls: true,
		indicators: true,
		crossfade: false,
		autoplay: true,
		touchSwipe: true,
	});

	const thumbimg = entry.images.map((x) => ({
		...x,
		path: x.path.replace("/devilfruitlocations/", "/devilfruitlocations/thumb-"),
	}));

	const carouselCard = buildCarousel(toCarouselData(thumbimg, "regular"), {
		className: "opacity-25 group-hover:opacity-100",
	});

	const targetId = buildModal({
		htmlHeading: /*html*/ `
			<div class="d-flex justify-content-between align-items-center w-100">
                <div class="text-orbitron text-glow-red text-cyber-red me-2">${entry.name}</div>
                <span class="text-cyber-red bg-cyber-red py-1 px-3 text-xs font-semibold text-glow-red border-cyber bg-opacity-10 text-uppercase text-terminal tracking-widest">${categoryName}</span>
            </div>`,
		htmlBody: /*html*/ `
			<div class="rounded-3 overflow-hidden border-cyber-red">${carousel}</div>
			<div class="row g-2 mt-3">
                <div class="col-12">
                    <div class="bg-cyber-red bg-opacity-10 text-terminal text-cyber-green text-glow-green p-2 border-cyber-red border-opacity-50 rounded">
                        <i class="bi bi-info-circle me-2"></i>
                        <span class="bold-font">Location Details:</span> ${entry.details}
                    </div>
                </div>
                <div class="col-12">
                    <div class="bg-cyber-red bg-opacity-10 text-terminal text-cyber-blue text-glow-blue p-2 border-cyber-red border-opacity-50 rounded">
                        <i class="bi bi-lightning-charge me-2"></i>
                        <span class="bold-font">Fruit Type:</span> ${entry.name}
                    </div>
                </div>
            </div>`,
		className: "bg-card border-cyber-red hover:border-glow-red",
	});

	function toCarouselData(
		data: DevilFruitEntry["images"],
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
			<div class="bg-dark-1 p-3 rounded-3 border-cyber-red border-opacity-50 hover:border-opacity-80 group h-100 hover:border-glow-red hover:transform-translate-y-[-2] transition duration-300 cubic-beizer cursor-pointer" data-bs-toggle="modal" data-bs-target="#${targetId}">
				<div class="text-center p-2">
					<span class="opacity-70 group-hover:opacity-100 group-hover:text-glow-purple text-terminal group-hover:text-cyber-purple tracking-widest text-sm">Random Spawn</span>
					<div class="opacity-70 group-hover:opacity-100 group-hover:text-glow-red font-bold text-orbitron group-hover:text-cyber-red">
						<div class="line-clamp-1">${entry.name}</div>
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
