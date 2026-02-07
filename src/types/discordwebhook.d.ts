// Enums for Discord API
export enum DiscordEmbedType {
	RICH = "rich",
	IMAGE = "image",
	VIDEO = "video",
	GIFV = "gifv",
	ARTICLE = "article",
	LINK = "link",
}

export enum DiscordMessageFlags {
	CROSSPOSTED = 1 << 0,
	IS_CROSSPOST = 1 << 1,
	SUPPRESS_EMBEDS = 1 << 2,
	SOURCE_MESSAGE_DELETED = 1 << 3,
	URGENT = 1 << 4,
	HAS_THREAD = 1 << 5,
	EPHEMERAL = 1 << 6,
	LOADING = 1 << 7,
	FAILED_TO_MENTION_SOME_ROLES_IN_THREAD = 1 << 8,
	SUPPRESS_NOTIFICATIONS = 1 << 12,
	IS_VOICE_MESSAGE = 1 << 13,
}

export enum DiscordAllowedMentionTypes {
	ROLES = "roles",
	USERS = "users",
	EVERYONE = "everyone",
}

export enum DiscordComponentType {
	ACTION_ROW = 1,
	BUTTON = 2,
	STRING_SELECT = 3,
	TEXT_INPUT = 4,
	USER_SELECT = 5,
	ROLE_SELECT = 6,
	MENTIONABLE_SELECT = 7,
	CHANNEL_SELECT = 8,
}

export enum DiscordButtonStyle {
	PRIMARY = 1, // blurple
	SECONDARY = 2, // grey
	SUCCESS = 3, // green
	DANGER = 4, // red
	LINK = 5, // grey, navigates to URL
}

// Interfaces
export interface DiscordThumbnail {
	url: string;
	proxy_url?: string;
	height?: number;
	width?: number;
}

export interface DiscordVideo {
	url: string;
	proxy_url?: string;
	height?: number;
	width?: number;
}

export interface DiscordImage {
	url: string;
	proxy_url?: string;
	height?: number;
	width?: number;
}

export interface DiscordProvider {
	name?: string;
	url?: string;
}

export interface DiscordAuthor {
	name: string;
	url?: string;
	icon_url?: string;
	proxy_icon_url?: string;
}

export interface DiscordFooter {
	text: string;
	icon_url?: string;
	proxy_icon_url?: string;
}

export interface DiscordField {
	name: string;
	value: string;
	inline?: boolean;
}

export interface DiscordEmbed {
	title?: string;
	type?: DiscordEmbedType;
	description?: string;
	url?: string;
	timestamp?: string; // ISO8601 timestamp
	color?: number; // decimal color code
	footer?: DiscordFooter;
	image?: DiscordImage;
	thumbnail?: DiscordThumbnail;
	video?: DiscordVideo;
	provider?: DiscordProvider;
	author?: DiscordAuthor;
	fields?: DiscordField[];
}

export interface DiscordEmbedVideo {
	url?: string;
	proxy_url?: string;
	height?: number;
	width?: number;
}

export interface DiscordAttachment {
	id: string;
	filename: string;
	description?: string;
	content_type?: string;
	size: number;
	url: string;
	proxy_url: string;
	height?: number;
	width?: number;
	ephemeral?: boolean;
}

export interface DiscordAllowedMentions {
	parse?: DiscordAllowedMentionTypes[];
	roles?: string[];
	users?: string[];
	replied_user?: boolean;
}

export interface DiscordComponentEmoji {
	id?: string;
	name?: string;
	animated?: boolean;
}

export interface DiscordComponent {
	type: DiscordComponentType;
	style?: DiscordButtonStyle;
	label?: string;
	emoji?: DiscordComponentEmoji;
	custom_id?: string;
	url?: string;
	disabled?: boolean;
	placeholder?: string;
	min_values?: number;
	max_values?: number;
	options?: DiscordSelectOption[];
	channel_types?: number[];
	min_length?: number;
	max_length?: number;
	required?: boolean;
	value?: string;
}

export interface DiscordSelectOption {
	label: string;
	value: string;
	description?: string;
	emoji?: DiscordComponentEmoji;
	default?: boolean;
}

export interface DiscordActionRow {
	type: DiscordComponentType.ACTION_ROW;
	components: DiscordComponent[];
}

export interface DiscordMessageReference {
	message_id?: string;
	channel_id?: string;
	guild_id?: string;
	fail_if_not_exists?: boolean;
}

export interface DiscordWebhookMessage {
	// Basic message content
	content?: string;
	username?: string;
	avatar_url?: string;
	tts?: boolean;
	embeds?: DiscordEmbed[];
	allowed_mentions?: DiscordAllowedMentions;
	flags?: DiscordMessageFlags;
	components?: DiscordActionRow[];
	attachments?: DiscordAttachment[];
	// Threads
	thread_name?: string;
	// Message reference (reply)
	message_reference?: DiscordMessageReference;
}

// For files + JSON (multipart/form-data)
export interface DiscordWebhookMultipartPayload {
	payload_json: string; // JSON string of DiscordWebhookMessage
	file?: File | Blob; // For attachments
}

// Complete webhook response interfaces
export interface DiscordWebhookResponse {
	id: string;
	type: number;
	content: string;
	channel_id: string;
	author: DiscordWebhookAuthor;
	attachments: DiscordAttachment[];
	embeds: DiscordEmbed[];
	mentions: DiscordMention[];
	mention_roles: string[];
	pinned: boolean;
	mention_everyone: boolean;
	tts: boolean;
	timestamp: string;
	edited_timestamp: string | null;
	flags: number;
	components: DiscordComponent[];
	webhook_id: string;
}

export interface DiscordWebhookAuthor {
	id: string;
	username: string;
	avatar: string;
	discriminator: string;
	public_flags: number;
	flags: number;
	bot: boolean;
}

export interface DiscordMention {
	id: string;
	username: string;
	avatar: string;
	discriminator: string;
	public_flags: number;
	flags: number;
	bot: boolean;
	global_name?: string;
	avatar_decoration?: string;
	display_name?: string;
}
