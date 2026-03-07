import Foundation

/// Data written by the main app and read by the widget extension via App Groups.
struct WidgetTripData: Codable {
    var tripName: String
    var destination: String
    var startDate: Date
    var endDate: Date
    var statusRaw: String
    var visitedStops: Int
    var totalStops: Int
    var nextStopName: String?
    var nextStopCategory: String?
    var daysRemaining: Int
}

/// Manages the shared data store between the app and widget extension.
struct WidgetDataStore {
    static let appGroupID = "group.com.kevinbuckley.travelplanner"
    static let dataKey    = "tripwit.widget.tripdata"

    private static var defaults: UserDefaults? {
        UserDefaults(suiteName: appGroupID)
    }

    // MARK: - Write (called by main app)

    static func write(_ data: WidgetTripData) {
        guard let encoded = try? JSONEncoder().encode(data) else { return }
        defaults?.set(encoded, forKey: dataKey)
        WidgetKitReloader.reload()
    }

    static func clear() {
        defaults?.removeObject(forKey: dataKey)
    }

    // MARK: - Read (called by widget)

    static func read() -> WidgetTripData? {
        guard let data = defaults?.data(forKey: dataKey) else { return nil }
        return try? JSONDecoder().decode(WidgetTripData.self, from: data)
    }

    // MARK: - Build from entity (main app only)

    static func buildData(from trip: TripEntity) -> WidgetTripData {
        let calendar = Calendar.current
        let allStops = trip.daysArray.flatMap(\.stopsArray)
        let visited = allStops.filter(\.isVisited).count

        let today = calendar.startOfDay(for: Date())
        let nextStop = trip.daysArray
            .filter { calendar.startOfDay(for: $0.wrappedDate) >= today }
            .sorted { $0.dayNumber < $1.dayNumber }
            .flatMap(\.stopsArray)
            .filter { !$0.isVisited }
            .sorted { $0.sortOrder < $1.sortOrder }
            .first

        let daysLeft = trip.endDate.map {
            max(0, calendar.dateComponents([.day], from: today, to: calendar.startOfDay(for: $0)).day ?? 0)
        } ?? 0

        return WidgetTripData(
            tripName: trip.wrappedName,
            destination: trip.wrappedDestination,
            startDate: trip.wrappedStartDate,
            endDate: trip.wrappedEndDate,
            statusRaw: trip.wrappedStatusRaw,
            visitedStops: visited,
            totalStops: allStops.count,
            nextStopName: nextStop?.wrappedName,
            nextStopCategory: nextStop?.category.rawValue,
            daysRemaining: daysLeft
        )
    }
}
