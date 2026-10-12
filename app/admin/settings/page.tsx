import { KeyValueEditor } from "@/components/admin/KeyValueEditor";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Settings</p>
        <h1 className="font-display text-3xl font-bold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Operator-level key/value switches that the public site reads at runtime. Edits persist to Postgres and flow through to the site on the next build/data fetch.
        </p>
      </div>

      <KeyValueEditor route="/api/admin/app-settings" title="Site settings" />
    </div>
  );
}
