CREATE TABLE `cache_characters` (
	`lodestone_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`world` text NOT NULL,
	`dc` text NOT NULL,
	`avatar` text,
	`data` text,
	`fetched_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_cache_expires` ON `cache_characters` (`expires_at`);--> statement-breakpoint
CREATE INDEX `idx_cache_name_world` ON `cache_characters` (`name`,`world`);