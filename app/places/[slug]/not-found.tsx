import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function PlaceNotFound() {
    return (
        <div>
            <Navbar />
            <div className="px-16 py-32 text-center flex flex-col items-center gap-4">
                <h1 className="font-display text-3xl font-semibold">Place not found</h1>
                <p className="text-muted">We couldn't find that destination.</p>
                <Link href="/places" className="text-sm font-semibold text-teal">
                    ← Back to Places
                </Link>
            </div>
            <Footer />
        </div>
    );
}