"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Booking, BookingType } from "@/lib/types";
import { newId } from "@/lib/types";
import { cn } from "@/components/ui/cn";

interface BookingDialogProps {
  booking?: Booking | null;
  onSave: (booking: Booking) => void;
  onClose: () => void;
}

const BOOKING_TYPES: { value: BookingType; label: string; icon: string }[] = [
  { value: "flight", label: "Flight", icon: "✈️" },
  { value: "hotel", label: "Hotel", icon: "🏨" },
  { value: "car_rental", label: "Car rental", icon: "🚗" },
  { value: "other", label: "Other", icon: "📋" },
];

function emptyBooking(): Booking {
  return {
    id: newId(),
    typeRaw: "flight",
    title: "",
    confirmationCode: "",
    notes: "",
    sortOrder: 0,
  };
}

export default function BookingDialog({ booking, onSave, onClose }: BookingDialogProps) {
  const [form, setForm] = useState<Booking>(() => booking ?? emptyBooking());

  function set<K extends keyof Booking>(key: K, value: Booking[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, id: form.id || newId() });
  }

  const isFlight = form.typeRaw === "flight";
  const isHotel = form.typeRaw === "hotel";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white">
          <h2 className="font-semibold text-slate-800">
            {booking ? "Edit Booking" : "Add Booking"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Type</label>
            <div className="flex gap-2 flex-wrap">
              {BOOKING_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set("typeRaw", t.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors",
                    form.typeRaw === t.value
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"
                  )}
                >
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
              placeholder={isFlight ? "e.g. JFK → CDG" : isHotel ? "e.g. Hotel Le Marais" : "Title"}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Confirmation code */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Confirmation code</label>
            <input
              type="text"
              value={form.confirmationCode}
              onChange={(e) => set("confirmationCode", e.target.value)}
              placeholder="e.g. ABC123"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Flight fields */}
          {isFlight && (
            <div className="border border-blue-100 rounded-lg p-3 bg-blue-50 space-y-3">
              <p className="text-xs font-semibold text-blue-700">Flight Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Airline</label>
                  <input
                    type="text"
                    value={form.airline ?? ""}
                    onChange={(e) => set("airline", e.target.value || undefined)}
                    placeholder="e.g. Delta"
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Flight #</label>
                  <input
                    type="text"
                    value={form.flightNumber ?? ""}
                    onChange={(e) => set("flightNumber", e.target.value || undefined)}
                    placeholder="e.g. DL234"
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Departure airport</label>
                  <input
                    type="text"
                    value={form.departureAirport ?? ""}
                    onChange={(e) => set("departureAirport", e.target.value || undefined)}
                    placeholder="JFK"
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Arrival airport</label>
                  <input
                    type="text"
                    value={form.arrivalAirport ?? ""}
                    onChange={(e) => set("arrivalAirport", e.target.value || undefined)}
                    placeholder="CDG"
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Departure time</label>
                  <input
                    type="datetime-local"
                    value={form.departureTime?.slice(0, 16) ?? ""}
                    onChange={(e) => set("departureTime", e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Arrival time</label>
                  <input
                    type="datetime-local"
                    value={form.arrivalTime?.slice(0, 16) ?? ""}
                    onChange={(e) => set("arrivalTime", e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hotel fields */}
          {isHotel && (
            <div className="border border-purple-100 rounded-lg p-3 bg-purple-50 space-y-3">
              <p className="text-xs font-semibold text-purple-700">Hotel Details</p>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Hotel name</label>
                <input
                  type="text"
                  value={form.hotelName ?? ""}
                  onChange={(e) => set("hotelName", e.target.value || undefined)}
                  placeholder="e.g. Le Marais Hotel"
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
                <input
                  type="text"
                  value={form.hotelAddress ?? ""}
                  onChange={(e) => set("hotelAddress", e.target.value || undefined)}
                  placeholder="Street address"
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Check-in</label>
                  <input
                    type="date"
                    value={form.checkInDate ?? ""}
                    onChange={(e) => set("checkInDate", e.target.value || undefined)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Check-out</label>
                  <input
                    type="date"
                    value={form.checkOutDate ?? ""}
                    onChange={(e) => set("checkOutDate", e.target.value || undefined)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              placeholder="Any details…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              {booking ? "Save" : "Add Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
