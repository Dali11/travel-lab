import Link from "next/link";

export function Navbar() {
    return (
        <nav className="flex items-center justify-between px-16 py-6 border-b border-sand">
            <Link href="/" className="flex items-center gap-2.5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1F6F5C" strokeWidth="2">
                    <path d="M3 12c3-4 6-4 9 0s6 4 9 0" />
                    <path d="M3 17c3-4 6-4 9 0s6 4 9 0" />
                </svg>
                <span className="font-display text-xl font-bold">Travel Lab</span>
            </Link>

            <div className="flex gap-10 text-[15px] font-medium">
                <Link href="/">Home</Link>
                <Link href="/places">Explore</Link>
                <Link href="/hotels">Hotels</Link>
                <Link href="/flights">Flights</Link>
            </div>

            <Link
                href="/plan"
                className="bg-terracotta text-white px-6 py-3 rounded-full text-[15px] font-semibold"
            >
                Plan a Trip
            </Link>
        </nav>
    );
}