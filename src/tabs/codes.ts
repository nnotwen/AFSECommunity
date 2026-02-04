import $ from "jquery";
import toast from "../components/toast";
import $storage from "../components/storage";
import { buildSwitchInput } from "../components/forms";

function format(code: string) {
	const hasCopied = $storage.getOrSet<string[]>("redemptioncodes:copied", []).includes(code);

	return /*html*/ `
    <div class="col-sm-6 col-md-4">
        <div class="code-item cursor-pointer" data-code-content="${code}">
            <span class="font-medium ${hasCopied ? "opacity-30" : "text-glow-green"}">${code}</span>
            <i class="bi bi-copy text-terminal ${hasCopied ? "opacity-30" : "text-glow-green"}"></i>
        </div>
    </div>`;
}

export default {
	render(data: string[], id: string, label: string) {
		$(`#${id}`).html(/*html*/ `
                <h2 class="text-2xl font-bold mb-6 text-glow-green">${label}</h2>
                <p class="mb-5 terminal-text">&gt; CLICK ANY CODE TO COPY TO CLIPBOARD</p>
                <div class="row g-2">${data.map(format).join("")}</div>
            `);

		$("[data-code-content]").on("click", function () {
			const code = $(this).attr("data-code-content") ?? "";
			$storage.set("redemptioncodes:copied", [...new Set([...$storage.get("redemptioncodes:copied"), code])]);

			$(`[data-code-content="${code}"] > span`).removeClass("text-glow-green").addClass("opacity-30");
			$(`[data-code-content="${code}"] > i`).removeClass("text-glow-green").addClass("opacity-30");

			navigator.clipboard
				.writeText(code)
				.then(() => toast.success(`Copied code ${code} to clipboard!`))
				.catch(() => toast.error("Failed to copy code to clipboard!"));
		});
	},
};
