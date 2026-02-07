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

		$(`#${accordionId}`).css({
			"--bs-accordion-active-bg": "rgb(var(--cyber-green-rgb) / 0.1)",
			"--bs-accordion-active-color": "rgb(var(--cyber-green-rgb))",
			"--bs-accordion-border-color": "rgb(var(--cyber-green-rgb) / 0.3)",
			"--bs-accordion-btn-focus-box-shadow": "0 0 0 0.25rem rgb(var(--cyber-green-rgb) / 0.25)",
		});

		function formatCommand(command: string) {
			const [name, desc] = command.split("-").map((s) => s.trim());
			return /*html*/ `
                <div data-rblx-command="${escapeHTML(name)}" class="col-sm-6 col-md-4 col-lg-3">
                    <div class="group p-3 rounded-3 bg-cyber-green bg-opacity-10 border-cyber-green border-opacity-30 hover:border-opacity-100 hover:border-glow-green d-flex flex-column h-100 text-center cursor-pointer transition hover:transform-translate-y-[-1]">
                        <span class="text-terminal font-medium group-hover:text-glow-green">${escapeHTML(name)}</span>
                        <span class="text-terminal text-sm text-cyber-green group-hover:text-glow-green mt-2 opacity-70 group-hover:opacity-100">${desc}</span>
                    </div>
                </div>
            `;
		}

		for (const [idx, v] of Object.values(data).entries()) {
			const targetId = generateUniqueId();
			$(`#${accordionId}`).append(/*html*/ `
                    <div class="accordion-item bg-dark-2 border-cyber-green border-opacity-30">
                        <h2 class="accordion-header">
                            <button class="accordion-button ${idx === 0 ? "" : "collapsed"} text-xl font-bold text-glow-green" type="button" data-bs-toggle="collapse" data-bs-target="#${targetId}">
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

		$("[data-rblx-command]").on("click touchstart", function () {
			navigator.clipboard
				.writeText($(this).attr("data-rblx-command") ?? "")
				.then(() => toast.success("Command copied to clipboard!"))
				.catch(() => toast.error("Failed to copy command to clipboard!"));
		});

		$("[data-commands-copyall]").on("click touchstart", function () {
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
