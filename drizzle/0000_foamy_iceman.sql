CREATE TABLE `content_items` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text DEFAULT '' NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`image` text DEFAULT '' NOT NULL,
	`meta` text DEFAULT '{}' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_content_items_type_sort` ON `content_items` (`type`,`sort_order`);--> statement-breakpoint
CREATE TABLE `leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`source` text DEFAULT 'site' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_leads_status_created` ON `leads` (`status`,`created_at`);