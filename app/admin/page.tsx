import Link from "next/link";
import { db } from "@/db";
import { places, hotels } from "@/db/schema";

export default async function AdminDashboard() {
    const [allPlaces, allHotels] = await Promise.all([
        db.select().from(places),
        db.select().from(hotels),
    ]);

    return (
        <div className="min-h-screen bg-cream px-16 py-16">
            <h1 className="font-display text-3xl font-semibold mb-2">Admin</h1>
            <p className="text-sm text-muted mb-10">
                Manage photos for places and hotels. Not authenticated — for local use only.
            </p>

            <AdminSection title="Places" items={allPlaces} type="place" />
            <AdminSection title="Hotels" items={allHotels} type="hotel" />
        </div>
    );
}

function AdminSection({
    title,
    items,
    type,
}: {
    title: string;
    items: { id: number; slug: string; name: string; imageUrl: string | null }[];
    type: "place" | "hotel";
}) {
    return (
        <section className="mb-12">
            <h2 className="font-display text-xl font-semibold mb-4">{title}</h2>
            <div className="flex flex-col gap-2">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white border border-sand rounded-xl px-5 py-3 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div
                                        className="w-full h-full"
                                        style={{
                                            background:
                                                "repeating-linear-gradient(45deg, #E8DCC8, #E8DCC8 6px, #ddcdb0 6px, #ddcdb0 12px)",
                                        }}
                                    />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-semibold">{item.name}</p>
                                <p className="text-xs text-muted">{item.slug}</p>
                            </div>
                        </div>
                        <Link
                            href={`/admin/upload/${type}/${item.slug}`}
                            className="bg-terracotta text-white px-4 py-2 rounded-full text-xs font-semibold"
                        >
                            {item.imageUrl ? "Replace Photo" : "Upload Photo"}
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
}