import $ from "jquery";
import { generateUniqueId } from "../utils/idGenerator";

export default {
	render(data: Record<string, { name: string; abilities: string[] }[]>, id: string, label: string) {
		const selectId = generateUniqueId();

		function formatAbility(ability: string) {
			const [key, desc] = ability.split("-").map((s) => s.trim());
			return /*html*/ `
                    <div class="flex items-start gap-2">
                        <span class="cyber-badge badge-green opacity-100 mt-1 h-fit">${key}</span>
                        <span class="terminal-text flex-1">${desc}</span>
                    </div>`;
		}

		function format(category: string, { name, abilities }: { name: string; abilities: string[] }) {
			return /*html*/ `
                    <div class="card-wrapper col-sm-6 col-md-4">
                        <div class="champion-card h-100" data-specials-id="${category}">
                            <div class="flex flex-column justify-between items-start mb-3">
                                <h3 class="font-bold text-lg text-glow-blue">${name}</h3>
                                <div class="space-y-2">
                                    ${abilities.map(formatAbility).join("")}
                                </div>
                            </div>
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
                <p class="mb-2 terminal-text text-uppercase">SELECT CATEGORY</p>
                <select name="Specials Category" id="${selectId}" class="cyber-select p-2 w-100 text-uppercase">
                    ${Object.keys(data).map((s) => /*html*/ `<option value="${s}">${s}</option>`)}
                </select>
                <div class="row g-2 mt-4">
                    ${entries}
                </div>
            `);

		$(`#${selectId}`)
			.on("change", function () {
				const type = $(this).val();
				$(`#${id} .champion-card[data-specials-id="${type}"]`).closest(".card-wrapper").show();
				$(`#${id} .champion-card:not([data-specials-id="${type}"])`).closest(".card-wrapper").hide();
			})
			.trigger("change");
	},
};
