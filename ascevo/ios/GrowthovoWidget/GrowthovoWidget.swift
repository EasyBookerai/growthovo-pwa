import WidgetKit
import SwiftUI

// MARK: - Data Model

struct WidgetData: Codable {
    let streak: Int
    let xp: Int
    let hearts: Int
    let challengeTitle: String
    let leaguePosition: Int
    let primaryPillar: String
    let rexDailyLine: String
    let updatedAt: String
}

// MARK: - Timeline Entry

struct GrowthovoEntry: TimelineEntry {
    let date: Date
    let streak: Int
    let xp: Int
    let hearts: Int
    let challengeTitle: String
    let leaguePosition: Int
    let primaryPillar: String
    let rexDailyLine: String
    let isStale: Bool
}

// MARK: - Data Loading

private let appGroupID = "group.com.growthovo.app"
private let widgetDataKey = "@growthovo_widget_data"
private let stalenessThreshold: TimeInterval = 24 * 60 * 60 // 24 hours

private func loadWidgetData() -> GrowthovoEntry {
    let defaults = UserDefaults(suiteName: appGroupID)
    let fallback = GrowthovoEntry(
        date: Date(),
        streak: 0, xp: 0, hearts: 0,
        challengeTitle: "", leaguePosition: 0,
        primaryPillar: "mind", rexDailyLine: "",
        isStale: true
    )

    guard
        let raw = defaults?.string(forKey: widgetDataKey),
        let data = raw.data(using: .utf8),
        let parsed = try? JSONDecoder().decode(WidgetData.self, from: data)
    else {
        return fallback
    }

    let formatter = ISO8601DateFormatter()
    let updatedAt = formatter.date(from: parsed.updatedAt) ?? .distantPast
    let isStale = Date().timeIntervalSince(updatedAt) > stalenessThreshold

    return GrowthovoEntry(
        date: Date(),
        streak: parsed.streak,
        xp: parsed.xp,
        hearts: parsed.hearts,
        challengeTitle: parsed.challengeTitle,
        leaguePosition: parsed.leaguePosition,
        primaryPillar: parsed.primaryPillar,
        rexDailyLine: parsed.rexDailyLine,
        isStale: isStale
    )
}

// MARK: - Timeline Provider

struct GrowthovoProvider: TimelineProvider {
    func placeholder(in context: Context) -> GrowthovoEntry {
        GrowthovoEntry(
            date: Date(),
            streak: 42, xp: 1200, hearts: 5,
            challengeTitle: "Morning Mindset",
            leaguePosition: 3,
            primaryPillar: "mind",
            rexDailyLine: "Day 42. Keep going.",
            isStale: false
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (GrowthovoEntry) -> Void) {
        completion(loadWidgetData())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<GrowthovoEntry>) -> Void) {
        let entry = loadWidgetData()
        // Refresh every 30 minutes
        let nextRefresh = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date()
        let timeline = Timeline(entries: [entry], policy: .after(nextRefresh))
        completion(timeline)
    }
}

// MARK: - Pillar Accent Color

private func pillarColor(_ pillar: String) -> Color {
    switch pillar.lowercased() {
    case "mind":          return Color(red: 0.40, green: 0.51, blue: 0.98)
    case "discipline":    return Color(red: 0.98, green: 0.45, blue: 0.40)
    case "communication": return Color(red: 0.40, green: 0.85, blue: 0.65)
    case "money":         return Color(red: 0.98, green: 0.80, blue: 0.20)
    case "relationships": return Color(red: 0.90, green: 0.40, blue: 0.85)
    default:              return Color(red: 0.40, green: 0.51, blue: 0.98)
    }
}

// MARK: - Fallback View

struct FallbackView: View {
    var body: some View {
        VStack(spacing: 6) {
            Text("GROWTHOVO")
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(.white)
            Text("Open GROWTHOVO")
                .font(.caption)
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.black)
    }
}

// MARK: - Small Widget View

struct SmallWidgetView: View {
    let entry: GrowthovoEntry

    var body: some View {
        if entry.isStale {
            FallbackView()
        } else {
            ZStack {
                pillarColor(entry.primaryPillar).opacity(0.15)
                    .ignoresSafeArea()
                VStack(spacing: 4) {
                    Text("GROWTHOVO")
                        .font(.caption2)
                        .fontWeight(.bold)
                        .foregroundColor(.white.opacity(0.7))
                    HStack(spacing: 4) {
                        Text("🔥")
                            .font(.title2)
                        Text("\(entry.streak)")
                            .font(.system(size: 36, weight: .black))
                            .foregroundColor(.white)
                    }
                    Text("day streak")
                        .font(.caption2)
                        .foregroundColor(.gray)
                }
            }
            .background(Color.black)
        }
    }
}

// MARK: - Medium Widget View

struct MediumWidgetView: View {
    let entry: GrowthovoEntry

    var body: some View {
        if entry.isStale {
            FallbackView()
        } else {
            HStack(spacing: 12) {
                // Left: streak
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 4) {
                        Text("🔥")
                        Text("\(entry.streak)")
                            .font(.system(size: 28, weight: .black))
                            .foregroundColor(.white)
                    }
                    Text("day streak")
                        .font(.caption2)
                        .foregroundColor(.gray)
                }

                Divider()
                    .background(Color.gray.opacity(0.4))

                // Right: challenge + XP + hearts
                VStack(alignment: .leading, spacing: 6) {
                    Text(entry.challengeTitle)
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .lineLimit(1)

                    // XP bar
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 3)
                                .fill(Color.gray.opacity(0.3))
                                .frame(height: 6)
                            RoundedRectangle(cornerRadius: 3)
                                .fill(pillarColor(entry.primaryPillar))
                                .frame(width: geo.size.width * min(CGFloat(entry.xp) / 5000.0, 1.0), height: 6)
                        }
                    }
                    .frame(height: 6)

                    HStack(spacing: 4) {
                        Text("❤️ \(entry.hearts)")
                            .font(.caption2)
                            .foregroundColor(.gray)
                        Spacer()
                        Text("\(entry.xp) XP")
                            .font(.caption2)
                            .foregroundColor(pillarColor(entry.primaryPillar))
                    }
                }
            }
            .padding(12)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.black)
        }
    }
}

// MARK: - Large Widget View

struct LargeWidgetView: View {
    let entry: GrowthovoEntry

    var body: some View {
        if entry.isStale {
            FallbackView()
        } else {
            VStack(alignment: .leading, spacing: 10) {
                // Header
                HStack {
                    Text("GROWTHOVO")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(.white.opacity(0.6))
                    Spacer()
                    Text("🏆 #\(entry.leaguePosition)")
                        .font(.caption)
                        .foregroundColor(pillarColor(entry.primaryPillar))
                }

                // Streak
                HStack(alignment: .bottom, spacing: 6) {
                    Text("🔥")
                        .font(.title)
                    Text("\(entry.streak)")
                        .font(.system(size: 48, weight: .black))
                        .foregroundColor(.white)
                    Text("days")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                        .padding(.bottom, 8)
                }

                // Stats row
                HStack(spacing: 16) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(entry.xp)")
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(pillarColor(entry.primaryPillar))
                        Text("XP")
                            .font(.caption2)
                            .foregroundColor(.gray)
                    }
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(entry.hearts)")
                            .font(.headline)
                            .fontWeight(.bold)
                            .foregroundColor(.red)
                        Text("hearts")
                            .font(.caption2)
                            .foregroundColor(.gray)
                    }
                }

                // Challenge
                Text(entry.challengeTitle)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .lineLimit(2)

                Spacer()

                // Rex line
                Text(entry.rexDailyLine)
                    .font(.caption)
                    .italic()
                    .foregroundColor(.gray)
                    .lineLimit(2)
            }
            .padding(14)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.black)
        }
    }
}

// MARK: - Widget Entry View (size router)

struct GrowthovoWidgetEntryView: View {
    var entry: GrowthovoEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        case .systemLarge:
            LargeWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

// MARK: - Widget Configuration

struct GrowthovoWidgetConfig: Widget {
    let kind: String = "GrowthovoWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: GrowthovoProvider()) { entry in
            GrowthovoWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("GROWTHOVO")
        .description("Your streak, XP, and daily challenge at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// MARK: - Widget Bundle

@main
struct GrowthovoWidgetBundle: WidgetBundle {
    var body: some Widget {
        GrowthovoWidgetConfig()
    }
}
