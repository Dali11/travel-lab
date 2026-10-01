import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { db } from "@/db";
import { places } from "@/db/schema";

export default async function Home() {
  const featuredPlaces = await db.select().from(places).limit(3);

  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section className="flex items-center gap-16 px-16 pt-24 pb-22">
        <div className="w-[560px] flex flex-col gap-6">
          <h1 className="font-display text-6xl font-semibold leading-tight">
            Discover Malawi, the Warm Heart of Africa
          </h1>
          <p className="text-lg leading-relaxed text-muted w-[480px]">
            Lakeside escapes, wildlife-rich parks and vibrant culture — plan
            flights, stays and adventures in one place.
          </p>

          <div className="flex gap-2 bg-white p-2 rounded-2xl border border-sand w-[520px]">
            <label className="flex-grow flex flex-col px-4 py-2">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wide">
                Destination
              </span>
              <input
                type="text"
                placeholder="Where to?"
                className="border-none outline-none text-[15px] text-ink bg-transparent"
              />
            </label>
            <label className="flex-grow flex flex-col px-4 py-2 border-l border-sand">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wide">
                Dates
              </span>
              <input
                type="text"
                placeholder="Add dates"
                className="border-none outline-none text-[15px] text-ink bg-transparent"
              />
            </label>
            <button className="bg-teal text-white rounded-[10px] px-6 text-[15px] font-semibold">
              Search
            </button>
          </div>
        </div>

        <div
          className="w-[560px] h-[440px] rounded-3xl flex items-center justify-center"
          style={{
            background:
              "repeating-linear-gradient(45deg, #E8DCC8, #E8DCC8 10px, #ddcdb0 10px, #ddcdb0 20px)",
          }}
        >
          <span className="text-sm italic text-[#8a7c60] bg-cream/85 px-4 py-2 rounded-lg">
            [Lake Malawi hero photo]
          </span>
        </div>
      </section>

      {/* Category cards */}
      <section className="px-16 pb-22 grid grid-cols-3 gap-8">
        <CategoryCard
          icon={
            <path d="M2 15c3-5 7-5 10 0s7 5 10 0M12 3v9" />
          }
          title="Lake Malawi"
          text="Golden beaches, snorkeling and lakeside lodges along Africa's third-largest lake."
        />
        <CategoryCard
          icon={<path d="M3 20 9 8l4 7 3-5 5 10Z" />}
          title="National Parks"
          text="Safaris in Liwonde and Nyika, home to elephants, zebra and rolling highland plains."
        />
        <CategoryCard
          icon={
            <>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" />
            </>
          }
          title="Culture & Craft"
          text="Markets, drumming and village stays that share the Warm Heart of Africa's traditions."
        />
      </section>

      {/* Popular places */}
      <section className="px-16 pb-24">
        <h2 className="font-display text-[34px] font-semibold">Popular Places to Visit</h2>
        <p className="text-[15px] text-muted mt-2">
          Handpicked spots to start planning your trip
        </p>

        <div className="grid grid-cols-3 gap-8 mt-10">
          {featuredPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              slug={place.slug}
              name={place.name}
              region={place.region}
              blurb={place.blurb}
              imageUrl={place.imageUrl}
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal px-16 py-18 text-center flex flex-col items-center gap-5">
        <h2 className="font-display text-3xl font-semibold text-white">
          Ready to plan your Malawi adventure?
        </h2>
        <p className="text-base text-[#CFE6DE] max-w-[480px]">
          Compare flights, browse hotels and book places to stay — all in one
          trip planner.
        </p>
        <Link
          href="/plan"
          className="bg-cream text-ink px-8 py-3.5 rounded-full text-[15px] font-semibold"
        >
          Start Planning
        </Link>
      </section>

      <Footer />
    </div>
  );
}

function CategoryCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-white border border-sand rounded-2xl p-8 flex flex-col gap-4">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1F6F5C" strokeWidth="2">
        {icon}
      </svg>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{text}</p>
    </div>
  );
}

function PlaceCard({
  slug,
  name,
  region,
  blurb,
  imageUrl,
}: {
  slug: string;
  name: string;
  region: string;
  blurb: string;
  imageUrl: string | null;
}) {
  return (
    <div className="bg-white border border-sand rounded-2xl overflow-hidden">
      <div className="h-[200px]">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "repeating-linear-gradient(45deg, #E8DCC8, #E8DCC8 10px, #ddcdb0 10px, #ddcdb0 20px)",
            }}
          />
        )}
      </div>
      <div className="p-5 flex flex-col gap-2">
        <h3 className="font-display text-[19px] font-semibold">{name}</h3>
        <span className="text-[13px] text-muted">{region}</span>
        <p className="text-sm text-muted mt-1 leading-relaxed">{blurb}</p>
        <Link href={`/places/${slug}`} className="text-sm font-semibold mt-2">
          View details →
        </Link>
      </div>
    </div>
  );
}