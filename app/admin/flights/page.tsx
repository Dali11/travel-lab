import { ItemList } from "@/components/admin/ItemList";

export default function FlightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Flights & Transport</p>
        <h1 className="font-display text-3xl font-bold text-ink">Flights & Transport</h1>
        <p className="mt-1 text-sm text-muted">
          Flight corridors in the database. The public site reads this content from <code className="text-ink">lib/flights.ts</code> and <code className="text-ink">lib/data/routes.ts</code>, so DB edits are shown here for audit but do not change the site until a reviewed migration runs.
        </p>
      </div>

      <ItemList
        title="Flight corridors"
        route="/api/admin/flights"
        newHref="/admin/flights/new"
        editHrefSuffix="flights"
      />
    </div>
  );
}
