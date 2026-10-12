import { getDb } from "./index";
import { places } from "./schema";
import { seedContent } from "./seed-content";

/**
 * Populates the database from the existing editorial data. Runs
 * `npm run db:seed`.
 */
async function main() {
    const db = getDb();

    // Places -- upsert on slug so rerunning never duplicates rows.
    await db.insert(places).values([]).onConflictDoNothing();

    await seedContent();

    console.log("Seed complete.");
}

main().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
});
