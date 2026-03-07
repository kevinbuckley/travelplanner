import WidgetKit
import SwiftUI

// MARK: - Timeline Entry

struct TripEntry: TimelineEntry {
    let date: Date
    let trip: WidgetTripData?
}

// MARK: - Provider

struct TripWitProvider: TimelineProvider {
    func placeholder(in context: Context) -> TripEntry {
        TripEntry(date: .now, trip: WidgetTripData(
            tripName: "Japan Adventure",
            destination: "Tokyo, Japan",
            startDate: .now,
            endDate: Calendar.current.date(byAdding: .day, value: 7, to: .now)!,
            statusRaw: "active",
            visitedStops: 3,
            totalStops: 12,
            nextStopName: "Senso-ji Temple",
            nextStopCategory: "attraction",
            daysRemaining: 5
        ))
    }

    func getSnapshot(in context: Context, completion: @escaping (TripEntry) -> Void) {
        completion(TripEntry(date: .now, trip: WidgetReader.read()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TripEntry>) -> Void) {
        let entry = TripEntry(date: .now, trip: WidgetReader.read())
        // Refresh every 30 minutes
        let next = Calendar.current.date(byAdding: .minute, value: 30, to: .now)!
        completion(Timeline(entries: [entry], policy: .after(next)))
    }
}

// MARK: - Widget

struct TripWitWidget: Widget {
    let kind = "TripWitWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TripWitProvider()) { entry in
            TripWitWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("TripWit")
        .description("See your active trip at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Views

struct TripWitWidgetView: View {
    let entry: TripEntry

    var body: some View {
        if let trip = entry.trip {
            TripActiveView(trip: trip)
        } else {
            NoTripView()
        }
    }
}

struct TripActiveView: View {
    let trip: WidgetTripData

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Image(systemName: "airplane.departure")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(trip.statusRaw == "active" ? "Active Trip" : "Upcoming")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Text(trip.tripName)
                .font(.headline)
                .lineLimit(1)

            Text(trip.destination)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .lineLimit(1)

            Spacer(minLength: 4)

            if let next = trip.nextStopName {
                Divider()
                Label(next, systemImage: categoryIcon(trip.nextStopCategory))
                    .font(.caption)
                    .lineLimit(1)
            }

            HStack {
                Label("\(trip.visitedStops)/\(trip.totalStops)", systemImage: "checkmark.circle.fill")
                    .font(.caption2)
                    .foregroundStyle(.green)
                Spacer()
                if trip.daysRemaining > 0 {
                    Text("\(trip.daysRemaining)d left")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(12)
    }

    private func categoryIcon(_ raw: String?) -> String {
        switch raw {
        case "restaurant": "fork.knife"
        case "attraction": "star.fill"
        case "accommodation": "bed.double.fill"
        case "transport": "car.fill"
        case "activity": "figure.walk"
        default: "mappin.circle.fill"
        }
    }
}

struct NoTripView: View {
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: "globe")
                .font(.title2)
                .foregroundStyle(.secondary)
            Text("No active trip")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Text("Open TripWit to plan one")
                .font(.caption2)
                .foregroundStyle(.tertiary)
        }
        .padding()
    }
}
