export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { Trip, Stop, Booking } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/types";
import type { Metadata } from "next";
import AdUnit from "@/components/ads/AdUnit";

interface Props {
  params: Promise<{ id: string }>;
}

function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { title: "TripWit — Trip" };
  }
  const { id } = await params;
  try {
    const { data } = await getServerSupabase()
      .from("trips")
      .select("name, destination")
      .eq("id", id)
      .eq("is_public", true)
      .single();
    if (!data) return { title: "Trip not found" };
    return {
      title: `${data.name} — TripWit`,
      description: `Explore ${data.name}${data.destination ? ` in ${data.destination}` : ""} on TripWit.`,
    };
  } catch {
    return { title: "TripWit — Trip" };
  }
}

const BOOKING_TYPE_ICONS: Record<string, string> = {
  flight: "✈️",
  hotel: "🏨",
  car_rental: "🚗",
  other: "📋",
};

const BOOKING_TYPE_LABELS: Record<string, string> = {
  flight: "Flight",
  hotel: "Hotel",
  car_rental: "Car rental",
  other: "Other",
};

export default async function PublicTripPage({ params }: Props) {
  const { id } = await params;
  const { data } = await getServerSupabase()
    .from("trips")
    .select("*")
    .eq("id", id)
    .eq("is_public", true)
    .single();

  if (!data) notFound();

  const trip: Trip = {
    id: data.id,
    userId: data.user_id,
    isPublic: data.is_public,
    name: data.name,
    destination: data.destination,
    statusRaw: data.status_raw,
    notes: data.notes,
    hasCustomDates: data.has_custom_dates,
    budgetAmount: data.budget_amount,
    budgetCurrencyCode: data.budget_currency_code,
    startDate: data.start_date,
    endDate: data.end_date,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    days: data.days ?? [],
    bookings: data.bookings ?? [],
    lists: data.lists ?? [],
    expenses: data.expenses ?? [],
  };

  const sortedDays = [...trip.days].sort((a, b) => a.dayNumber - b.dayNumber);
  const sortedBookings = [...trip.bookings].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-slate-800">✈ TripWit</Link>
        <Link href="/app" className="text-sm text-blue-600 hover:underline">
          Plan your own trip →
        </Link>
      </header>

      {/* Ad banner */}
      <div className="flex justify-center py-3 bg-white border-b border-slate-100">
        <AdUnit slot="PUBLIC_TRIP_TOP_SLOT" format="horizontal" style={{ width: 728, height: 90 }} />
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Trip header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">{trip.name}</h1>
          {trip.destination && (
            <p className="text-slate-500 mt-1">{trip.destination}</p>
          )}
          {trip.startDate && trip.endDate && (
            <p className="text-sm text-slate-400 mt-1">
              {new Date(trip.startDate + "T12:00:00").toLocaleDateString(undefined, {
                month: "long", day: "numeric", year: "numeric",
              })}
              {" – "}
              {new Date(trip.endDate + "T12:00:00").toLocaleDateString(undefined, {
                month: "long", day: "numeric", year: "numeric",
              })}
            </p>
          )}
          {trip.notes && (
            <p className="text-sm text-slate-600 mt-3 italic">{trip.notes}</p>
          )}
        </div>

        {/* Bookings section */}
        {sortedBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-semibold text-slate-700 mb-3">Bookings</h2>
            <div className="space-y-2">
              {sortedBookings.map((b: Booking) => (
                <div key={b.id} className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-start gap-3">
                  <span className="text-xl mt-0.5">{BOOKING_TYPE_ICONS[b.typeRaw]}</span>
                  <div>
                    <div className="font-medium text-slate-800 text-sm">{b.title}</div>
                    <div className="text-xs text-slate-400">{BOOKING_TYPE_LABELS[b.typeRaw]}</div>
                    {b.confirmationCode && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        Conf: <span className="font-mono font-medium">{b.confirmationCode}</span>
                      </div>
                    )}
                    {b.typeRaw === "flight" && (b.airline || b.flightNumber) && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        {[b.airline, b.flightNumber].filter(Boolean).join(" · ")}
                        {b.departureAirport && b.arrivalAirport && (
                          <> · {b.departureAirport} → {b.arrivalAirport}</>
                        )}
                      </div>
                    )}
                    {b.typeRaw === "hotel" && b.hotelName && (
                      <div className="text-xs text-slate-500 mt-0.5">{b.hotelName}</div>
                    )}
                    {(b.checkInDate || b.checkOutDate) && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        {b.checkInDate && new Date(b.checkInDate + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        {b.checkInDate && b.checkOutDate && " → "}
                        {b.checkOutDate && new Date(b.checkOutDate + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </div>
                    )}
                    {b.notes && (
                      <p className="text-xs text-slate-500 mt-1 italic">{b.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Days */}
        {sortedDays.map((day) => {
          const stops = [...day.stops].sort((a, b) => a.sortOrder - b.sortOrder);
          return (
            <div key={day.id} className="mb-8">
              <div className="flex items-baseline gap-2 mb-3 pb-2 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-700">
                  Day {day.dayNumber}
                </h2>
                {day.date && (
                  <span className="text-sm text-slate-400">
                    {new Date(day.date + "T12:00:00").toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
                {day.location && (
                  <span className="text-sm text-slate-400">· 📍 {day.location}</span>
                )}
              </div>

              {day.notes && (
                <p className="text-sm text-slate-500 italic mb-3">{day.notes}</p>
              )}

              <div className="space-y-2">
                {stops.map((stop: Stop) => (
                  <div
                    key={stop.id}
                    className="bg-white rounded-xl border border-slate-200 px-4 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[stop.categoryRaw] }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-medium text-slate-800 ${stop.isVisited ? "line-through text-slate-400" : ""}`}>
                            {stop.name}
                          </span>
                          {stop.isVisited && (
                            <span className="text-xs text-green-600 font-medium">✓ Visited</span>
                          )}
                          {stop.rating > 0 && (
                            <span className="text-xs text-yellow-500">
                              {"★".repeat(stop.rating)}{"☆".repeat(5 - stop.rating)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {CATEGORY_LABELS[stop.categoryRaw]}
                          {stop.arrivalTime && (
                            <> · {new Date(stop.arrivalTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</>
                          )}
                          {stop.address && ` · ${stop.address.split(",").slice(0, 2).join(",")}`}
                        </div>
                        {/* Flight details on stop */}
                        {stop.flightNumber && (
                          <div className="text-xs text-blue-500 mt-0.5">
                            ✈️ {[stop.airline, stop.flightNumber].filter(Boolean).join(" ")}
                            {stop.departureAirport && stop.arrivalAirport &&
                              ` · ${stop.departureAirport} → ${stop.arrivalAirport}`}
                          </div>
                        )}
                        {stop.confirmationCode && !stop.flightNumber && (
                          <div className="text-xs text-slate-400 mt-0.5">
                            Conf: <span className="font-mono">{stop.confirmationCode}</span>
                          </div>
                        )}
                        {stop.notes && (
                          <p className="text-sm text-slate-600 mt-1">{stop.notes}</p>
                        )}
                        {stop.website && (
                          <a
                            href={stop.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline mt-1 block"
                          >
                            Visit website →
                          </a>
                        )}
                        {/* Links */}
                        {stop.links && stop.links.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-2">
                            {stop.links.map((link) => (
                              <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline"
                              >
                                {link.title}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {stops.length === 0 && (
                  <p className="text-sm text-slate-400 italic">No stops added yet.</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Bottom ad */}
        <div className="flex justify-center mt-8">
          <AdUnit slot="PUBLIC_TRIP_BOTTOM_SLOT" format="rectangle" style={{ width: 336, height: 280 }} />
        </div>

        <div className="mt-8 text-center text-sm text-slate-400">
          Planned with{" "}
          <Link href="/" className="text-blue-500 hover:underline">TripWit</Link>
        </div>
      </main>
    </div>
  );
}
