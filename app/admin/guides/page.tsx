import { ItemList } from "@/components/admin/ItemList";

export default function GuidesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Travel Guides</p>
        <h1 className="font-display text-3xl font-bold text-ink">Travel Guides</h1>
        <p className="mt-1 text-sm text-muted">
          Travel guides in the database. The public site reads this content from <code className="text-ink">lib/guides.ts</code>, so DB edits are shown here for audit but do not change the site until a reviewed migration runs.
        </p>
      </div>

      <ItemList
        title="Travel Guides"
        route="/api/admin/travel-guides"
        newHref="/admin/guides/new"
        editHrefSuffix="guides"
      />
    </div>
  );
}
