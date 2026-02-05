import $ from "jquery";
import { DataConfig } from "../types/data";
import { DateTime } from "luxon";
import { buildModal } from "../components/modal";

export default {
	render(data: DataConfig, id: string) {
		const sorted = data.changelog.sort((a, b) => b.timestamp - a.timestamp);

		$(`#${id}`).removeClass("cyber-card").html(/*html*/ `
            <div class="row g-5">
                <div class="col-12">
                    <div class="cyber-card">
                        <h2 class="text-xl font-bold mb-4 text-glow-blue">ACTIVE STATUS</h2>
                        <p class="terminal-text text-uppercase mb-4">&gt; Welcome to AFSE Community Guidelines Resource Hub</p>
                        <p class="mb-4">Ixora's Contribution to AFSE | Resource calculators and databases are online and ready for analysis.</p>
                        <div class="flex gap-2 mt-4">
                            <span class="cyber-badge badge-blue opacity-100">LATEST UPDATES</span>
                            <span class="cyber-badge badge-green opacity-100">v${data.version}</span>
                            <span class="cyber-badge badge-purple opacity-100">AFSE</span>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div data-tab-changelog="true" class="cyber-card">
                        <h2 class="text-xl font-bold mb-4 text-glow-green">CHANGELOG</h2>
                        <div class="flex flex-col gap-2">
                            ${sorted.slice(0, 4).map(formatChangelogEntry).join("")}
                        </div>
                    </div>
                </div>
            </div>
        `);

		if (sorted.length > 5) {
			const targetId = buildModal({
				htmlHeading: /*html*/ `
                    <div class="text-glow">CHANGELOG</div>
                `,
				htmlBody: /*html*/ `
                    <div class="flex flex-col gap-2">${sorted.map(formatChangelogEntry).join("")}</div>
                `,
				size: "lg",
				className: "bg-dark-2 border-glow border-cyber",
			});

			$("[data-tab-changelog]").append(/*html*/ `
                <button class="cyber-btn cyber-btn-primary" data-bs-toggle="modal" data-bs-target="#${targetId}">View all</button>
            `);
		}

		$(".version-label").text(`V${data.version}`);
		$(".copyright-year").text(new Date().getFullYear());

		setInterval(() => {
			$("[data-luxon-timestamp]").each(function () {
				const timestamp = Number($(this).attr("data-luxon-timestamp"));
				if (isNaN(timestamp)) return;

				$(this).text(DateTime.fromMillis(timestamp).toRelative() ?? "");
			});
		}, 60_000 * 5);
	},
};

function formatChangelogEntry(entry: DataConfig["changelog"][number]) {
	const badge: Record<typeof entry.type, string> = {
		added: "text-cyber-green text-glow-green bg-cyber-green border-cyber-green",
		removed: "text-cyber-red text-glow-red bg-cyber-red border-cyber-red",
		update: "text-cyber-yellow text-glow-yellow bg-cyber-yellow border-cyber-yellow",
	};

	function formatList(list: string) {
		const glow: Record<typeof entry.type, string> = {
			added: "text-glow-green",
			removed: "text-glow-red",
			update: "text-glow-yellow",
		};

		return /*html*/ `
            <li class="text-terminal ${glow[entry.type]}">${list}</li>
        `;
	}

	return /*html*/ `
        <div class="p-2">
            <div class="flex items-center gap-2 mb-2">
                <span class="py-1 px-3 text-xs font-semibold text-glow border-cyber bg-opacity-10 ${badge[entry.type]} text-uppercase text-terminal tracking-widest">${entry.type}</span>
                <span class="text-sm text-terminal opacity-60" data-luxon-timestamp="${entry.timestamp}">${DateTime.fromMillis(entry.timestamp).toRelative()}</span>
            </div>
            <ul>${entry.list.map(formatList).join("")}</ul>
        </div>
    `;
}
