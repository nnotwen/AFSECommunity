import $ from "jquery";

export default {
	render(data: Record<string, any>, id: string) {
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
                    <div class="cyber-card">
                        <h2 class="text-xl font-bold mb-4 text-glow-green">CHANGELOGS</h2>
                        <div class="space-y-3">
                            <div class="p-3 rounded bg-dark-2">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="cyber-badge badge-green opacity-100">UPDATE</span>
                                    <span class="text-sm terminal-text">[TODAY 5:27AM]</span>
                                </div>
                                <p class="terminal-text">&gt; Added NPC &amp; Incremental Calculator.</p>
                            </div>
                            <div class="p-3 rounded bg-dark-2">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="cyber-badge badge-blue opacity-100">IMPROVED</span>
                                    <span class="text-sm terminal-text">[DAY 9]</span>
                                </div>
                                <p class="terminal-text">&gt; Logics on calculator.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);

		$(".version-label").text(`V${data.version}`);
		$(".copyright-year").text(new Date().getFullYear());
	},
};
