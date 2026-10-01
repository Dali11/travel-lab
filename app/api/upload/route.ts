import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const form = await request.formData();
    const file = form.get("file") as File | null;

    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
        return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxBytes) {
        return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const blob = await put(file.name, file, {
        access: "public",
        addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
}