import { KeyValueEditor } from "@/components/admin/KeyValueEditor";

export default function TripPlanningPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Trip Planning</p>
        <h1 className="font-display text-3xl font-bold text-ink">Trip Planning</h1>
        <p className="mt-1 text-sm text-muted">
          Itinerary machine defaults. These key/value pairs drive the public itinerary builder, so edits here flow through to the planner on the public site.
        </p>
      </div>

      <KeyValueEditor route="/api/admin/trip-planning" title="Trip planning defaults" />
    </div>
  );
}
