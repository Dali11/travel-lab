import { pgTable, serial, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const places = pgTable("places", {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    name: varchar("name", { length: 160 }).notNull(),
    region: varchar("region", { length: 160 }).notNull(),
    category: varchar("category", { length: 40 }).notNull(),
    blurb: text("blurb").notNull(),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hotels = pgTable("hotels", {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    name: varchar("name", { length: 160 }).notNull(),
    location: varchar("location", { length: 160 }).notNull(),
    tier: varchar("tier", { length: 20 }).notNull(), // Budget | Mid-range | Luxury
    pricePerNight: integer("price_per_night").notNull(), // USD, whole dollars
    rating: integer("rating").notNull(), // out of 50, so 4.5 -> 45 (avoids float rounding)
    blurb: text("blurb").notNull(),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// New content tables. These are ADDITIVE only: no existing row is altered or
// deleted, and `db:push` appends these tables to the database on top of the
// current `places` and `hotels` rows. They mirror the static editorial data in
// `lib/data/*` so the admin dashboard can manage it (see Phase 7).
// ---------------------------------------------------------------------------

/** What you can do, mirroring `lib/data/experiences.ts`. */
export const experiences = pgTable("experiences", {
    id: text("id").primaryKey(),            // e.g. "sunset-over-lake-malawi"
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    summary: text("summary").notNull(),
    detail: text("detail").notNull(),
    photo: text("photo"),                     // key into data/photos.json
    destinationIds: text("destination_ids").array(),
    durationHours: integer("duration_hours").notNull(),
    priceFromUsd: integer("price_from_usd").notNull(),
    bookable: boolean("bookable").notNull().default(false),
    published: boolean("published").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** Travel guides mirroring `lib/guides.ts` content. */
export const travel_guides = pgTable("travel_guides", {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    topic: text("topic").notNull(),
    body: text("body").notNull(),
    photo: text("photo"),
    destinationIds: text("destination_ids").array(),
    published: boolean("published").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** Flight corridors + route shapes, mirroring `lib/flights.ts` + `lib/data/routes.ts`. */
export const flights = pgTable("flights", {
    id: serial("id").primaryKey(),
    corridorId: text("corridor_id"),
    fromCity: text("from_city").notNull(),
    fromAirport: text("from_airport").notNull(),
    toAirport: text("to_airport").notNull(),
    airline: text("airline").notNull(),
    airlineCode: text("airline_code"),
    stops: text("stops").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** Trip-planning machine defaults, mirroring `lib/itinerary.ts`. */
export const trip_planning = pgTable("trip_planning", {
    id: serial("id").primaryKey(),
    key: text("key").notNull().unique(),
    value: jsonb("value").notNull(),
});

/** Flat key/value settings persisted through the Settings page. */
export const app_settings = pgTable("app_settings", {
    id: serial("id").primaryKey(),
    key: text("key").notNull().unique(),
    value: text("value").notNull(),
});

/** Administrators for the `/admin` area. One row per operator. */
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("admin"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** A single uploaded photograph, stored in Neon Storage. Admins can browse and
 *  delete uploads here. Every row is stored once and referenced by the
 *  `media_assign` join below. */
export const media = pgTable("media", {
    id: serial("id").primaryKey(),
    storageKey: text("storage_key").notNull().unique(),
    originalName: text("original_name"),
    url: text("url").notNull(),
    mimeType: text("mime_type"),
    sizeBytes: integer("size_bytes"),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

/** Which administrative content record an image is attached to. */
export const media_assign = pgTable("media_assign", {
    mediaId: integer("media_id").notNull().references(() => media.id),
    assignableType: text("assignable_type").notNull(), // "place" | "hotel"
    assignableId: integer("assignable_id").notNull(),
});
export const mediaCreatedAt = media.uploadedAt; // named export for clean joins

export type Place = typeof places.$inferSelect;
export type NewPlace = typeof places.$inferInsert;
export type Hotel = typeof hotels.$inferSelect;
export type NewHotel = typeof hotels.$inferInsert;
export type Experience = typeof experiences.$inferSelect;
export type NewExperience = typeof experiences.$inferInsert;
export type TravelGuide = typeof travel_guides.$inferSelect;
export type NewTravelGuide = typeof travel_guides.$inferInsert;
export type Flight = typeof flights.$inferSelect;
export type NewFlight = typeof flights.$inferInsert;
export type TripPlanning = typeof trip_planning.$inferSelect;
export type AppSetting = typeof app_settings.$inferSelect;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

/**
 * Customer booking requests.
 * Estimated prices are indicative only; bookings remain pending until
 * supplier availability and final pricing have been confirmed.
 */
export const bookings = pgTable("bookings", {
    id: serial("id").primaryKey(),
    reference: varchar("reference", { length: 32 }).notNull().unique(),
    customerName: varchar("customer_name", { length: 160 }).notNull(),
    customerEmail: varchar("customer_email", { length: 254 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 40 }).notNull(),
    startDate: text("start_date").notNull(),
    travellerCount: integer("traveller_count").notNull(),
    tripDurationDays: integer("trip_duration_days").notNull(),
    travelMonth: varchar("travel_month", { length: 30 }).notNull(),
    budgetPerPersonUsd: integer("budget_per_person_usd"),
    interests: jsonb("interests").$type<string[]>().notNull().default([]),
    itinerary: jsonb("itinerary").$type<Record<string, unknown>>().notNull(),
    estimatedTotalUsd: integer("estimated_total_usd"),
    finalTotalUsd: integer("final_total_usd"),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    supplierConfirmed: boolean("supplier_confirmed").notNull().default(false),
    paymentStatus: varchar("payment_status", { length: 32 }).notNull().default("unpaid"),
    customerNotes: text("customer_notes"),
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
