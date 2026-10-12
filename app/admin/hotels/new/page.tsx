import { FormField } from "@/components/admin/DataForm";
import { RecordForm } from "@/components/admin/RecordForm";

const FIELDS: FormField[] = [
  { name: "name", label: "Name", required: true },
  { name: "location", label: "Location", required: true },
  { name: "tier", label: "Tier", required: true },
  { name: "pricePerNight", label: "Price per Night (USD)", type: "number", required: true },
  { name: "rating", label: "Rating (out of 50)", type: "number", required: true },
  { name: "blurb", label: "Blurb", required: true, rows: 5 },
  { name: "photo", label: "Photo URL (https)", type: "url" },
];

export default function NewHotelPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Hotels & Accommodation</p>
        <h1 className="font-display text-3xl font-bold text-ink">New hotel</h1>
        <p className="mt-1 text-sm text-muted">Add a hotel. The public site reads from the database, so this record appears on the hotels page automatically.</p>
      </div>

      <RecordForm
        mode="create"
        createUrl="/api/admin/hotels"
        fields={FIELDS}
        heading="New hotel"
        onSuccess={() => {
          window.location.href = "/admin/hotels";
        }}
      />
    </div>
  );
}
