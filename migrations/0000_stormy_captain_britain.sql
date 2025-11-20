CREATE TABLE "connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"service" text NOT NULL,
	"description" text,
	"api_key" text,
	"config" jsonb DEFAULT '{}'::jsonb,
	"status" text DEFAULT 'disconnected' NOT NULL,
	"last_sync" timestamp,
	"webhook_url" text,
	"webhook_secret" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mcp_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"connection_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"workflow_id" integer,
	"workflow_name" text NOT NULL,
	"status" text NOT NULL,
	"items_processed" integer DEFAULT 0,
	"duration" integer,
	"error_message" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"source_service" text NOT NULL,
	"target_service" text NOT NULL,
	"source_connection_id" integer,
	"target_connection_id" integer,
	"status" text DEFAULT 'draft' NOT NULL,
	"schedule" text DEFAULT 'manual',
	"config" jsonb DEFAULT '{}'::jsonb,
	"last_run" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mcp_messages" ADD CONSTRAINT "mcp_messages_connection_id_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_source_connection_id_connections_id_fk" FOREIGN KEY ("source_connection_id") REFERENCES "public"."connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_target_connection_id_connections_id_fk" FOREIGN KEY ("target_connection_id") REFERENCES "public"."connections"("id") ON DELETE no action ON UPDATE no action;