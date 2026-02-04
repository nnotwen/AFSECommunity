import $ from "jquery";
import { CommandSubGroup } from "../types/data";
import { generateUniqueId } from "../utils/idGenerator";
import { escapeHTML } from "./calculator/helper";
import toast from "../components/toast";

export default {
	render(data: Record<string, CommandSubGroup>, id: string, label: string) {
		const accordionId = generateUniqueId();

		$(`#${id}`).html(/*html*/ `
                <h2 class="text-2xl font-bold mb-6 text-glow-green">PRIVATE SERVER ${label}</h2>
                <p class="mb-5 terminal-text text-uppercase">Administrative commands for Private Servers</p>
                <div id="${accordionId}" class="accordion" data-bs-theme="dark"></div>
                <div class="flex justify-center">
                    <button data-commands-copyall="true" class="cyber-btn cyber-btn-primary mt-4">
                        <i class="bi bi-copy me-2"></i> COPY ALL COMMANDS
                    </button>
                </div>
            `);

		function formatCommand(command: string) {
			const [name, desc] = command.split("-").map((s) => s.trim());
			return /*html*/ `
                <div data-rblx-command="${escapeHTML(name)}" class="col-sm-6 col-md-4 col-lg-3">
                    <div class="code-item flex-column h-100">
                        <span class="font-medium text-glow-green">${escapeHTML(name)}</span>
                        <span class="terminal-text text-sm text-center mt-2">${desc}</span>
                    </div>
                </div>
            `;
		}

		for (const [idx, v] of Object.values(data).entries()) {
			const targetId = generateUniqueId();
			$(`#${accordionId}`).append(/*html*/ `
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button ${idx === 0 ? "" : "collapsed"} text-xl font-bold text-glow-blue" type="button" data-bs-toggle="collapse" data-bs-target="#${targetId}">
                                ${v.label}
                            </button>
                        </h2>
                        <div id="${targetId}" class="accordion-collapse collapse ${idx === 0 ? "show" : ""}" data-bs-parent="#${accordionId}">
                            <div class="accordion-body row g-2">
                                ${v.commands.map(formatCommand).join("")}
                            </div>
                        </div>
                    </div>`);
		}

		$("[data-rblx-command]").on("click", function () {
			navigator.clipboard
				.writeText($(this).attr("data-rblx-command") ?? "")
				.then(() => toast.success("Copied command to clipboard!"))
				.catch(() => toast.error("Failed to copy command to clipboard!"));
		});

		$("[data-commands-copyall]").on("click", function () {
			const all = Object.values(data)
				.map((x) => x.commands)
				.flat()
				.join("\n");

			navigator.clipboard
				.writeText(all)
				.then(() => toast.success("Copied all commands to clipboard!"))
				.catch(() => toast.error("Failed to copy all commands to clipboard!"));
		});
	},
};
