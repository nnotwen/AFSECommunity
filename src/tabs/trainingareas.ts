import $ from "jquery";
import { buildCarousel, CarouselData } from "../components/carousel";
import { buildModal } from "../components/modal";

// ADD 'export' here
export interface TrainingEntry {
	name: string;
	details: string;
	images: { path: string; caption: string }[];
}

// ADD 'export' here
export interface TrainingArea {
	name: string;
	attributeName: string;
	entries: TrainingEntry[];
}

export default {
	render(data: TrainingArea[], id: string, label: string) {
		$(`#${id}`).html(/*html*/ `
            <h2 class="text-2xl font-bold mb-6 text-glow-green">${label}</h2>
            <p class="mb-5 terminal-text">ALL TRAINING AREAS AND THEIR LOCATIONS</p>
            
            ${data
													.map(
														(area) => `
                <div class="training-section">
                    <div class="section-title font-bold text-uppercase">${area.name} - ${area.attributeName}</div>
                    <div class="row g-2">${area.entries.map((entry) => format(entry, area.name)).join("")}</div>
                </div>
            `,
													)
													.join("")}
        `);
	},
};

function format(entry: TrainingEntry, areaName: string) {
	// Create carousel for modal
	const carousel = buildCarousel(toCarouselData(entry.images, "heading"), {
		controls: true,
		indicators: true,
		crossfade: false,
		autoplay: true,
		touchSwipe: true,
	});

	const targetId = buildModal({
		htmlHeading: /*html*/ `
            <div class="d-flex justify-content-between align-items-center w-100">
                <div class="gacha-title mb-0">${entry.name}</div>
                <span class="badge cyber-badge badge-blue">${areaName}</span>
            </div>
        `,
		htmlBody: /*html*/ `
            <div class="training-modal-content">
                <div class="training-location-info mb-4">
                    <div class="d-flex align-items-center mb-2">
                        <i class="bi bi-geo-alt-fill text-glow-cyan me-2"></i>
                        <h6 class="mb-0 text-uppercase terminal-text">Location:</h6>
                    </div>
                    <p class="terminal-text ms-4">${entry.details}</p>
                </div>
                <div class="rounded-3 overflow-hidden">${carousel}</div>
                <div class="training-stats mt-3">
                    <div class="row">
                        <div class="col-6">
                            <div class="stat-item">
                                <span class="stat-label terminal-text">Requirement:</span>
                                <span class="stat-value text-glow-purple">${entry.name.split(" - ")[0]}</span>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="stat-item">
                                <span class="stat-label terminal-text">Images:</span>
                                <span class="stat-value text-glow-cyan">${entry.images.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
		className: "hover:box-shadow-blue bg-card border-training",
	});

	function toCarouselData(
		data: TrainingEntry["images"],
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
        <div class="training-card group h-100" data-bs-toggle="modal" data-bs-target="#${targetId}">
            <div class="training-title">
                <span class="training-req text-glow-purple">${entry.name.split(" - ")[0]}</span>
                <div class="training-name">${entry.name.split(" - ")[1] || entry.name}</div>
            </div>
            <div class="rounded-3 overflow-hidden">${buildCarousel(toCarouselData(entry.images, "regular"), {
													className: "opacity-25 group-hover:opacity-100",
												})}</div>
            <div class="training-info mt-2">
                <p class="training-description terminal-text">${entry.details}</p>
                <div class="training-meta">
                    <span class="badge cyber-badge badge-cyan">${entry.images.length} images</span>
                    <span class="training-area-badge">${areaName}</span>
                </div>
            </div>
        </div>
    </div>`;
}
