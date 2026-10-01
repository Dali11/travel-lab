import Link from "next/link";
import { eq } from "drizzle-orm";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { db } from "@/db";
import { places } from "@/db/schema";

const FILTERS = ["All", "Lake", "Park", "Culture", "City"];

export default async function Places({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>;
}) {
    const { category } = await searchParams;
    const activeFilter = category ?? "All";

    const allPlaces =
        activeFilter === "All"
            ? await db.select().from(places)
            : await db.select().from(places).where(eq(places.category, activeFilter));

    return (
        <div>
            <Navbar />

            <header className="px-16 pt-14 pb-8">
                <h1 className="font-display text-4xl font-semibold">
                    Places to Visit in Malawi
                </h1>
                <p className="text-base text-muted mt-3 max-w-[560px]">
                    Browse lakes, parks and cultural sites, and add your favourites to a
                    trip.
                </p>
            </header>

            <div className="px-16 pb-8 flex gap-3">
                {FILTERS.map((filter) => {
                    const isActive = filter === activeFilter;
                    const href = filter === "All" ? "/places" : `/places?category=${filter}`;
                    return (
                        <Link
                            key={filter}
                            href={href}
                            className={
                                isActive
                                    ? "bg-teal text-white px-5 py-2.5 rounded-full text-sm font-semibold"
                                    : "bg-white border border-sand text-ink px-5 py-2.5 rounded-full text-sm font-medium"
                            }
                        >
                            {filter}
                        </Link>
                    );
                })}
            </div>

            <section className="px-16 pb-6 grid grid-cols-3 gap-8">
                {allPlaces.length === 0 ? (
                    <p className="col-span-3 text-muted text-sm py-12 text-center">
                        No places found in this category yet.
                    </p>
                ) : (
                    allPlaces.map((place) => (
                        <div
                            key={place.id}
                            className="bg-white border border-sand rounded-2xl overflow-hidden flex flex-col"
                        >
                            <div className="h-[180px] relative">
                                {place.imageUrl ? (
                                    <img
                                        src={place.imageUrl}
                                        alt={place.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="h-full w-full"
                                        style={{
                                            background:
                                                "repeating-linear-gradient(45deg, #E8DCC8, #E8DCC8 10px, #ddcdb0 10px, #ddcdb0 20px)",
                                        }}
                                    />
                                )}
                                <span className="absolute top-3.5 left-3.5 bg-ink/75 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                                    {place.category}
                                </span>
                            </div>
                            <div className="p-4.5 flex flex-col gap-1.5">
                                <h3 className="font-display text-lg font-semibold">{place.name}</h3>
                                <span className="text-[13px] text-muted">{place.region}</span>
                                <p className="text-sm text-muted mt-1 leading-relaxed">{place.blurb}</p>
                                <Link href={`/places/${place.slug}`} className="text-sm font-semibold mt-2">
                                    View details →
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </section>

            <div className="px-16 py-18 flex justify-center gap-2">
                {[1, 2, 3].map((page) => (
                    <span
                        key={page}
                        className={
                            page === 1
                                ? "w-9 h-9 rounded-[10px] bg-teal text-white flex items-center justify-center text-sm font-semibold"
                                : "w-9 h-9 rounded-[10px] bg-white border border-sand flex items-center justify-center text-sm font-semibold"
                        }
                    >
                        {page}
                    </span>
                ))}
            </div>

            <Footer />
        </div>
    );
}