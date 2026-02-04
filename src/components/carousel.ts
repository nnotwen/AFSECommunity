import { generateUniqueId } from "../utils/idGenerator";

export interface CarouselData {
	imgsrc: string;
	imgalt?: string;
	className?: string;
	captions?: {
		heading?: string;
		regular?: string;
	};
}

export interface CarouselOptions {
	controls?: boolean;
	indicators?: boolean;
	crossfade?: boolean;
	autoplay?: boolean;
	touchSwipe?: boolean;
	darkMode?: boolean;
	className?: string;
}

export function buildCarousel(data: CarouselData | CarouselData[], options?: CarouselOptions) {
	const carouselId = generateUniqueId();

	if (!Array.isArray(data)) {
		return /*html*/ `<img src="${data.imgsrc}" class="d-block w-100 ${data.className ?? ""} ${options?.className ?? ""}" alt="${data.imgalt ?? data.imgsrc}">`;
	}

	if (data.length === 1) {
		return /*html*/ `<img src="${data[0].imgsrc}" class="d-block w-100 ${data[0].className ?? ""} ${options?.className ?? ""}" alt="${data[0].imgalt ?? data[0].imgsrc}">`;
	}

	function formatItem(item: CarouselData, idx: number) {
		function formatCaption() {
			if (!item.captions) return "";
			return /*html*/ `
                <div class="carousel-caption d-none d-md-block">
                    ${item.captions.heading ? `<h5>${item.captions.heading}</h5>` : ""}
                    ${item.captions.regular ? `<p>${item.captions.regular}</p>` : ""}
                </div>`;
		}

		return /*html*/ `
            <div class="carousel-item ${idx === 0 ? "active" : ""}">
                <img class="d-block w-100" src="${item.imgsrc}" alt="${item.imgalt ?? item.imgsrc}">
                ${formatCaption()}
            </div>
        `;
	}

	function appendControls() {
		return /*html*/ `
            <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        `;
	}

	function appendIndicators(data: CarouselData[]) {
		function formatIndicator(item: CarouselData, idx: number) {
			return /*html*/ `
                <button
                    type="button"
                    data-bs-target="#${carouselId}"
                    data-bs-slide-to="${idx}"
                    ${idx === 0 ? 'class="active" aria-current="true"' : ""}
                    aria-label="Slide ${idx + 1}"
                ></button>`;
		}

		return /*html*/ `
            <div class="carousel-indicators">
                ${data.map(formatIndicator).join("")}
            </div>`;
	}

	const carouselHtml = /*html*/ `
        <div
            class="carousel slide ${options?.crossfade === true ? "carousel-fade" : ""}"
            id="${carouselId}"
            ${options?.autoplay ? 'data-bs-ride="carousel"' : ""}
            ${options?.touchSwipe === false ? 'data-bs-touch="false"' : ""}
            ${options?.darkMode === false ? "" : 'data-bs-theme="dark"'}
        >
            ${options?.indicators === true ? appendIndicators(data) : ""}
            <div class="carousel-inner ${options?.className ?? ""}">
                ${data.map(formatItem).join("")}
            </div>
            ${options?.controls === true ? appendControls() : ""}
        </div>
    `;

	return carouselHtml;
}
