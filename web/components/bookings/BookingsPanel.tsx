"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import type { Booking, Trip } from "@/lib/types";
import BookingDialog from "./BookingDialog";

interface BookingsPanelProps {
  trip: Trip;
  onUpdateTrip: (changes: Partial<Trip>) => void;
}

const TYPE_ICONS: Record<string, string> = {
  flight: "✈️",
  hotel: "🏨",
  car_rental: "🚗",
  other: "📋",
};

const TYPE_LABELS: Record<string, string> = {
  flight: "Flight",
  hotel: "Hotel",
  car_rental: "Car rental",
  other: "Other",
};

export default function BookingsPanel({ trip, onUpdateTrip }: BookingsPanelProps) {
  const [editing, setEditing] = useState<Booking | null | "new">(null);

  const bookings = [...trip.bookings].sort((a, b) => a.sortOrder - b.sortOrder);

  function saveBooking(booking: Booking) {
    const exists = trip.bookings.find((b) => b.id === booking.id);
    const updated = exists
      ? trip.bookings.map((b) => (b.id === booking.id ? booking : b))
      : [...trip.bookings, { ...booking, sortOrder: trip.bookings.length }];
    onUpdateTrip({ bookings: updated });
    setEditing(null);
  }

  function deleteBooking(id: string) {
    onUpdateTrip({ bookings: trip.bookings.filter((b) => b.id !== id) });
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-5 py-4 space-y-3">
        {bookings.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">
            No bookings yet. Add flights, hotels, and car rentals.
          </p>
        )}

        {bookings.map((b) => (
          <div
            key={b.id}
            className="border border-slate-200 rounded-xl p-4 bg-white group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{TYPE_ICONS[b.typeRaw]}</span>
                <div>
                  <div className="font-medium text-slate-800 text-sm">{b.title}</div>
                  <div className="text-xs text-slate-400">{TYPE_LABELS[b.typeRaw]}</div>
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
                  {b.typeRaw === "flight" && b.departureTime && (
                    <div className="text-xs text-slate-400 mt-0.5">
                      {new Date(b.departureTime).toLocaleString([], {
                        month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                      {b.arrivalTime && (
                        <> → {new Date(b.arrivalTime).toLocaleString([], {
                          hour: "2-digit", minute: "2-digit",
                        })}</>
                      )}
                    </div>
                  )}
                  {b.typeRaw === "hotel" && (
                    <>
                      {b.hotelName && (
                        <div className="text-xs text-slate-500 mt-0.5">{b.hotelName}</div>
                      )}
                      {(b.checkInDate || b.checkOutDate) && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          {b.checkInDate && new Date(b.checkInDate + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          {b.checkInDate && b.checkOutDate && " → "}
                          {b.checkOutDate && new Date(b.checkOutDate + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </div>
                      )}
                    </>
                  )}
                  {b.notes && (
                    <div className="text-xs text-slate-500 mt-1 italic">{b.notes}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditing(b)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteBooking(b.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add booking
        </button>
      </div>

      {editing !== null && (
        <BookingDialog
          booking={editing === "new" ? null : editing}
          onSave={saveBooking}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
