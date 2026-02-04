import type { Champion } from "../types/data";

/**
 * Takes an array of champions and returns an HTML string.
 */
export function renderChampions(champions: Champion[]): string {
	function map(c: Champion) {
		return /*html*/ `
            <div class="card-wrapper col-sm-6 col-md-4">
                <div class="champion-card h-100" data-champname="${c.name}" data-board="${c.board}" data-champchance="${c.chance}" data-sellcost="${c.cost}">
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="font-bold text-lg text-glow-purple">${c.name}</h3>
                        <span class="cyber-badge text-nowrap h-fit ${c.board === 1 ? "badge-blue" : c.board === 2 ? "badge-purple" : "badge-pink"}" data-board-toggle="${c.board}">
                            ${c.board === 3 ? "LIMITED" : "BOARD " + c.board}
                        </span>
                    </div>
                    <div class="mb-3">
                        <div class="text-sm terminal-text">CHANCES TO OBTAIN</div>
                        <div class="font-medium text-glow-green">${c.chance}</div>
                    </div>
                    <div class="mb-3">
                        <div class="text-sm terminal-text">SELLING  COST</div>
                        <div class="font-medium text-glow-blue">${c.cost}</div>
                    </div>
                    <div>
                        <div class="text-sm terminal-text">DESCRIPTION</div>
                        <p class="text-sm">${c.desc}</p>
                    </div>
                </div>
            </div>
        `;
	}

	return champions.map(map).join("");
}
