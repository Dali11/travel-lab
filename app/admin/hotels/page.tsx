import { ItemList } from "@/components/admin/ItemList";

export default function HotelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Hotels & Accommodation</p>
        <h1 className="font-display text-3xl font-bold text-ink">Hotels & Accommodation</h1>
        <p className="mt-1 text-sm text-muted">Accommodation available to travellers. Photos are managed on the Images &amp; media page.</p>
      </div>

      <ItemList
        title="Hotels"
        route="/api/admin/hotels"
        newHref="/admin/hotels/new"
        editHrefSuffix="hotels"
        deleteHref="/admin/hotels"
      />
    </div>
  );
}
