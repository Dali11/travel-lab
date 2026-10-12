"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

type BookingDraft = {
  request?: {
    days?: number;
    travellers?: number;
    interests?: string[];
    budget?: string;
    month?: string;
  };
  trip?: {
    title?: string;
    days?: number;
    travellers?: number;
    interests?: string;
    estimatedTotalUsd?: number;
    routeKm?: number;
    destinations?: Array<{
      id: string;
      name: string;
      day: number;
      reason?: string;
    }>;
    arrivalAirport?: string;
    warnings?: string[];
  };
};

type BookingResult = {
  reference: string;
  status: string;
  createdAt: string;
};

export default function BookTripPage() {
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BookingResult | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [travellerCount, setTravellerCount] = useState(2);
  const [customerNotes, setCustomerNotes] = useState("");

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem("travel-lab-booking-draft");
      if (stored) {
        const parsed = JSON.parse(stored) as BookingDraft;
        setDraft(parsed);
        setTravellerCount(
          Math.min(30, Math.max(1, Number(parsed.request?.travellers) || 2)),
        );
      }
    } catch {
      setDraft(null);
    } finally {
      setLoading(false);
    }
  }, []);

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!draft?.trip) {
      setError("Your trip details are missing. Please create your itinerary again.");
      return;
    }

    setSubmitting(true);

    try {
      const dateParts = startDate.split("-").map(Number);
      const travelMonth = new Date(
        Date.UTC(dateParts[0], dateParts[1] - 1, 1),
      ).toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          startDate,
          travellerCount,
          tripDurationDays: draft.trip.days || draft.request?.days || 1,
          travelMonth,
          budgetPerPersonUsd: null,
          interests: draft.request?.interests || [],
          itinerary: {
            title: draft.trip.title || "Malawi adventure",
            destinations: draft.trip.destinations || [],
            estimatedTotalUsd: draft.trip.estimatedTotalUsd ?? null,
            routeKm: draft.trip.routeKm ?? null,
            arrivalAirport: draft.trip.arrivalAirport || null,
            warnings: draft.trip.warnings || [],
            interests: draft.trip.interests || "",
          },
          customerNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "We couldn't submit your booking request.");
      }

      setResult(data.booking);
      window.sessionStorage.removeItem("travel-lab-booking-draft");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-sand px-5 py-24 text-center text-ink">
        Loading your trip…
      </main>
    );
  }

  if (result) {
    return (
      <main className="min-h-screen bg-sand px-5 py-20 text-ink">
        <section className="mx-auto max-w-2xl rounded-3xl border border-ink/10 bg-white p-7 text-center sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 text-2xl">
            ✓
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
            Request received
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
            Your Malawi trip is one step closer.
          </h1>
          <p className="mt-4 leading-relaxed text-ink/65">
            Thank you. Travel Lab will review your request and confirm supplier
            availability and the final price before asking you to pay.
          </p>
          <div className="mt-7 rounded-2xl bg-sand/60 p-5">
            <p className="text-xs uppercase tracking-wider text-ink/50">
              Your booking reference
            </p>
            <p className="mt-2 break-all font-mono text-xl font-bold">
              {result.reference}
            </p>
            <p className="mt-3 text-sm text-ink/60">
              Status: {result.status}
            </p>
          </div>
          <Link
            href="/"
            className="mt-7 inline-flex rounded-full bg-ink px-6 py-3 font-semibold text-white transition hover:bg-lake-deep"
          >
            Return to Travel Lab
          </Link>
        </section>
      </main>
    );
  }

  if (!draft?.trip) {
    return (
      <main className="min-h-screen bg-sand px-5 py-20 text-ink">
        <section className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center">
          <h1 className="font-display text-3xl font-semibold">
            Start with your itinerary
          </h1>
          <p className="mt-3 leading-relaxed text-ink/60">
            Create your Malawi trip first. Once your itinerary is ready, you can
            submit a booking request.
          </p>
          <Link
            href="/plan#build"
            className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 font-semibold text-white"
          >
            Plan my trip
          </Link>
        </section>
      </main>
    );
  }

  const trip = draft.trip;

  return (
    <main className="min-h-screen bg-sand px-4 py-10 text-ink sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/plan#build"
          className="text-sm font-semibold text-ink/60 transition hover:text-ink"
        >
          ← Back to trip planner
        </Link>

        <header className="mt-7 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-ember">
            Your next step
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Let’s plan your booking.
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink/65">
            Share your details and preferred date. We’ll check availability and
            confirm the final price with the relevant providers before payment.
          </p>
        </header>

        <div className="mt-9 grid gap-7 lg:grid-cols-[minmax(0,1fr)_350px]">
          <form
            onSubmit={submitBooking}
            className="space-y-6 rounded-3xl border border-ink/10 bg-white p-5 sm:p-8"
          >
            <div>
              <h2 className="font-display text-2xl font-semibold">
                Traveller details
              </h2>
              <p className="mt-2 text-sm text-ink/55">
                We’ll use these details to contact you about your request.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                Full name
                <input
                  required
                  autoComplete="name"
                  maxLength={160}
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-normal outline-none focus:border-ember"
                  placeholder="Your full name"
                />
              </label>
              <label className="block text-sm font-semibold">
                Email address
                <input
                  required
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-normal outline-none focus:border-ember"
                  placeholder="you@example.com"
                />
              </label>
              <label className="block text-sm font-semibold">
                Phone number
                <input
                  required
                  type="tel"
                  autoComplete="tel"
                  minLength={5}
                  maxLength={40}
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-normal outline-none focus:border-ember"
                  placeholder="+265 …"
                />
              </label>
              <label className="block text-sm font-semibold">
                Preferred arrival date
                <input
                  required
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="mt-2 block min-h-12 w-full cursor-pointer rounded-xl border border-ink/15 bg-white px-4 py-3 font-normal outline-none focus:border-ember"
                />
              </label>
              <label className="block text-sm font-semibold sm:col-span-2">
                Number of travellers
                <input
                  required
                  type="number"
                  min={1}
                  max={30}
                  value={travellerCount}
                  onChange={(event) => setTravellerCount(Number(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 font-normal outline-none focus:border-ember sm:max-w-xs"
                />
              </label>
            </div>

            <label className="block text-sm font-semibold">
              Anything else we should know? <span className="font-normal text-ink/45">(optional)</span>
              <textarea
                rows={4}
                maxLength={2000}
                value={customerNotes}
                onChange={(event) => setCustomerNotes(event.target.value)}
                className="mt-2 w-full resize-y rounded-xl border border-ink/15 bg-white px-4 py-3 font-normal outline-none focus:border-ember"
                placeholder="Accessibility needs, special occasions, preferred accommodation…"
              />
            </label>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
                {error}
              </p>
            )}

            <div className="rounded-2xl bg-sand/60 p-4 text-sm leading-relaxed text-ink/65">
              Submitting this form is a booking request, not a confirmed
              reservation. No payment will be taken at this stage.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-4 text-sm font-bold text-white transition hover:bg-lake-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting your request…" : "Submit booking request"}
            </button>
          </form>

          <aside className="h-fit rounded-3xl bg-ink p-6 text-white sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-ember">
              Your trip
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold">
              {trip.title || "Your Malawi adventure"}
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs text-white/50">Duration</p>
                <p className="mt-1 text-lg font-semibold">
                  {trip.days || draft.request?.days || "—"} days
                </p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs text-white/50">Travellers</p>
                <p className="mt-1 text-lg font-semibold">{travellerCount}</p>
              </div>
            </div>

            {trip.estimatedTotalUsd != null && (
              <div className="mt-5 border-b border-white/10 pb-5">
                <p className="text-xs text-white/50">Planning estimate only</p>
                <p className="mt-1 font-display text-3xl font-semibold">
                  ${trip.estimatedTotalUsd.toLocaleString("en-US")}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-white/45">
                  Not a quote. The confirmed price may differ after provider checks.
                </p>
              </div>
            )}

            {trip.destinations && trip.destinations.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                  Planned route
                </p>
                <ol className="mt-3 space-y-3">
                  {trip.destinations.map((destination, index) => (
                    <li key={`${destination.id}-${index}`} className="flex gap-3 text-sm">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">
                        {index + 1}
                      </span>
                      <span className="pt-0.5 text-white/85">{destination.name}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <p className="mt-6 text-xs leading-relaxed text-white/45">
              Travel Lab will contact you after reviewing availability and
              pricing. Payment comes later, once the details are agreed.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
