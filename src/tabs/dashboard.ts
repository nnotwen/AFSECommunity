import $ from "jquery";
import { DataConfig } from "../types/data";
import { DateTime } from "luxon";
import { buildModal } from "../components/modal";
import { generateUniqueId } from "../utils/idGenerator";
import toast from "../components/toast";
import { DiscordWebhookMessage } from "../types/discordwebhook";
import $storage from "../components/storage";
import { Modal, Tooltip } from "bootstrap";

const credits = [
	{ label: "Lead Developer", content: "KAGESAN21", glow: "blue" },
	{ label: "UI/UX", content: "KAGESAN21", glow: "purple" },
	{ label: "Data Analyst", content: "KAGESAN21 & ZYLYZ_", glow: "green" },
	{ label: "Version", content: '<span class="version-label"></span> AFSE', glow: "pink" },
];

export default {
	render(data: DataConfig, id: string) {
		const sorted = data.changelog.sort((a, b) => b.timestamp - a.timestamp);
		const feedbackTitleId = generateUniqueId();
		const feedbackBodyId = generateUniqueId();
		const feedbackSubmitId = generateUniqueId();
		const feedbackGithubSubmitId = generateUniqueId();

		const feedbackModalId = buildModal({
			htmlHeading: /*html*/ `
                <div class="text-orbitron text-uppercase text-cyber-yellow text-glow-yellow">Feedback</div>
            `,
			htmlBody: /*html*/ `
                <div class="mb-3 text-terminal">Please fill in the details below regarding your feedback. You may also send bug reports through this form.</div>
                <form>
                    <div class="mb-3">
                        <label for="${feedbackTitleId}" class="form-label text-terminal text-cyber-yellow text-glow-yellow">TITLE</label>
                        <input id="${feedbackTitleId}" type="text" type="text" maxlength="256" placeholder="Give a descriptive title for your feedback" class="form-control cyber-input cyber-input-yellow input-no-spinner text-terminal">
                    </div>
                    <div class="mb-3">
                        <label for="${feedbackBodyId}" class="form-label text-terminal text-cyber-yellow text-glow-yellow">BODY</label>
                        <div class="position-relative p-0" style="padding-bottom: 1.75rem!important;">
                            <textarea class="pb-2 form-control cyber-input cyber-input-yellow input-no-spinner text-terminal" maxlength="2000" id="${feedbackBodyId}" rows="5" placeholder="Please describe your feedback in detail..."></textarea>
                            <span data-charcount-for="${feedbackBodyId}" class="position-absolute text-terminal text-sm right-0 bottom-0 opacity-30 user-select-none">0 / 2000</span>
                        </div>
                    </div>
                    <div class="mb-3 d-flex justify-content-end gap-2">
                        <button id="${feedbackSubmitId}" class="cyber-btn cyber-btn-yellow">SUBMIT</button>
                        <button id="${feedbackGithubSubmitId}" class="cyber-btn cyber-btn-yellow">SUBMIT IN GITHUB</button>
                    </div>
                </form>
            `,
			className: "bg-card border-cyber-yellow border-opacity-50 hover:border-opacity-100 hover:border-glow-yellow",
		});

		// Add tooltip
		new Tooltip(`#${feedbackSubmitId}`, {
			animation: true,
			title: "your info is anonymized when you send your feedback",
			customClass: "bg-dark-2 text-glow-yellow bg-opacity-90 border-cyber-yellow border-opacity-30 rounded text-terminal text-uppercase tracking-widest",
			placement: "top",
			trigger: "hover",
		});

		new Tooltip(`#${feedbackGithubSubmitId}`, {
			animation: true,
			title: "You need a github account to open an issue in github",
			customClass: "bg-dark-2 text-glow-yellow bg-opacity-90 border-cyber-yellow border-opacity-30 rounded text-terminal text-uppercase tracking-widest",
			placement: "top",
			trigger: "hover",
		});

		const keys = {
			[feedbackTitleId]: "TITLE",
			[feedbackBodyId]: "BODY",
		};

		$(`#${feedbackTitleId}, #${feedbackBodyId}`)
			.on("focus", function () {
				$(this).removeClass("invalid");
			})
			.on("input", function () {
				const key = keys[$(this).attr("id") as string];
				if (key) $storage.set(`feedback:lastinput:${key}`, $(this).val() as string);
			})
			.each((_, el) => {
				const key = keys[$(el).attr("id") as string];
				if (key) $(el).val($storage.getOrSet<string>(`feedback:lastinput:${key}`, ""));
			});

		$(`#${feedbackBodyId}`).on("input", function () {
			const len = ($(this).val() as string).length;
			$(`[data-charcount-for="${feedbackBodyId}"]`).text(`${len} / 2000`);
		});

		$(`#${feedbackSubmitId}, #${feedbackGithubSubmitId}`).on("click touchstart", function (e) {
			e.preventDefault();

			const title = ($(`#${feedbackTitleId}`).val() as string).trim();
			const body = ($(`#${feedbackBodyId}`).val() as string).trim();
			const errors: string[] = [];

			if (!title.length) {
				$(`#${feedbackTitleId}`).addClass("invalid");
				errors.push("Title field cannot be blank!");
			}

			if (!body.length) {
				$(`#${feedbackBodyId}`).addClass("invalid");
				errors.push("Body field cannot be blank!");
			}

			if (errors.length) return toast.error(errors.join("<br>"));

			if ($(this).attr("id") === feedbackGithubSubmitId) {
				const baseURI = "https://github.com/Yorusensei/AFSECommunity";
				const ftitle = `[Feedback] ${encodeURIComponent(title)}`;
				const fbody = encodeURIComponent(body);
				window.open(`${baseURI}/issues/new?title=${ftitle}&body=${fbody}`, "_blank");

				$storage.set("feedback:lastinput:TITLE", "");
				$storage.set("feedback:lastinput:BODY", "");

				$(`#${feedbackBodyId}, #${feedbackTitleId}`).each((_, el) => {
					$(el).val("");
				});
			} else {
				if ($storage.getOrSet<boolean>("feedback:state:sending", false) === true) {
					return toast.warning("We are currently sending your feedback. Please wait...");
				}

				if ($storage.getOrSet<number>("feedback:timeout", Date.now()) > Date.now()) {
					const relative = DateTime.fromMillis($storage.get("feedback:timeout")).toRelative();
					return toast.warning(`You can only send a feedback every 1 hour. You can send a feedback again ${relative}`);
				}

				const webhook: DiscordWebhookMessage = {
					content: "Feedback received: ",
					embeds: [
						{
							title,
							description: body,
							color: 0xffcc00,
							thumbnail: { url: window.location.href + "/icons/icon-256.png" },
							timestamp: new Date().toISOString(),
						},
					],
				};

				const form = new FormData();
				form.append("payload_json", JSON.stringify(webhook));

				toast.info("Sending feedback to the developer...");
				$storage.set("feedback:state:sending", true);

				fetch(import.meta.env.VITE_FEEDBACK_WEBHOOK_URL, { method: "POST", body: form })
					.then((res) => {
						if (!res.ok) throw new Error(res.statusText);

						$storage.set("feedback:timeout", Date.now() + 1000 * 60 * 60);
						$storage.set("feedback:lastinput:TITLE", "");
						$storage.set("feedback:lastinput:BODY", "");
						$(`#${feedbackBodyId}, #${feedbackTitleId}`).each((_, el) => {
							$(el).val("");
						});

						toast.success("Feedback sent to the developer!");
					})
					.catch(() => {
						toast.error("There was a problem sending the feedback to developer! Please try again later!");
					})
					.finally(() => {
						$storage.set("feedback:state:sending", false);
					});
			}
		});

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
                        <div class="flex gap-2 mt-4">
                            <a href="https://discord.gg/afse" class="cyber-btn btn-primary text-white hover:text-cyber-blue border-cyber border-cyber-blue border-opacity-30 hover:border-opacity-100" target="_blank"><i class="bi bi-discord"></i></a>
                            <a href="https://github.com/Yorusensei/AFSECommunity" class="cyber-btn btn-primary text-white hover:text-cyber-blue border-cyber border-cyber-blue border-opacity-30 hover:border-opacity-100" target="_blank"><i class="bi bi-github"></i></a>
                            <button class="cyber-tab cyber-tab-yellow text-white hover:text-cyber-yellow border-cyber-yellow border-opacity-30 hover:border-opacity-100" data-bs-toggle="modal" data-bs-target="#${feedbackModalId}"><i class="fas fa-comment"></i></button>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div data-tab-changelog="true" class="cyber-card">
                        <h2 class="text-xl font-bold mb-4 text-glow-green">CHANGELOG</h2>
                        <div class="flex flex-col gap-2">
                            ${sorted.slice(0, 5).map(formatChangelogEntry).join("")}
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="cyber-card">
                        <h2 class="text-xl font-bold mb-4 text-glow-blue">DEVELOPMENT CREDITS</h2>
                        <div class="row g-2">${credits.map(formatCreds).join("")}</div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="cyber-card mt-2">
                        <p class="text-xl font-bold text-glow-blue text-uppercase">Acknowledgement</p>
                        <p class="text-sm terminal-text">All systems, calculators, and databases were developed by KAGESAN21 for the AFSE Community Guidelines hub.</p>
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

function formatCreds(credit: (typeof credits)[number]) {
	return /*html*/ `
    <div class="col-sm-6 col-md-4">
        <div class="cyber-card">
            <p class="text-sm text-terminal text-cyber-green text-glow-green text-uppercase">${credit.label}</p>
            <p class="text-xl font-bold text-glow-${credit.glow}">${credit.content}</p>
        </div>
    </div>`;
}
