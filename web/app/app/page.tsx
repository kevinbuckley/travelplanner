"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import TripsSidebar from "@/components/layout/TripsSidebar";
import TripDetail from "@/components/layout/TripDetail";
import MapPanel from "@/components/layout/MapPanel";
import { getTrips, createTrip, updateTrip, deleteTrip, insertTrip } from "@/lib/db";
import type { Trip, Stop } from "@/lib/types";

export default function AppPage() {
  const { user, loading } = useAuth();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [tripsLoading, setTripsLoading] = useState(true);

  // No redirect — unauthenticated users see the sign-in screen below

  // Load trips
  useEffect(() => {
    if (!user) return;
    setTripsLoading(true);
    getTrips(user.id)
      .then((data) => {
        setTrips(data);
        if (data.length > 0) setSelectedTripId(data[0].id);
      })
      .finally(() => setTripsLoading(false));
  }, [user]);

  const selectedTrip = trips.find((t) => t.id === selectedTripId) ?? null;

  const mapStops: Stop[] = selectedTrip
    ? selectedTrip.days.flatMap((d) => d.stops)
    : [];

  const handleCreateTrip = useCallback(async () => {
    if (!user) return;
    const trip = await createTrip(user.id);
    setTrips((prev) => [trip, ...prev]);
    setSelectedTripId(trip.id);
  }, [user]);

  const handleDeleteTrip = useCallback(async (id: string) => {
    await deleteTrip(id);
    setTrips((prev) => prev.filter((t) => t.id !== id));
    setSelectedTripId((cur) => {
      if (cur !== id) return cur;
      const remaining = trips.filter((t) => t.id !== id);
      return remaining[0]?.id ?? null;
    });
  }, [trips]);

  const handleImportTrip = useCallback(async (trip: Trip) => {
    if (!user) return;
    const tripWithUser = { ...trip, userId: user.id };
    await insertTrip(tripWithUser);
    setTrips((prev) => [tripWithUser, ...prev]);
    setSelectedTripId(trip.id);
  }, [user]);

  const handleUpdateTrip = useCallback(async (changes: Partial<Trip>) => {
    if (!selectedTripId) return;
    // Optimistic update
    setTrips((prev) =>
      prev.map((t) => (t.id === selectedTripId ? { ...t, ...changes } : t))
    );
    await updateTrip(selectedTripId, changes);
  }, [selectedTripId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-400 text-sm">
        Loading…
      </div>
    );
  }

  // Not signed in — show a proper sign-in screen (fixes redirect loop from landing page)
  if (!user) {
    return (
      <div className="h-screen flex flex-col">
        <Header showAds={false} />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
          <div className="text-5xl">✈️</div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Welcome to TripWit</h1>
            <p className="text-slate-500 text-sm max-w-xs">
              Sign in with Google to start planning your trips and access them from any device.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (tripsLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-400 text-sm">
        Loading trips…
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header showAds={true} />
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Trips sidebar */}
        <TripsSidebar
          trips={trips}
          selectedTripId={selectedTripId}
          userId={user.id}
          onSelectTrip={(id) => {
            setSelectedTripId(id);
            setSelectedStopId(null);
          }}
          onCreateTrip={handleCreateTrip}
          onDeleteTrip={handleDeleteTrip}
          onImportTrip={handleImportTrip}
        />

        {/* Center: Trip detail */}
        {selectedTrip ? (
          <TripDetail
            trip={selectedTrip}
            showAds={true}
            onUpdateTrip={handleUpdateTrip}
            onSelectStop={setSelectedStopId}
            selectedStopId={selectedStopId}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            {trips.length === 0
              ? "Create a trip to get started."
              : "Select a trip from the left."}
          </div>
        )}

        {/* Right: Map */}
        <div className="w-96 shrink-0 border-l border-slate-200">
          <MapPanel
            stops={mapStops}
            selectedStopId={selectedStopId}
            onSelectStop={setSelectedStopId}
          />
        </div>
      </div>
    </div>
  );
}
