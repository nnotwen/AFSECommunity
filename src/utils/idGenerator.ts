// Store all generated IDs here
const usedIds = new Set<string>();

// Character set for alphanumeric IDs
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Generate a secure, unique 8-character alphanumeric ID.
 */
export function generateUniqueId(): string {
	let id: string;

	do {
		// Generate 8 random values securely
		const randomValues = crypto.getRandomValues(new Uint8Array(8));

		// Map each random value to a character
		id = Array.from(randomValues)
			.map((n) => chars[n % chars.length])
			.join("");
	} while (usedIds.has(id)); // Retry if duplicate

	// Store the new ID in the set
	usedIds.add(id);

	return id;
}
