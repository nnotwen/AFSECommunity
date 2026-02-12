import { Duration } from "luxon";
import { Valid } from "luxon/src/_util";

// Import toast if you have it available in helper.ts, otherwise we'll handle it differently
// import toast from "../../components/toast";

export const ticksPerStat = {
	STRENGTH: { AFK: 42, CLICKING: 52 },
	DURABILITY: { AFK: 32, CLICKING: 32 },
	CHAKRA: { AFK: 22, CLICKING: 25 },
	SWORD: { AFK: 42, CLICKING: 48 },
};

/**
 * Converts a number between standard and abbreviated formats.
 *
 * @template T - The direction of conversion: "parse" or "format"
 * @param value - The value to convert (string or number)
 * @param direction - The conversion direction: "parse" converts abbreviated format to number, "format" converts number to abbreviated format
 * @returns A number if direction is "parse", a string if direction is "format"
 * @throws {Error} When parsing with an invalid suffix
 * @example
 * convertNum("1.5M", "parse") // returns 1500000
 * convertNum(1500000, "format") // returns "1.5M"
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

		if (!match) {
			throw new Error(`Invalid number format: "${value}"`);
		}

		const num = parseFloat(match[1]);
		const sufx = match[2];

		// If suffix exists but not in multipliers, throw an error
		if (sufx && !multipliers[sufx]) {
			throw new Error(`Invalid Suffix (${sufx}): Suffix must only be one of the following: ${Object.keys(multipliers).join(", ")}`);
		}

		return (match[2] ? num * (multipliers[match[2]] ?? 1) : num) as any;
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

		return (suffix ? (num / divisor).toFixed(2).replace(/\.00$/, "") + suffix : num.toFixed(2)) as any;
	}
}

/**
 * Converts a Duration object into a human-readable string representation.
 *
 * @param duration - The Duration object to convert, must be valid
 * @returns A string representation of the duration in the format "X Days Y Hours Z Minutes A Seconds"
 *
 * @example
 * const duration = Duration.fromObject({ days: 2, hours: 3, minutes: 15, seconds: 45 });
 * humanizeDuration(duration); // "2 Days 3 Hours 15 Minutes 45 Seconds"
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
 * Escapes HTML special characters in a string by leveraging the browser's built-in HTML escaping mechanism.
 * @param str - The string to escape
 * @returns The escaped HTML string
 */
export function escapeHTML(str: string) {
	const div = document.createElement("div");
	div.textContent = str; // browser handles escaping
	return div.innerHTML;
}

/**
 * Validates and parses a numeric input string with optional default value fallback.
 *
 * @param value - The input string to validate and parse
 * @param fieldName - The name of the field being validated (used in error messages)
 * @param defaultVal - Optional default value to use if the input is empty
 * @param showToast - Optional function to show toast notifications
 * @returns An object containing:
 *   - `isValid`: Whether the input is valid
 *   - `parsed`: The parsed numeric value (0 if invalid)
 *   - `error`: Optional error message describing validation failure
 *
 * @remarks
 * The function performs the following validations:
 * - Rejects empty strings unless a default value is provided
 * - Parses numeric strings with suffix formats using `convertNum`
 * - Rejects negative values
 * - Rejects non-finite or NaN values
 * - Catches conversion errors and includes them in the error message
 *
 * @example
 * ```typescript
 * const result = validateInput("100M", "STRENGTH");
 * if (result.isValid) {
 *   console.log(`Parsed value: ${result.parsed}`);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateInput(value: string, fieldName: string, defaultVal?: number): { isValid: boolean; parsed: number; error?: string } {
	const trimmed = value.trim();

	// Handle empty input
	if (!trimmed) {
		if (defaultVal !== undefined) {
			// Return the default value if provided
			return { isValid: true, parsed: defaultVal };
		} else {
			return { isValid: false, parsed: 0, error: `${fieldName} cannot be empty` };
		}
	}

	try {
		// Try to parse the value - convertNum should handle all suffix formats
		const parsed = convertNum(trimmed, "parse");

		// Check for negative values (only real validation we care about)
		if (parsed < 0) {
			return { isValid: false, parsed: parsed, error: `${fieldName} cannot be negative` };
		}

		// Check for NaN or Infinity
		if (!isFinite(parsed) || isNaN(parsed)) {
			return { isValid: false, parsed: 0, error: `${fieldName}: Invalid number` };
		}

		// For CHAMPION STAT/TICK, allow 0
		// For other fields, check if it's 0 (invalid except for CHAMPION STAT/TICK)
		if (parsed === 0 && fieldName !== "CHAMPION STAT/TICK") {
			return { isValid: false, parsed: 0, error: `${fieldName} cannot be zero` };
		}

		return { isValid: true, parsed: parsed };
	} catch (error) {
		// If convertNum throws an error, the format is invalid
		const errorMessage = (error as Error).message;
		return {
			isValid: false,
			parsed: 0,
			error: `${fieldName}: ${errorMessage}`,
		};
	}
}
