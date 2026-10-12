import { ItemList } from "@/components/admin/ItemList";

export default function DestinationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Destinations</p>
        <h1 className="font-display text-3xl font-bold text-ink">Destinations</h1>
        <p className="mt-1 text-sm text-muted">
          The places that make up the Malawi experience. Edit any record here; photographs are managed on the Images &amp; media page.
        </p>
      </div>

      <ItemList
        title="Destinations"
        route="/api/admin/places"
        newHref="/admin/destinations/new"
        editHrefSuffix="destinations"
        deleteHref="/admin/destinations"
      />
    </div>
  );
}
