CREATE TABLE "app_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "app_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" varchar(32) NOT NULL,
	"customer_name" varchar(160) NOT NULL,
	"customer_email" varchar(254) NOT NULL,
	"customer_phone" varchar(40) NOT NULL,
	"start_date" text NOT NULL,
	"traveller_count" integer NOT NULL,
	"trip_duration_days" integer NOT NULL,
	"travel_month" varchar(30) NOT NULL,
	"budget_per_person_usd" integer,
	"interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"itinerary" jsonb NOT NULL,
	"estimated_total_usd" integer,
	"final_total_usd" integer,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"supplier_confirmed" boolean DEFAULT false NOT NULL,
	"payment_status" varchar(32) DEFAULT 'unpaid' NOT NULL,
	"customer_notes" text,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "experiences" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"summary" text NOT NULL,
	"detail" text NOT NULL,
	"photo" text,
	"destination_ids" text[],
	"duration_hours" integer NOT NULL,
	"price_from_usd" integer NOT NULL,
	"bookable" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "experiences_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "flights" (
	"id" serial PRIMARY KEY NOT NULL,
	"corridor_id" text,
	"from_city" text NOT NULL,
	"from_airport" text NOT NULL,
	"to_airport" text NOT NULL,
	"airline" text NOT NULL,
	"airline_code" text,
	"stops" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"storage_key" text NOT NULL,
	"original_name" text,
	"url" text NOT NULL,
	"mime_type" text,
	"size_bytes" integer,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "media_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
CREATE TABLE "media_assign" (
	"media_id" integer NOT NULL,
	"assignable_type" text NOT NULL,
	"assignable_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "travel_guides" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"topic" text NOT NULL,
	"body" text NOT NULL,
	"photo" text,
	"destination_ids" text[],
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "travel_guides_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "trip_planning" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	CONSTRAINT "trip_planning_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "media_assign" ADD CONSTRAINT "media_assign_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;