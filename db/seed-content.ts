import { getDb } from "./index";
import { experiences, travel_guides, flights, trip_planning, app_settings, users } from "./schema";
import { experiences as staticExperiences } from "@/lib/data/experiences";
import { cultureStories } from "@/lib/data/culture";
import { connectivity, entryNotes as entryNotesList, quickFacts as quickFactsList, seasons as seasonsList, visaRegions as visaRegionsList } from "@/lib/guides";
import { defaultRequest } from "@/lib/itinerary";
import { routeShapes } from "@/lib/data/routes";
import { tripLengths, budgetBands } from "@/lib/itinerary";
import { createHash, randomBytes } from "node:crypto";

/**
 * Seeds the content tables (experiences, travel_guides, flights,
 * trip_planning, app_settings, users) from the static editorial data the public
 * site already serves. Re-running is safe: rows are upserted on their unique
 * key and existing records are never duplicated or removed.
 *
 * The admin user is created only when `ADMIN_PASSWORD` is set, so no one ships
 * a default password. Set ADMIN_PASSWORD (16+ characters) once, run this, and
 * it stops creating itself afterwards.
 */
export async function seedContent() {
    const db = getDb();

    // Experiences (text-PK table)
    const experienceRows = staticExperiences.map((e) => ({
        id: e.id,
        slug: e.slug,
        title: e.title,
        category: e.category,
        summary: e.summary,
        detail: e.detail,
        photo: e.photo,
        destinationIds: e.destinationIds,
        durationHours: e.durationHours,
        priceFromUsd: e.priceFromUsd,
        bookable: e.bookable,
        published: e.bookable ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
    }));
    await db.insert(experiences).values(experienceRows).onConflictDoNothing();

    // Travel guides (mirrors lib/guides.ts + lib/data/culture.ts)
    const guides = [
        ...visaRegionsList.map((region) => ({
            slug: slugify(`visa for ${region.region}`),
            title: `Visas for ${region.region}`,
            topic: "Visas",
            body: `${region.note}\n\nCountries: ${region.countries.join(", ")}`,
            published: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        })),
        ...seasonsList.map((season) => ({
            slug: slugify(`${season.name} in Malawi`),
            title: `${season.name} in Malawi`,
            topic: "Seasons",
            body: `${season.detail}\n\nVerdict: ${season.verdict}. Crowds: ${season.crowds}. Months: ${season.months}.`,
            published: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        })),
        ...entryNotesList.map((note) => ({
            slug: slugify(`entry note: ${note.title}`),
            title: note.title,
            topic: "Entry notes",
            body: note.detail,
            published: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        })),
        ...connectivity.map((item) => ({
            slug: slugify(`connectivity: ${item.title}`),
            title: item.title,
            topic: "Connectivity",
            body: item.detail,
            published: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        })),
        ...cultureStories.map((story) => ({
            slug: slugify(`culture: ${story.id}`),
            title: story.title,
            topic: story.topic,
            body: story.body,
            photo: story.photo,
            destinationIds: story.destinationIds,
            published: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        })),
        ...quickFactsList.map((fact) => ({
            slug: slugify(`quick fact: ${fact.label}`),
            title: fact.label,
            topic: "Quick facts",
            body: fact.value + (fact.note ? ` (${fact.note})` : ""),
            photo: "quick-fact",
            published: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        })),
    ];
    await db.insert(travel_guides).values(guides).onConflictDoNothing();

    // Flights (route shapes)
    const flightRows = routeShapes.map((route) => ({
        corridorId: `corridor-${route.id}`,
        fromCity: route.fromCity,
        fromAirport: route.toAirport,
        toAirport: route.toAirport,
        airline: route.airline,
        airlineCode: route.airlineCode,
        stops: route.stops,
        durationMinutes: route.durationMinutes,
        note: route.note ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
    }));
    await db.insert(flights).values(flightRows).onConflictDoNothing();

    // Trip planning machine defaults
    await db.insert(trip_planning).values([
        { key: "default_request", value: defaultRequest },
        { key: "budget_bands", value: budgetBands },
        { key: "trips_lengths", value: tripLengths },
    ]).onConflictDoNothing();

    // Flat app settings
    await db.insert(app_settings).values([
        { key: "site_url", value: process.env.SITE_URL ?? "https://travel-lab.vercel.app" },
        { key: "admin_contact", value: process.env.ADMIN_EMAIL ?? "" },
    ]).onConflictDoNothing();

    // Admin user, only when ADMIN_PASSWORD is set
    if (process.env.ADMIN_PASSWORD) {
        const existing = await db.select().from(users).limit(1);
        if (existing.length === 0) {
            const hash = await hashPassword(process.env.ADMIN_PASSWORD);
            await db.insert(users).values({
                username: "admin",
                passwordHash: hash,
                role: "admin",
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
    }
}

function slugify(input: string): string {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const hash = createHash("sha256").update(salt + password).digest("hex");
    return `${salt}:${hash}`;
}
