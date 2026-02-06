import $ from "jquery";
import toast from "../components/toast";
import $storage from "../components/storage";
import { generateUniqueId } from "../utils/idGenerator";
import { Tooltip } from "bootstrap";

function format(code: string) {
	const hasCopied = $storage.getOrSet<string[]>("redemptioncodes:copied", []).includes(code);

	return /*html*/ `
    <div class="col-sm-6 col-md-4">
        <div class="code-item cursor-pointer" data-code-content="${code}" data-code-hascopied="${hasCopied}">
            <span class="font-medium ${hasCopied ? "opacity-30" : "text-glow-green"}">${code}</span>
            <i class="bi bi-copy text-terminal ${hasCopied ? "opacity-30" : "text-glow-green"}"></i>
        </div>
    </div>`;
}

export default {
	render(data: string[], id: string, label: string) {
		const resetCodesId = generateUniqueId();
		const toggleCodeVisibilityId = generateUniqueId();
		const visibilityHiddenInit = $storage.getOrSet<boolean>("redemptioncodes:visibility-hidden", false);

		$(`#${id}`).html(/*html*/ `
			<div class="flex flex-wrap justify-content-between mb-2">
				<div>
					<h2 class="text-2xl font-bold mb-6 text-glow-green">${label}</h2>
					<p class="terminal-text">&gt; CLICK ANY CODE TO COPY TO CLIPBOARD</p>
				</div>
				<div class="flex flex-wrap justify-content-end gap-2 items-center">
					<div id="${resetCodesId}" class="cyber-tab"><i class="bi bi-arrow-clockwise"></i></div>
					<div id="${toggleCodeVisibilityId}" class="cyber-tab"><i class="bi bi-eye"></i></div>
				</div>
			</div>
            <div class="row g-2">${data.map(format).join("")}</div>
        `);

		new Tooltip(`#${resetCodesId}`, {
			animation: true,
			title: "Reset Codes",
			customClass: "bg-dark-2 text-glow-blue bg-opacity-90 border-cyber border-opacity-30 rounded text-terminal tracking-widest",
			placement: "top",
			trigger: "hover",
		});

		const visibilityTooltip = new Tooltip(`#${toggleCodeVisibilityId}`, {
			animation: true,
			title: "Hide Copied Codes",
			customClass: "bg-dark-2 text-glow-blue bg-opacity-90 border-cyber border-opacity-30 rounded text-terminal tracking-widest",
			placement: "top",
			trigger: "hover",
		});

		$("[data-code-content]").on("click touchstart", function () {
			const code = $(this).attr("data-code-content") ?? "";
			$storage.set("redemptioncodes:copied", [...new Set([...$storage.getOrSet<string[]>("redemptioncodes:copied", []), code])]);

			$(`[data-code-content="${code}"] > span`).removeClass("text-glow-green").addClass("opacity-30");
			$(`[data-code-content="${code}"] > i`).removeClass("text-glow-green").addClass("opacity-30");
			$(`[data-code-content="${code}"]`).attr("data-code-hascopied", "true");

			if ($storage.get("redemptioncodes:visibility-hidden") === true) {
				$(`[data-code-content="${code}"]`).parent().fadeOut("slow");
			}

			navigator.clipboard
				.writeText(code)
				.then(() => toast.success(`Copied code ${code} to clipboard!`))
				.catch(() => toast.error("Failed to copy code to clipboard!"));
		});

		$(`#${resetCodesId}`).on("click touchstart", function () {
			$storage.delete("redemptioncodes:copied");
			$("[data-code-content]").attr("data-code-hascopied", "false");
			$("[data-code-content] > span, [data-code-content] > i").addClass("text-glow-green").removeClass("opacity-30");
		});

		$(`#${toggleCodeVisibilityId}`)
			.on("click touchstart", function () {
				const visibilityHidden = !$storage.getOrSet<boolean>("redemptioncodes:visibility-hidden", true);
				$storage.set("redemptioncodes:visibility-hidden", visibilityHidden);
				visibilityTooltip.setContent({ ".tooltip-inner": visibilityHidden ? "Show Copied Codes" : "Hide Copied Codes" });

				$(this)
					.children("i")
					.addClass(visibilityHidden ? "bi-eye-slash" : "bi-eye")
					.removeClass(visibilityHidden ? "bi-eye" : "bi-eye-slash");

				$("[data-code-hascopied='true']").parent()[visibilityHidden ? "fadeOut" : "fadeIn"]("slow");
			})
			.children("i")
			.addClass(visibilityHiddenInit ? "bi-eye-slash" : "bi-eye")
			.removeClass(visibilityHiddenInit ? "bi-eye" : "bi-eye-slash");

		$("[data-code-hascopied='true']").parent()[visibilityHiddenInit ? "hide" : "show"](0);
	},
};
