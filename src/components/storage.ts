// storage.ts
const STORAGE_KEY = "application.storage";

function loadRaw(): Record<string, any> {
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return {};

	try {
		const decoded = atob(raw);
		return JSON.parse(decoded);
	} catch (err) {
		console.error("Failed to decode storage:", err);
		return {};
	}
}

function saveRaw(obj: Record<string, any>) {
	try {
		const encoded = btoa(JSON.stringify(obj));
		localStorage.setItem(STORAGE_KEY, encoded);
	} catch (err) {
		console.error("Failed to encode storage:", err);
	}
}

const $storage = {
	get(key?: string) {
		const data = loadRaw();
		return key ? data[key] : data;
	},

	set(key: string, value: any) {
		const data = loadRaw();
		data[key] = value;
		saveRaw(data);
	},

	delete(key: string) {
		const data = loadRaw();
		delete data[key];
		saveRaw(data);
	},

	reset() {
		saveRaw({});
	},

	has(key: string) {
		const data = loadRaw();
		return Object.prototype.hasOwnProperty.call(data, key);
	},

	getOrSet<T = any>(key: string, defaultValue: T): T {
		const data = loadRaw();
		if (Object.prototype.hasOwnProperty.call(data, key)) {
			return data[key];
		}
		data[key] = defaultValue;
		saveRaw(data);
		return defaultValue;
	},
};

export default $storage;
