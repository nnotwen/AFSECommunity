import $ from "jquery";
import { Toast } from "bootstrap";
import { generateUniqueId } from "../utils/idGenerator";

function createToast(message: string, type: "success" | "error" | "warning" | "info") {
	const toastId = generateUniqueId();

	let toastType = "",
		iconClass = "";
	if (type === "success") {
		toastType = "toast-success";
		iconClass = "bi bi-check-circle-fill";
	}
	if (type === "error") {
		toastType = "toast-error";
		iconClass = "bi bi-x-circle-fill";
	}
	if (type === "warning") {
		toastType = "toast-warning";
		iconClass = "bi bi-exclamation-circle-fill";
	}
	if (type === "info") {
		toastType = "toast-info";
		iconClass = "bi bi-info-circle-fill";
	}

	const toastHtml = /*html*/ `
    <div id="${toastId}" class="toast ${toastType} position-relative align-items-center border-0 overflow-hidden" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex items-center">
			<span class="ps-3 text-xl ${iconClass}"></span>
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>`;

	if ($(".toast-container").length === 0) {
		$("body").append('<div class="toast-container position-fixed bottom-0 end-0 p-3"></div>');
	}

	$(".toast-container").append(toastHtml);

	const toastEl = document.getElementById(toastId)!;
	const toast = new Toast(toastEl, { delay: 5000 });
	toast.show();

	toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

const toast = {
	success(message: string) {
		createToast(message, "success");
	},
	error(message: string) {
		createToast(message, "error");
	},
	warning(message: string) {
		createToast(message, "warning");
	},
	info(message: string) {
		createToast(message, "info");
	},
};

export default toast;
