import $ from "jquery";
import { generateUniqueId } from "../utils/idGenerator";

export interface FloatingInputOptions {
	type: "text" | "password" | "number";
	value?: string | number;
	disabled?: boolean;
	placeholder?: string;
	inputClassName?: string;
	labelClassName?: string;
}

export function buildFloatingInput(label: string, options: FloatingInputOptions = { type: "text" }) {
	const id = generateUniqueId();

	const input = /*html*/ `
        <div class="form-floating position-relative">
            <input
                id="${id}" 
                type="${options.type}"
                class="form-control ${options.inputClassName}"
                placeholder="for:form-floating"
                ${options.value ? `value="${options.value}"` : ""}
                ${options.disabled === true ? "disabled" : ""}
            >
            <label for="${id}" class="${options.labelClassName}">${label}</label>
            <span class="form-input-placeholder">${options.placeholder ?? ""}</span>
        </div>
    `;

	return { id, input, $: () => $(`#${id}`) };
}

export interface SelectInputOptions {
	label: string;
	selectOptions: {
		label?: string;
		value: string;
	}[];
	selectClassName?: string;
	labelClassName?: string;
}
export function buildSelectInput(options: SelectInputOptions) {
	const id = generateUniqueId();

	function formatOptions(o: { label?: string; value: string }, idx: number) {
		return /*html*/ `<option value="${o.value}" ${idx === 0 ? "selected" : ""}>${o.label ?? o.value}</option>`;
	}

	const input = /*html*/ `
        <div class="form-floating">
            <select class="form-select cyber-select ${options.selectClassName ?? ""}" aria-label="Select" id="${id}">
                ${options.selectOptions.map(formatOptions).join("")} 
            </select>
            <label for="floatingInput" class="text-terminal text-cyber-green ${options.labelClassName ?? ""}">${options.label}</label>
        </div>`;

	return { id, input, $: () => $(`#${id}`) };
}

export interface SwitchInputOptions {
	label: string;
	size?: "sm" | "md" | "lg";
	checked?: boolean;
	inputClassName?: string;
	labelClassName?: string;
}

export function buildSwitchInput(options: SwitchInputOptions) {
	const id = generateUniqueId();

	const input = /*html*/ `
		<div class="form-check form-switch form-switch-${options.size ?? "md"}">
			<input type="checkbox" class="form-check-input ${options.inputClassName ?? ""}" role="switch" id="${id}" ${options.checked === true ? "checked" : ""}>
			<label for="${id}" class="form-check-label text-terminal ${options.labelClassName ?? ""}">${options.label}</label>
		</div>
	`;

	return { id, input, $: () => $(`#${id}`) };
}
