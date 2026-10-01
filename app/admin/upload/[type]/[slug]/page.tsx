"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUpload({
    params,
}: {
    params: Promise<{ type: string; slug: string }>;
}) {
    const { type, slug } = use(params);
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!file) return;
        setStatus("uploading");
        setError("");

        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
            setStatus("error");
            setError(uploadData.error ?? "Upload failed");
            return;
        }

        const attachRes = await fetch("/api/admin/attach-image", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, slug, imageUrl: uploadData.url }),
        });

        if (!attachRes.ok) {
            setStatus("error");
            setError("Uploaded, but failed to attach");
            return;
        }

        router.push("/admin");
    }

    return (
        <div className="min-h-screen bg-cream px-16 py-16 flex justify-center">
            <div className="w-full max-w-[480px]">
                <a href="/admin" className="text-sm font-medium text-muted">← Back to Admin</a>
                <h1 className="font-display text-2xl font-semibold mt-4 mb-1 capitalize">
                    {type}: {slug}
                </h1>
                <p className="text-sm text-muted mb-6">Upload a photo for this {type}.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        className="text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!file || status === "uploading"}
                        className="bg-teal text-white px-6 py-3 rounded-full text-sm font-semibold disabled:opacity-50"
                    >
                        {status === "uploading" ? "Uploading…" : "Upload"}
                    </button>
                    {status === "error" && <p className="text-sm text-red-600">{error}</p>}
                </form>
            </div>
        </div>
    );
}