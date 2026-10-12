import Link from "next/link";
import { RecordDetail } from "@/components/admin/RecordDetail";

export default async function FlightsDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/flights"
          className="text-sm font-semibold text-ember hover:underline"
        >
          &larr; Flights & Transport
        </Link>
        <h1 className="font-display text-3xl font-bold text-ink mt-1">{slug}</h1>
      </div>
      <RecordDetail route="/api/admin/flights" slug={slug} />
    </div>
  );
}
