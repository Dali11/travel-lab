import Link from "next/link";
import { eq } from "drizzle-orm";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { db } from "@/db";
import { hotels } from "@/db/schema";

const FILTERS = ["All", "Budget", "Mid-range", "Luxury"];

export default async function Hotels({
    searchParams,
}: {
    searchParams: Promise<{ tier?: string }>;
}) {
    const { tier } = await searchParams;
    const activeFilter = tier ?? "All";

    const allHotels =
        activeFilter === "All"
            ? await db.select().from(hotels)
            : await db.select().from(hotels).where(eq(hotels.tier, activeFilter));

    return (
        <div>
            <Navbar />

            <header className="px-16 pt-14 pb-8">
                <h1 className="font-display text-4xl font-semibold">
                    Hotels &amp; Stays in Malawi
                </h1>
                <p className="text-base text-muted mt-3 max-w-[560px]">
                    Lakeside lodges, city hotels and budget stays across the country.
                </p>
            </header>

            <div className="px-16 pb-8 flex gap-3">
                {FILTERS.map((filter) => {
                    const isActive = filter === activeFilter;
                    const href = filter === "All" ? "/hotels" : `/hotels?tier=${filter}`;
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

            <section className="px-16 pb-24 grid grid-cols-3 gap-8">
                {allHotels.length === 0 ? (
                    <p className="col-span-3 text-muted text-sm py-12 text-center">
                        No hotels found in this range yet.
                    </p>
                ) : (
                    allHotels.map((hotel) => (
                        <Link
                            key={hotel.id}
                            href={`/hotels/${hotel.slug}`}
                            className="bg-white border border-sand rounded-2xl overflow-hidden flex flex-col"
                        >
                            <div className="h-[180px] relative">
                                {hotel.imageUrl ? (
                                    <img
                                        src={hotel.imageUrl}
                                        alt={hotel.name}
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
                                    {hotel.tier}
                                </span>
                            </div>
                            <div className="p-4.5 flex flex-col gap-1.5">
                                <h3 className="font-display text-lg font-semibold">{hotel.name}</h3>
                                <span className="text-[13px] text-muted">{hotel.location}</span>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm font-semibold">
                                        ${hotel.pricePerNight}
                                        <span className="text-muted font-normal"> / night</span>
                                    </span>
                                    <span className="text-sm text-muted">★ {(hotel.rating / 10).toFixed(1)}</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </section>

            <Footer />
        </div>
    );
}