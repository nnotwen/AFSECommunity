import { Duration } from "luxon";
import { Valid } from "luxon/src/_util";

export const ticksPerStat = {
	STRENGTH: { AFK: 42, CLICKING: 52 },
	DURABILITY: { AFK: 32, CLICKING: 32 },
	CHAKRA: { AFK: 22, CLICKING: 25 },
	SWORD: { AFK: 42, CLICKING: 48 },
};

/**
 * Converts in-game number to actual number and vice versa
 * @param value
 * @param direction
 * @returns
 */
export function convertNum<T extends "parse" | "format">(value: string | number, direction: T): T extends "parse" ? number : string {
	const multipliers: Record<string, number> = {
		K: 1e3,
		M: 1e6,
		B: 1e9,
		T: 1e12,
		QD: 1e15,
		QN: 1e18,
		SX: 1e21,
		SP: 1e24,
		OC: 1e27,
		N: 1e30,
		DE: 1e33,
		UD: 1e36,
		DD: 1e39,
	};

	if (direction === "parse") {
		if (!value) return 0 as any;
		const str = value.toString().toUpperCase().replace(/,/g, "");
		const match = str.match(/^([0-9.]+)([A-Z]+)?$/);
		const num = parseFloat(match?.[1] ?? str);
		return (match?.[2] ? num * (multipliers[match[2]] ?? 1) : num) as any;
	} else {
		const num = typeof value === "number" ? value : parseFloat(value);
		if (isNaN(num)) return "0" as any;

		const entries = Object.entries(multipliers).sort((a, b) => a[1] - b[1]);
		let suffix = "";
		let divisor = 1;

		for (const [key, mult] of entries) {
			if (num >= mult) {
				suffix = key;
				divisor = mult;
			}
		}

		return (suffix ? (num / divisor).toFixed(2).replace(/\.00$/, "") + suffix : num.toString()) as any;
	}
}

/**
 * Converts duration to human readable duration (X Days Y Hours Z Minutes S Seconds)
 * @param duration
 * @returns
 */
export function humanizeDuration(duration: Duration<Valid>) {
	const parts: string[] = [];

	duration = duration.shiftTo("days", "hours", "minutes", "seconds");

	if (duration.days) parts.push(`${duration.days} Day${duration.days === 1 ? "" : "s"}`);
	if (duration.hours) parts.push(`${duration.hours} Hour${duration.hours === 1 ? "" : "s"}`);
	if (duration.minutes) parts.push(`${duration.minutes} Minute${duration.minutes === 1 ? "" : "s"}`);

	const secs = Math.floor(duration.seconds);
	if (secs) parts.push(`${secs} Second${secs === 1 ? "" : "s"}`);

	return parts.join(" ");
}

/**
 * Converts HTML into string (sanitizes html tags)
 * @param str
 * @returns
 */
export function escapeHTML(str: string) {
	const div = document.createElement("div");
	div.textContent = str; // browser handles escaping
	return div.innerHTML;
}
