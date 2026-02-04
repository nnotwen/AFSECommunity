import $ from "jquery";
import { Quest } from "../types/data";
import { generateUniqueId } from "../utils/idGenerator";

export default {
	render(data: Record<string, Quest[]>, id: string, label: string) {
		const selectId = generateUniqueId();

		function format(category: string, quest: Quest) {
			return /*html*/ `
                    <div class="card-wrapper col-sm-6 col-md-4">
                        <div class="champion-card h-100" data-quest-id="${quest.quest}" data-quest-line="${category}">
                            <div class="flex justify-between items-start mb-3">
                                <h3 class="font-bold text-lg text-glow-purple">QUEST ${quest.quest}</h3>
                                <span class="cyber-badge badge-blue text-nowrap h-fit">${category}</span>
                            </div>
                            <div class="mb-3">
                                <div class="text-sm terminal-text">REQUIREMENT</div>
                                <div class="font-medium text-glow-green">${quest.requirement}</div>
                            </div>
                            <div class="mb-3">
                                <div class="text-sm terminal-text">REWARD</div>
                                <div class="font-medium text-glow-green">${quest.reward}</div>
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
                <p class="mb-2 terminal-text text-uppercase">SELECT QUEST LINE</p>
                <select name="Quest Line" id="${selectId}" class="cyber-select p-2 w-100 text-uppercase">
                    ${Object.keys(data).map((s) => /*html*/ `<option value="${s}">${s}</option>`)}
                </select>
                <div class="row g-2 mt-4">${entries}</div>
            `);

		$(`#${selectId}`)
			.on("change", function () {
				const type = $(this).val();
				$(`#${id} .champion-card[data-quest-line="${type}"]`).closest(".card-wrapper").show();
				$(`#${id} .champion-card:not([data-quest-line="${type}"])`).closest(".card-wrapper").hide();
			})
			.trigger("change");
	},
};
