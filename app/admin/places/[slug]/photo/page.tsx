"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function UploadPlacePhoto({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = use(params);
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

        const attachRes = await fetch(`/api/places/${slug}/image`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: uploadData.url }),
        });

        if (!attachRes.ok) {
            setStatus("error");
            setError("Uploaded, but failed to attach to place");
            return;
        }

        router.push(`/places/${slug}`);
    }

    return (
        <div className="px-16 py-16 max-w-[480px]">
            <h1 className="font-display text-2xl font-semibold mb-6">
                Upload photo for {slug}
            </h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
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
    );
}