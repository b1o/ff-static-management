CREATE TABLE `characters` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`world` text NOT NULL,
	`dc` text NOT NULL,
	`data` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_characters_userId` ON `characters` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `characters_user_id_name_world_dc_unique` ON `characters` (`user_id`,`name`,`world`,`dc`);--> statement-breakpoint
CREATE TABLE `static_characters` (
	`id` text PRIMARY KEY NOT NULL,
	`static_id` text NOT NULL,
	`character_id` text NOT NULL,
	`role` text DEFAULT 'main' NOT NULL,
	`assigned_at` integer NOT NULL,
	FOREIGN KEY (`static_id`) REFERENCES `statics`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_staticCharacters_staticId` ON `static_characters` (`static_id`);--> statement-breakpoint
CREATE INDEX `idx_staticCharacters_characterId` ON `static_characters` (`character_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `static_characters_static_id_character_id_unique` ON `static_characters` (`static_id`,`character_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_invite_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`static_id` text NOT NULL,
	`code` text NOT NULL,
	`created_by` text NOT NULL,
	`expires_at` integer,
	`max_uses` integer,
	`uses` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`static_id`) REFERENCES `statics`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_invite_codes`("id", "static_id", "code", "created_by", "expires_at", "max_uses", "uses", "created_at") SELECT "id", "static_id", "code", "created_by", "expires_at", "max_uses", "uses", "created_at" FROM `invite_codes`;--> statement-breakpoint
DROP TABLE `invite_codes`;--> statement-breakpoint
ALTER TABLE `__new_invite_codes` RENAME TO `invite_codes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `invite_codes_code_unique` ON `invite_codes` (`code`);