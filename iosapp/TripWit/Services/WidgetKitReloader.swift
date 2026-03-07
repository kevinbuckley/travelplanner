import WidgetKit

/// Thin wrapper so DataManager and WidgetDataStore can trigger widget reloads
/// without importing WidgetKit themselves.
enum WidgetKitReloader {
    static func reload() {
        WidgetCenter.shared.reloadAllTimelines()
    }
}
