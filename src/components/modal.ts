import $ from "jquery";
import { generateUniqueId } from "../utils/idGenerator";

export interface BuildModalOptions {
	htmlHeading: string;
	htmlBody: string;
	htmlFooter?: string;
	size?: "sm" | "lg" | "xl";
	className?: string;
}

const defaults: Partial<BuildModalOptions> = {
	size: "lg",
};

export function buildModal(options: BuildModalOptions) {
	const id = generateUniqueId();
	options = { ...defaults, ...options };

	const modalHtml = /*html*/ `
    <div class="modal fade" id="${id}" tabindex="-1" aria-labelledby="${id}Label" data-bs-theme="dark">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-${options.size}">
            <div class="modal-content ${options.className ? options.className : ""}">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="${id}Label">${options.htmlHeading}</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="container-fluid">${options.htmlBody}</div>
                </div>
                ${options.htmlFooter ? `<div class="modal-footer">${options.htmlFooter}</div>` : ""}
            </div>
        </div>
    </div>
    `;

	if ($(".modal-container").length === 0) {
		$("body").append('<div class="modal-container"></div>');
	}

	$(".modal-container").append(modalHtml);

	return id;
}
