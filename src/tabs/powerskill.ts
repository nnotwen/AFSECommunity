import $ from "jquery";
import { generateUniqueId } from "../utils/idGenerator";

export default {
	render(data: Record<string, { name: string; val: string }[]>, id: string, label: string) {
		const selectId = generateUniqueId();

		function format(type: string, { name, val }: { name: string; val: string }) {
			return /*html*/ `
                    <div class="card-wrapper col-sm-6 col-md-4">
                        <div class="champion-card h-100" data-power-type="${type}">
                            <h3 class="font-bold text-lg mb-2 text-glow-blue">${name}</h3>
                            <p class="terminal-text">${val}</p>
                        </div>
                    </div>
                `;
		}

		const entries = Object.entries(data)
			.map(([type, e]) => e.map((c) => format(type, c)))
			.flat()
			.join("");

		$(`#${id}`).html(/*html*/ `
                <h2 class="text-2xl font-bold mb-6 text-glow-green">${label}</h2>
                <p class="mb-2 terminal-text text-uppercase">SELECT POWER CATEGORY</p>
                <select name="Power Type" id="${selectId}" class="cyber-select p-2 w-100 text-uppercase">
                    ${Object.keys(data).map((s) => /*html*/ `<option value="${s}">${s}</option>`)}
                </select>
                <div class="row g-2 mt-4">
                    ${entries}
                </div>
            `);

		$(`#${selectId}`)
			.on("change", function () {
				const type = $(this).val();
				$(`#${id} .champion-card[data-power-type="${type}"]`).closest(".card-wrapper").show();
				$(`#${id} .champion-card:not([data-power-type="${type}"])`).closest(".card-wrapper").hide();
			})
			.trigger("change");
	},
};
