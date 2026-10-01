import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function HotelNotFound() {
    return (
        <div>
        <Navbar />
        < div className = "px-16 py-32 text-center flex flex-col items-center gap-4" >
            <h1 className="font-display text-3xl font-semibold" > Hotel not found </h1>
                < p className = "text-muted" > We couldn't find that stay.</p>
                    < Link href = "/hotels" className = "text-sm font-semibold text-teal" >
          ← Back to Hotels
        </Link>
        </div>
        < Footer />
        </div>
  );
}