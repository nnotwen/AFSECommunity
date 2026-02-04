import $ from "jquery";

const credits = [
	{ label: "Lead Developer", content: "KAGESAN21", glow: "blue" },
	{ label: "UI/UX", content: "KAGESAN21", glow: "purple" },
	{ label: "Data Analyst", content: "KAGESAN21", glow: "green" },
	{ label: "Version", content: "v4.4.1 AFSE", glow: "pink" },
];

export default {
	render(id: string) {
		$(`#${id}`).html(/*html*/ `
            <h2 class="text-2xl font-bold mb-6 text-glow-blue">DEVELOPMENT CREDITS</h2>
            <div class="row g-2">${credits.map(formatCreds).join("")}</div>
            <div class="cyber-card mt-2">
                <p class="text-xl font-bold text-glow-blue text-uppercase">Acknowledgement</p>
                <p class="text-sm terminal-text">All systems, calculators, and databases were developed by KAGESAN21 for the AFSE Community Guidelines hub.</p>
            </div>
        `);
	},
};

function formatCreds(credit: (typeof credits)[number]) {
	return /*html*/ `
    <div class="col-sm-6 col-md-4">
        <div class="cyber-card">
            <p class="text-sm terminal-text text-uppercase">${credit.label}</p>
            <p class="text-xl font-bold text-glow-${credit.glow}">${credit.content}</p>
        </div>
    </div>`;
}
