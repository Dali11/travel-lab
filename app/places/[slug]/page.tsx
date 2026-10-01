import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { db } from "@/db";
import { places } from "@/db/schema";

export default async function PlaceDetail({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const [place] = await db.select().from(places).where(eq(places.slug, slug));

    if (!place) {
        notFound();
    }

    return (
        <div>
            <Navbar />

            <div className="px-16 pt-10">
                <Link href="/places" className="text-sm font-medium text-muted">
                    ← Back to Places
                </Link>
            </div>

            <section className="px-16 pt-6 pb-10">
                <div className="w-full h-[420px] rounded-3xl relative overflow-hidden">
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
                    <span className="absolute top-6 left-6 bg-ink/75 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                        {place.category}
                    </span>
                </div>
            </section>

            <section className="px-16 pb-16 flex gap-16">
                <div className="flex-grow max-w-[720px]">
                    <h1 className="font-display text-4xl font-semibold">{place.name}</h1>
                    <p className="text-sm text-muted mt-2">{place.region}</p>
                    <p className="text-base text-ink leading-relaxed mt-6">{place.blurb}</p>
                </div>

                <aside className="w-[320px] flex-shrink-0">
                    <div className="bg-white border border-sand rounded-2xl p-6 flex flex-col gap-4">
                        <h3 className="font-display text-lg font-semibold">Plan your visit</h3>
                        <p className="text-sm text-muted leading-relaxed">
                            Add {place.name} to your trip and we'll help you find flights and
                            places to stay nearby.
                        </p>
                        <Link
                            href="/plan"
                            className="bg-terracotta text-white text-center px-6 py-3 rounded-full text-sm font-semibold"
                        >
                            Add to Trip
                        </Link>
                    </div>
                </aside>
            </section>

            <Footer />
        </div>
    );
}