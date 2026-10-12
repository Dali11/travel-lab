import { ItemList } from "@/components/admin/ItemList";

export default function ExperiencesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Experiences</p>
        <h1 className="font-display text-3xl font-bold text-ink">Experiences</h1>
        <p className="mt-1 text-sm text-muted">
          Activity experiences in the database. The public site reads this content from <code className="text-ink">lib/data/experiences.ts</code>, so DB edits are shown here for audit but do not change the site until a reviewed migration runs.
        </p>
      </div>

      <ItemList
        title="Experiences"
        route="/api/admin/experiences"
        newHref="/admin/experiences/new"
        editHrefSuffix="experiences"
      />
    </div>
  );
}
