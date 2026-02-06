// devilfruitloc.ts

import $ from "jquery";
import { buildModal } from "../components/modal";
import { generateUniqueId } from "../utils/idGenerator";
import { Tooltip } from "bootstrap";
import { DevilFruitEntry, DevilFruitLocations } from "../types/data";
import $storage from "../components/storage";

// Main module
export default {
	render(data: DevilFruitLocations[], id: string, label: string) {
		const buttons = data.map((entry, idx) => {
			const buttonId = generateUniqueId();
			return {
				id: buttonId,
				name: entry.name,
				btn: /*html*/ `<div id="${buttonId}" class="cyber-tab ${idx === 0 ? "active" : ""}" data-fruit-target-tab="${entry.name}"><i class="${entry.icon}"></i></div>`,
			};
		});

		function formatCategory(fruit: DevilFruitLocations) {
			const entriesHtml = fruit.entries.map((e) => formatEntry(e, fruit.name)).join("");
			return /*html*/ `
                <div class="fruit-section" data-fruit-category="${fruit.name}">
                    <div class="section-title bold-font text-uppercase">${fruit.name} - ${fruit.attributeName}</div>
                    <div class="row g-2">${entriesHtml}</div>
                </div>
            `;
		}

		const buttonsHtml = buttons.map((x) => x.btn).join("");
		const categoriesHtml = data.map(formatCategory).join("");

		$(`#${id}`).html(/*html*/ `
            <div class="flex flex-wrap justify-content-between mb-2" data-fruit-header="true">
                <div>
                    <h2 class="text-2xl font-bold mb-6 text-glow-red">${label}</h2>
                    <p class="terminal-text">DEVIL FRUITS AND THEIR LOCATIONS</p>
                </div>
                <div class="flex flex-wrap justify-content-end gap-2 items-center">${buttonsHtml}</div>
            </div>
            ${categoriesHtml}
        `);

		// Add tooltips to buttons
		buttons.forEach(
			({ id, name }) =>
				new Tooltip(`#${id}`, {
					animation: true,
					title: name,
					customClass: "bg-dark-2 text-glow-red bg-opacity-90 border-cyber border-opacity-30 rounded text-terminal tracking-widest",
					placement: "top",
				}),
		);

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

function formatEntry(entry: DevilFruitEntry, categoryName: string) {
	// Get the first image for modal display
	const mainImage = entry.images[0];
	const hasImages = entry.images.length > 0;

	// Use absolute path from JSON or fallback
	const imageUrl = hasImages ? `./images${mainImage.path}` : "./images/placeholder.jpg";

	// Build additional images HTML
	let additionalImagesHtml = "";
	if (entry.images.length > 1) {
		const additionalImages = entry.images
			.slice(1)
			.map((img, idx) => {
				const imgCaption = img.caption ? /*html*/ `<div class="text-xs text-terminal text-cyber-gray mt-1">${img.caption}</div>` : "";
				return /*html*/ `
                <div class="col-4">
                    <img src="./images${img.path}" alt="${entry.name} ${idx + 2}" class="img-fluid rounded border border-cyber border-opacity-50" style="height: 100px; object-fit: cover;">
                    ${imgCaption}
                </div>
            `;
			})
			.join("");

		additionalImagesHtml = /*html*/ `
            <div class="mt-3">
                <div class="text-terminal text-cyber-yellow mb-2">Additional Images:</div>
                <div class="row g-2">
                    ${additionalImages}
                </div>
            </div>`;
	}

	// Get caption HTML if exists
	const captionHtml = mainImage?.caption ? /*html*/ `<div class="text-center text-terminal text-cyber-green mt-2">${mainImage.caption}</div>` : "";

	// Build modal for this entry
	const targetId = buildModal({
		htmlHeading: /*html*/ `
            <div class="d-flex justify-content-between align-items-center w-100">
                <div class="text-orbitron text-glow-red text-cyber-red me-2">${entry.name}</div>
                <span class="text-cyber-red bg-cyber-red py-1 px-3 text-xs font-semibold text-glow border-cyber bg-opacity-10 text-uppercase text-terminal tracking-widest">${categoryName}</span>
            </div>
        `,
		htmlBody: /*html*/ `
            <div class="rounded-3 overflow-hidden">
                <img src="${imageUrl}" alt="${entry.name}" class="img-fluid w-100 rounded" style="max-height: 400px; object-fit: cover;">
                ${captionHtml}
            </div>
            <div class="row g-2 mt-3">
                <div class="col-12">
                    <div class="text-terminal text-cyber-green text-glow-green p-2 border border-cyber border-opacity-30 rounded">
                        <i class="bi bi-info-circle me-2"></i>
                        <span class="bold-font">Location Details:</span> ${entry.details}
                    </div>
                </div>
                <div class="col-12">
                    <div class="text-terminal text-cyber-blue text-glow-blue p-2 border border-cyber border-opacity-30 rounded">
                        <i class="bi bi-lightning-charge me-2"></i>
                        <span class="bold-font">Fruit Type:</span> ${entry.name}
                    </div>
                </div>
            </div>
            ${additionalImagesHtml}
        `,
		className: "hover:border-glow-red bg-card border-fruit",
	});

	// Get thumbnail - use same image if thumb doesn't exist
	const thumbUrl = hasImages ? `./images${mainImage.path}` : "./images/placeholder.jpg";

	return /*html*/ `
    <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="bg-dark-1 p-3 rounded-3 border-cyber-blue border-opacity-30 hover:border-opacity-80 group h-100 hover:border-glow-red hover:transform-translate-y-[-2] transition duration-300 cubic-beizer cursor-pointer" data-bs-toggle="modal" data-bs-target="#${targetId}">
            <!-- Card Header -->
            <div class="text-center p-2">
                <span class="opacity-70 group-hover:opacity-100 group-hover:text-glow-purple text-terminal group-hover:text-cyber-purple tracking-widest text-sm">Fruit</span>
                <div class="opacity-70 group-hover:opacity-100 group-hover:text-glow-red font-bold text-orbitron group-hover:text-cyber-red">
                    <div class="line-clamp-1">${entry.name}</div>
                </div>
            </div>
            
            <!-- Image Thumbnail -->
            <div class="rounded-3 overflow-hidden mb-2">
                <img src="${thumbUrl}" alt="${entry.name}" class="img-fluid w-100 rounded" style="height: 150px; object-fit: cover;" onerror="this.src='./images/placeholder.jpg'">
            </div>
            
            <!-- Details Section -->
            <div class="d-flex my-2 w-100 text-terminal tracking-widest opacity-70 group-hover:opacity-100 group-hover:text-cyber-green group-hover:text-glow-green">
                <i class="bi bi-geo-alt flex-shrink-0 me-2"></i>
                <div class="text-xs line-clamp-2">${entry.details}</div>
            </div>           
        </div>
    </div>`;
}

// Helper function to convert your JSON data to the expected format
export function createDevilFruitData(jsonData: any): DevilFruitLocations[] {
	return [
		{
			name: jsonData.name || "Devil Fruit",
			attributeName: jsonData.attributeName || "Locations",
			icon: jsonData.icon || "bi bi-tree",
			entries: jsonData.entries || [],
		},
	];
}
