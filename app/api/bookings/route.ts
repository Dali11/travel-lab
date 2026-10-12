import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { bookings } from "@/db/schema";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 32_000;

function cleanString(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);

    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Your booking request is too large." },
        { status: 413 },
      );
    }

    const body = await request.json();

    const customerName = cleanString(body.customerName, 160);
    const customerEmail = cleanString(body.customerEmail, 254).toLowerCase();
    const customerPhone = cleanString(body.customerPhone, 40);
    const startDate = cleanString(body.startDate, 10);
    const travelMonth = cleanString(body.travelMonth, 30);
    const travellerCount = Number(body.travellerCount);
    const tripDurationDays = Number(body.tripDurationDays);
    const budget = body.budgetPerPersonUsd;
    const budgetPerPersonUsd =
      budget === null || budget === undefined || budget === ""
        ? null
        : Number(budget);
    const interests = Array.isArray(body.interests)
      ? body.interests
          .filter((item: unknown): item is string => typeof item === "string")
          .slice(0, 20)
          .map((item: string) => item.slice(0, 80))
      : [];
    const itinerary =
      body.itinerary &&
      typeof body.itinerary === "object" &&
      !Array.isArray(body.itinerary)
        ? body.itinerary
        : null;
    const customerNotes = cleanString(body.customerNotes, 2000);

    if (
      customerName.length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) ||
      customerPhone.length < 5 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
      !Number.isFinite(Date.parse(`${startDate}T00:00:00Z`)) ||
      travelMonth.length === 0 ||
      !Number.isInteger(travellerCount) ||
      travellerCount < 1 ||
      travellerCount > 30 ||
      !Number.isInteger(tripDurationDays) ||
      tripDurationDays < 1 ||
      tripDurationDays > 90 ||
      (budgetPerPersonUsd !== null &&
        (!Number.isInteger(budgetPerPersonUsd) ||
          budgetPerPersonUsd < 0 ||
          budgetPerPersonUsd > 1000000)) ||
      !itinerary
    ) {
      return NextResponse.json(
        { error: "Please check your contact details and trip information." },
        { status: 400 },
      );
    }

    const reference = `TL-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;

    const [booking] = await getDb()
      .insert(bookings)
      .values({
        reference,
        customerName,
        customerEmail,
        customerPhone,
        startDate,
        travellerCount,
        tripDurationDays,
        travelMonth,
        budgetPerPersonUsd,
        interests,
        itinerary,
        // Never trust a client-submitted total. The final quote is set after
        // supplier availability and pricing have been verified.
        estimatedTotalUsd: null,
        finalTotalUsd: null,
        status: "pending",
        supplierConfirmed: false,
        paymentStatus: "unpaid",
        customerNotes: customerNotes || null,
      })
      .returning({
        reference: bookings.reference,
        status: bookings.status,
        createdAt: bookings.createdAt,
      });

    return NextResponse.json(
      {
        success: true,
        booking,
        message:
          "Your trip request has been received. We will confirm availability and final pricing before requesting payment.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Booking submission failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      { error: "We couldn't submit your booking right now. Please try again." },
      { status: 500 },
    );
  }
}
