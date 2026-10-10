import { getDb } from "./index";
import { places } from "./schema";

const data = [
    {
        slug: "lake-malawi-national-park",
        name: "Lake Malawi National Park",
        region: "Mangochi District",
        category: "Lake",
        blurb: "Clear water, cichlid fish and boat trips to Thumbi Island.",
    },
    {
        slug: "nyika-plateau",
        name: "Nyika Plateau",
        region: "Northern Region",
        category: "Park",
        blurb: "Rolling grasslands, wild orchids and roan antelope at 2,000m.",
    },
    {
        slug: "cape-maclear",
        name: "Cape Maclear",
        region: "Lake Malawi shoreline",
        category: "Lake",
        blurb: "Laid-back lakeside village with dive schools and sunset cruises.",
    },
    {
        slug: "liwonde-national-park",
        name: "Liwonde National Park",
        region: "Southern Region",
        category: "Park",
        blurb: "Elephant herds, hippos and boat safaris along the Shire River.",
    },
    {
        slug: "zomba-plateau",
        name: "Zomba Plateau",
        region: "Southern Region",
        category: "City",
        blurb: "Pine forests, waterfalls and panoramic views over the highlands.",
    },
    {
        slug: "mua-mission",
        name: "Mua Mission",
        region: "Central Region",
        category: "Culture",
        blurb: "Wood carving workshops and a museum of Chewa, Yao and Ngoni heritage.",
    },
];

async function main() {
    await getDb().insert(places).values(data);
    console.log(`Seeded ${data.length} places.`);
}

main().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
});