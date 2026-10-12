import { ImageAssign } from "@/components/admin/ImageAssign";

export default function ImagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">Images & Media</p>
        <h1 className="font-display text-3xl font-bold text-ink">Images & Media</h1>
        <p className="mt-1 text-sm text-muted">
          Every photograph uploaded through /api/upload. Assign photos to destinations or hotels from the record edit pages; deletion is blocked while a photo is in use.
        </p>
      </div>

      <ImageAssign initialSlug={null} />
    </div>
  );
}
