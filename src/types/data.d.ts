export interface Champion {
	name: string;
	chance: string;
	cost: string;
	board: number;
	desc: string;
}

export interface CommandSubGroup {
	label: string;
	commands: string[];
}

export interface Quest {
	quest: number;
	requirement: string;
	reward: string;
}

export interface AutoClickEntry {
	type: string;
	delay: number[];
	autoTrain: boolean;
	cursorPos: string;
	icon: string;
}

export interface GachaEntry {
	heading: string;
	description: string;
	images: {
		caption: string;
		path: string;
	}[];
}

export interface DataConfig {
	version: string;
	changelog: {
		type: "added" | "removed" | "update";
		timestamp: number;
		list: string[];
	}[];
}
