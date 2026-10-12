import Link from "next/link";
import { RecordDetail } from "@/components/admin/RecordDetail";

export default async function GuidesDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/guides"
          className="text-sm font-semibold text-ember hover:underline"
        >
          &larr; Travel Guides
        </Link>
        <h1 className="font-display text-3xl font-bold text-ink mt-1">{slug}</h1>
      </div>
      <RecordDetail route="/api/admin/travel-guides" slug={slug} />
    </div>
  );
}
