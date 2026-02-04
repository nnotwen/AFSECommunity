import $ from "jquery";
import { AutoClickEntry } from "../types/data";
import { generateUniqueId } from "../utils/idGenerator";

const steps = [
	"Download OP Auto Clicker from the link above",
	"Open Anime Fighting Simulator in Roblox",
	"Select the stat you want to train",
	"Set the autoclicker to the MS delay above",
	"Position your cursor as specified",
	"Start the autoclicker",
];

const troubleshootingSteps = [
	{
		header: "Timing Issues",
		desc: "Try adjusting MS by ±50ms if it doesn't work",
		icon: "bi bi-clock-history me-2",
	},
	{
		header: "High Ping",
		desc: "Higher ping may require increased MS delay",
		icon: "bi bi-wifi-off me-2",
	},
	{
		header: "Not working",
		desc: "Different pings may need different settings",
		icon: "bi bi-exclamation-octagon me-2",
	},
];

export default {
	render(data: AutoClickEntry[], id: string, label: string) {
		const accordionId = generateUniqueId();
		const infoId = generateUniqueId();
		const setupId = generateUniqueId();
		const stepsId = generateUniqueId();
		const troubleshootingId = generateUniqueId();
		const credsId = generateUniqueId();

		$(`#${id}`).html(/*html*/ `
                <h2 class="text-2xl font-bold mb-6 text-glow-purple">AUTO-TRAIN MS-REMOVED</h2>
                <div class="flex flex-column gap-2 mb-6">
                    <div class="cyber-badge badge-pink w-fit opacity-100">EXPERIMENTAL</div>
                    <div class="terminal-text">&gt; These settings are being tested and will be updated if we find better ones</div>
                    <div class="terminal-text">&gt; They're not meant to be perfect, just mostly consistent and faster</div>
                </div>

                <div class="accordion" data-bs-theme="dark" id="${accordionId}">
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button text-xl font-bold text-glow-blue" type="button" data-bs-toggle="collapse" data-bs-target="#${infoId}" aria-expanded="true">
                               <i class="bi bi-info-circle-fill me-2"></i>Important Info
                            </button>
                        </h2>
                        <div id="${infoId}" class="accordion-collapse collapse show" data-bs-parent="#${accordionId}">
                            <div class="accordion-body" style="background:linear-gradient(145deg, rgba(26, 26, 37, 0.9), rgba(17, 17, 26, 0.9))">
                                <div class="flex flex-column gap-2 text-md">
                                    <p class="mb-0 terminal-text"> 
                                        <i class="bi bi-link-45deg text-glow-blue me-2"></i>Link:
                                        <a href="https://www.opautoclicker.com/" target="_blank" class="text-decoration-none hover:underline">https://www.opautoclicker.com/</a>
                                    </p>
                                    <p class="mb-0 terminal-text"> 
                                        <i class="bi bi-wifi text-glow-blue me-2"></i>You need good or average ping (40-70ms) for it to work properly
                                    </p>
                                    <p class="mb-0 terminal-text"> 
                                        <i class="bi bi-mouse text-glow-blue me-2"></i>DO NOT touch the icon before starting the autoclicker!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed text-xl font-bold text-glow-blue" type="button" data-bs-toggle="collapse" data-bs-target="#${setupId}" aria-expanded="true">
                               <i class="bi bi-gear-fill me-2"></i>OP Autoclicker Setup
                            </button>
                        </h2>
                        <div id="${setupId}" class="accordion-collapse collapse" data-bs-parent="#${accordionId}">
                            <div class="accordion-body" style="background:linear-gradient(145deg, rgba(26, 26, 37, 0.9), rgba(17, 17, 26, 0.9))">
                                <table class="table table-striped table-responsive table-hover" data-bs-theme="dark" style="border:1px solid var(--cyber-blue)">
                                    <thead><tr class="terminal-text">
                                        <th scope="col" style="color: var(--cyber-green)">Stat Type</th>
                                        <th scope="col" style="color: var(--cyber-green)">MS Delay</th>
                                        <th scope="col" style="color: var(--cyber-green)">Auto Train</th>
                                        <th scope="col" style="color: var(--cyber-green)">Cursor Position</th>
                                    </tr></thead>
                                    <tbody>${data.map(formatTableEntry).join("")}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed text-xl font-bold text-glow-blue" type="button" data-bs-toggle="collapse" data-bs-target="#${stepsId}" aria-expanded="true">
                               <i class="bi bi-list-ol me-2"></i>Setup Steps
                            </button>
                        </h2>
                        <div id="${stepsId}" class="accordion-collapse collapse" data-bs-parent="#${accordionId}">
                            <div class="accordion-body" style="background:linear-gradient(145deg, rgba(26, 26, 37, 0.9), rgba(17, 17, 26, 0.9))">
                                <ol class="space-y-3">${steps.map(formatSteps).join("")}</ol>
                            </div>
                        </div>
                    </div>
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed text-xl font-bold text-glow-blue" type="button" data-bs-toggle="collapse" data-bs-target="#${troubleshootingId}" aria-expanded="true">
                               <i class="bi bi-wrench me-2"></i>Troubleshooting
                            </button>
                        </h2>
                        <div id="${troubleshootingId}" class="accordion-collapse collapse" data-bs-parent="#${accordionId}">
                            <div class="accordion-body" style="background:linear-gradient(145deg, rgba(26, 26, 37, 0.9), rgba(17, 17, 26, 0.9))">
                                <div class="space-y-3">${troubleshootingSteps.map(formatTroubleshootingSteps).join("")}</div>
                            </div>
                        </div>
                    </div>
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed text-xl font-bold text-glow-blue" type="button" data-bs-toggle="collapse" data-bs-target="#${credsId}" aria-expanded="true">
                               <i class="bi bi-person-raised-hand me-2"></i>Credits and Support
                            </button>
                        </h2>
                        <div id="${credsId}" class="accordion-collapse collapse" data-bs-parent="#${accordionId}">
                            <div class="accordion-body" style="background:linear-gradient(145deg, rgba(26, 26, 37, 0.9), rgba(17, 17, 26, 0.9))">
                                <p class="terminal-text">Tested and documented by:</p>
                                <div class="flex gap-2">
                                    <span class="cyber-badge badge-blue opacity-100">KAGESAN21</span>
                                    <span class="cyber-badge badge-purple opacity-100">240.ADAMM</span>
                                </div>
                                <p class="my-5 text-center text-terminal">
                                    <p class="terminal-text text-sm text-center">
                                        <i class="bi bi-info-circle"></i> Customer Service | DM for updates/issues. People have different ping so it's probable some don't work, let me know in DMs for adjustments.
                                    </p>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `);
	},
};

function formatTableEntry(entry: AutoClickEntry) {
	function formatBadge(x: string, color: string = "green") {
		return /*html*/ `<span class="cyber-badge badge-${color} opacity-100">${x}</span>`;
	}

	return /*html*/ `
    <tr class="terminal-text align-middle" style="height: 6rem;">
        <th scope="row" class="text-glow-blue text-nowrap">${entry.icon}${entry.type}</th>
        <td>${entry.delay.map((x) => formatBadge(x + "MS", "green")).join(" or ")}</td>
        <td>${formatBadge(entry.autoTrain ? "On" : "Off", entry.autoTrain ? "green" : "red")}</td>
        <td style="color: var(--cyber-green)">${entry.cursorPos}</td>
    </tr>`;
}

function formatSteps(step: string, idx: number) {
	return /*html*/ `
    <li class="flex items-start gap-2">
        <span class="cyber-badge badge-blue">${idx + 1}</span>
        <span class="terminal-text">${step}</span>
    </li>`;
}

function formatTroubleshootingSteps(step: (typeof troubleshootingSteps)[number]) {
	return /*html*/ `
    <div class="p-3">
        <p class="font-medium text-uppercase mb-0">
            <i class="${step.icon}"></i>${step.header}
        </p>
        <p class="terminal-text text-sm mb-0">${step.desc}</p>
    </div>`;
}
