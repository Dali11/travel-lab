import { FormField } from "@/components/admin/DataForm";
import { RecordForm } from "@/components/admin/RecordForm";

const FIELDS: FormField[] = [
  { name: "name", label: "Name", required: true },
  { name: "region", label: "Region", required: true },
  { name: "category", label: "Category", required: true },
  { name: "blurb", label: "Blurb", required: true, rows: 5 },
  { name: "photo", label: "Photo URL (https)", type: "url" },
];

export default function NewDestinationPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Destinations</p>
        <h1 className="font-display text-3xl font-bold text-ink">New destination</h1>
        <p className="mt-1 text-sm text-muted">Add a destination. The public site reads from the database, so this record appears on the destinations page automatically.</p>
      </div>

      <RecordForm
        mode="create"
        createUrl="/api/admin/places"
        fields={FIELDS}
        heading="New destination"
        onSuccess={() => {
          window.location.href = "/admin/destinations";
        }}
      />
    </div>
  );
}
