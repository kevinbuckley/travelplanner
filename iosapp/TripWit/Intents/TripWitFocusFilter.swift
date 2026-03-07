import AppIntents

/// A Focus filter that lets users choose which trip status to surface
/// when a Focus mode (e.g. "Travel", "Work") is active.
///
/// Users configure this in Settings → Focus → [Mode] → App Filters → TripWit.
struct TripWitFocusFilter: SetFocusFilterIntent {

    static var title: LocalizedStringResource = "Filter Trips by Status"
    static var description: IntentDescription = IntentDescription(
        "Choose which trips TripWit highlights while this Focus mode is active.",
        categoryName: "TripWit"
    )

    // MARK: - Parameters

    @Parameter(title: "Show Trips", description: "Which trip status to highlight during this Focus")
    var tripStatus: FocusTripStatus?

    // MARK: - Perform

    func perform() async throws -> some IntentResult {
        // Persist the selected status via UserDefaults (App Group so widget sees it too)
        FocusFilterStore.write(status: tripStatus ?? .all)
        return .result()
    }

    // MARK: - Display Representation

    var displayRepresentation: DisplayRepresentation {
        let name = tripStatus?.localizedName ?? "All"
        return DisplayRepresentation(
            title: "\(name) trips",
            subtitle: "TripWit Focus filter"
        )
    }
}

// MARK: - FocusTripStatus

enum FocusTripStatus: String, AppEnum {
    case active   = "active"
    case upcoming = "upcoming"
    case all      = "all"

    static var typeDisplayRepresentation: TypeDisplayRepresentation {
        TypeDisplayRepresentation(name: "Trip Status")
    }

    static var caseDisplayRepresentations: [FocusTripStatus: DisplayRepresentation] {
        [
            .active:   DisplayRepresentation(title: "Active"),
            .upcoming: DisplayRepresentation(title: "Upcoming"),
            .all:      DisplayRepresentation(title: "All Trips"),
        ]
    }

    var localizedName: String {
        switch self {
        case .active:   "Active"
        case .upcoming: "Upcoming"
        case .all:      "All"
        }
    }
}

// MARK: - FocusFilterStore

/// Persists the active Focus filter status via App Group UserDefaults.
enum FocusFilterStore {
    static let appGroupID = WidgetDataStore.appGroupID
    static let key = "tripwit.focus.tripStatus"

    static func write(status: FocusTripStatus) {
        UserDefaults(suiteName: appGroupID)?.set(status.rawValue, forKey: key)
    }

    static func read() -> FocusTripStatus {
        guard let raw = UserDefaults(suiteName: appGroupID)?.string(forKey: key),
              let status = FocusTripStatus(rawValue: raw)
        else { return .all }
        return status
    }

    static func clear() {
        UserDefaults(suiteName: appGroupID)?.removeObject(forKey: key)
    }
}
