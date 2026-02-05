import $ from "jquery";
import { Champion } from "../types/data";
import { generateUniqueId } from "../utils/idGenerator";
import { renderChampions } from "../utils/renderChampion";

export default {
	render(data: Champion[], id: string, label: string) {
		const FiltersId = {
			1: generateUniqueId(),
			2: generateUniqueId(),
			3: generateUniqueId(),
			Clear: generateUniqueId(),
		} as const;

		const sortType = ["Name (ASC)", "Name (DESC)", "Chance (ASC)", "Chance (DESC)", "Selling Cost (ASC)", "Selling Cost (DESC)"] as const;
		const sortId = generateUniqueId();
		const searchId = generateUniqueId();

		$(`#${id}`).html(/*html*/ `
                <h2 class="text-2xl font-bold mb-6 text-glow-purple">${label}</h2>
                <input type="text" id="${searchId}" class="cyber-input" placeholder="SEARCH CHAMPIONS...">
                <div class="row justify-content-between">
                    <div data-champsearch-filters="true" class="col-12 col-sm-auto d-flex flex-wrap gap-2 my-2">
                        <button id="${FiltersId["1"]}" class="cyber-badge badge-blue">BOARD 1</button>
                        <button id="${FiltersId["2"]}" class="cyber-badge badge-purple">BOARD 2</button>
                        <button id="${FiltersId["3"]}" class="cyber-badge badge-pink">LIMITED</button>
                        <button id="${FiltersId.Clear}" class="cyber-badge active" style="background: rgba(255, 255, 255, 0.1); border-color: var(--gray); color: var(--gray);">
                            SHOW ALL
                        </button>
                    </div>
                    <div class="col-12 col-sm-3 my-2">
                        <select name="Sort Champions" id="${sortId}" class="cyber-select p-2 w-100 text-uppercase">
                            ${sortType.map((s) => /*html*/ `<option value="${s}">${s}</option>`)}
                        </select>
                    </div>
                </div>

                <div data-champions-content="true" class="row g-2">${renderChampions(data.sort((a, b) => a.name.localeCompare(b.name)))}</div>
            `);

		$("[data-board-toggle]").on("click touchstart", function () {
			$(`#${FiltersId[$(this).attr("data-board-toggle") as keyof typeof FiltersId]}`).trigger("click touchstart");
		});

		$("[data-champsearch-filters] button").on("click touchstart", function () {
			$(this).siblings().removeClass("active");
			$(this).addClass("active");

			if ($(this).attr("id") === FiltersId.Clear) {
				$(`.champion-card[data-board]`).closest(".card-wrapper").show();
			} else {
				const filter = Object.keys(FiltersId).find((k) => FiltersId[k as keyof typeof FiltersId] === $(this).attr("id"));
				$(`#${id} .champion-card[data-board="${filter}"]`).closest(".card-wrapper").show();
				$(`#${id} .champion-card:not([data-board="${filter}"])`).closest(".card-wrapper").hide();
			}
		});

		$(`#${sortId}`).on("change", function () {
			const type = $(this).val() as (typeof sortType)[number];
			const items = $(`[data-champions-content]`).children("div").get();

			items.sort(function (a, b) {
				const A = $(a).find(".champion-card");
				const B = $(b).find(".champion-card");

				switch (type) {
					case "Name (ASC)":
						return A.attr("data-champname")!.localeCompare(B.attr("data-champname")!);
					case "Name (DESC)":
						return B.attr("data-champname")!.localeCompare(A.attr("data-champname")!);
					case "Chance (ASC)":
						return parseFloat(A.attr("data-champchance")!) - parseFloat(B.attr("data-champchance")!);
					case "Chance (DESC)":
						return parseFloat(B.attr("data-champchance")!) - parseFloat(A.attr("data-champchance")!);
					case "Selling Cost (ASC)":
						return parseFloat(A.attr("data-sellcost")!) - parseFloat(B.attr("data-sellcost")!);
					case "Selling Cost (DESC)":
						return parseFloat(B.attr("data-sellcost")!) - parseFloat(A.attr("data-sellcost")!);
				}
			});

			$.each(items, function (_, item) {
				$(`[data-champions-content]`).append(item);
			});
		});

		$(`#${searchId}`).on("keyup", function () {
			const query = $(this).val() as string;
			$(".champion-card[data-board]").each((_, item) => {
				if ($(item).attr("data-champname")?.match(query.toUpperCase())) {
					$(item).closest(".card-wrapper").show();
				} else {
					$(item).closest(".card-wrapper").hide();
				}
			});
		});
	},
};
