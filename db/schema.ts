import { pgTable, serial, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";

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

export type Place = typeof places.$inferSelect;
export type NewPlace = typeof places.$inferInsert;
export type Hotel = typeof hotels.$inferSelect;
export type NewHotel = typeof hotels.$inferInsert;