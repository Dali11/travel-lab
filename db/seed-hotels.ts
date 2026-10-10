import { getDb } from "./index";
import { hotels } from "./schema";

const data = [
    {
        slug: "sunbird-capital-lilongwe",
        name: "Sunbird Capital Hotel",
        location: "Lilongwe",
        tier: "Luxury",
        pricePerNight: 180,
        rating: 44,
        blurb: "Business-district hotel with a pool, spa and conference facilities.",
    },
    {
        slug: "pumulani-lodge",
        name: "Pumulani Lodge",
        location: "Cape Maclear, Lake Malawi",
        tier: "Luxury",
        pricePerNight: 420,
        rating: 48,
        blurb: "Hillside villas overlooking the lake, with a private beach and dive centre.",
    },
    {
        slug: "kachere-kastle",
        name: "Kachere Kastle",
        location: "Mangochi",
        tier: "Mid-range",
        pricePerNight: 95,
        rating: 41,
        blurb: "Lakeside guesthouse with a garden restaurant and boat hire.",
    },
    {
        slug: "mzuzu-inn",
        name: "Mzuzu Inn",
        location: "Mzuzu",
        tier: "Budget",
        pricePerNight: 35,
        rating: 36,
        blurb: "Simple, clean rooms close to the northern highlands and Nyika gateway.",
    },
    {
        slug: "annies-lodge-blantyre",
        name: "Annie's Lodge",
        location: "Blantyre",
        tier: "Budget",
        pricePerNight: 42,
        rating: 38,
        blurb: "Budget-friendly stay near the city centre, popular with backpackers.",
    },
    {
        slug: "zomba-forest-lodge",
        name: "Zomba Forest Lodge",
        location: "Zomba Plateau",
        tier: "Mid-range",
        pricePerNight: 110,
        rating: 43,
        blurb: "Cabins in the pine forest with hiking trails from the doorstep.",
    },
];

async function main() {
    await getDb().insert(hotels).values(data);
    console.log(`Seeded ${data.length} hotels.`);
}

main().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
});