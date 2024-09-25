CREATE TABLE IF NOT EXISTS "authenticators" (
	"id" text PRIMARY KEY NOT NULL,
	"credential_id" text NOT NULL,
	"user_id" text NOT NULL,
	"credential_public_key" text NOT NULL,
	"counter" bigint NOT NULL,
	"credential_device_type" varchar(32) NOT NULL,
	"credential_backed_up" boolean NOT NULL,
	"transports" varchar(255) NOT NULL,
	"aaguid" varchar(36) NOT NULL,
	CONSTRAINT "authenticators_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "authenticators" ADD CONSTRAINT "authenticators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "credential_id_idx" ON "authenticators" USING btree ("credential_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_idx" ON "authenticators" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "username_idx" ON "users" USING btree ("username");