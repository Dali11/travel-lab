import Link from "next/link";

export function Footer() {
    return (
        <footer className="flex justify-between px-16 py-12 border-t border-sand">
            <div className="flex flex-col gap-2 max-w-[280px]">
                <span className="font-display text-lg font-bold">Travel Lab</span>
                <p className="text-sm text-muted leading-relaxed">
                    Your guide to visiting Malawi — flights, stays and places to explore.
                </p>
            </div>

            <div className="flex gap-20 text-sm">
                <div className="flex flex-col gap-2.5">
                    <span className="font-semibold text-muted text-xs uppercase tracking-wide">Explore</span>
                    <Link href="/places">Places</Link>
                    <Link href="/hotels">Hotels</Link>
                    <Link href="/flights">Flights</Link>
                </div>
                <div className="flex flex-col gap-2.5">
                    <span className="font-semibold text-muted text-xs uppercase tracking-wide">Company</span>
                    <Link href="/about">About</Link>
                    <Link href="/contact">Contact</Link>
                    <Link href="/support">Support</Link>
                </div>
            </div>
        </footer>
    );
}