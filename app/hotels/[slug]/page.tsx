import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { db } from "@/db";
import { hotels } from "@/db/schema";

export default async function HotelDetail({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const [hotel] = await db.select().from(hotels).where(eq(hotels.slug, slug));

    if (!hotel) {
        notFound();
    }

    return (
        <div>
            <Navbar />

            <div className="px-16 pt-10">
                <Link href="/hotels" className="text-sm font-medium text-muted">
                    ← Back to Hotels
                </Link>
            </div>

            <section className="px-16 pt-6 pb-10">
                <div className="w-full h-[420px] rounded-3xl relative overflow-hidden">
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
                    <span className="absolute top-6 left-6 bg-ink/75 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                        {hotel.tier}
                    </span>
                </div>
            </section>

            <section className="px-16 pb-16 flex gap-16">
                <div className="flex-grow max-w-[720px]">
                    <h1 className="font-display text-4xl font-semibold">{hotel.name}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm text-muted">{hotel.location}</span>
                        <span className="text-sm text-muted">·</span>
                        <span className="text-sm text-muted">★ {(hotel.rating / 10).toFixed(1)}</span>
                    </div>
                    <p className="text-base text-ink leading-relaxed mt-6">{hotel.blurb}</p>
                </div>

                <aside className="w-[320px] flex-shrink-0">
                    <div className="bg-white border border-sand rounded-2xl p-6 flex flex-col gap-4">
                        <div>
                            <span className="text-2xl font-semibold">${hotel.pricePerNight}</span>
                            <span className="text-sm text-muted"> / night</span>
                        </div>
                        <Link
                            href="/plan"
                            className="bg-terracotta text-white text-center px-6 py-3 rounded-full text-sm font-semibold"
                        >
                            Book This Stay
                        </Link>
                    </div>
                </aside>
            </section>

            <Footer />
        </div>
    );
}