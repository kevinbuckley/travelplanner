import Foundation

// Shared data model — must be kept in sync with WidgetDataStore.swift in the main app.
// Duplicated here since the widget extension cannot import the main app target.

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

enum WidgetReader {
    static let appGroupID = "group.com.kevinbuckley.travelplanner"
    static let dataKey    = "tripwit.widget.tripdata"

    static func read() -> WidgetTripData? {
        guard let defaults = UserDefaults(suiteName: appGroupID),
              let data = defaults.data(forKey: dataKey) else { return nil }
        return try? JSONDecoder().decode(WidgetTripData.self, from: data)
    }
}
