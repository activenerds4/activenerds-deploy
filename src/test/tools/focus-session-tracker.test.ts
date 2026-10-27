import { describe, it, expect } from "vitest";
import { calculateStats } from "@/components/tools/FocusSessionTrackerTool";

describe("FocusSessionTracker - calculateStats", () => {
  it("should return zeros for empty sessions", () => {
    const stats = calculateStats([]);
    expect(stats.totalSessions).toBe(0);
    expect(stats.totalMinutes).toBe(0);
    expect(stats.movePercentage).toBe(0);
    expect(stats.streak).toBe(0);
  });

  it("should calculate total minutes correctly", () => {
    const sessions = [
      { id: "1", date: "2026-01-01", durationMin: 25, moved: true, label: "A" },
      { id: "2", date: "2026-01-01", durationMin: 45, moved: false, label: "B" },
    ];
    const stats = calculateStats(sessions);
    expect(stats.totalSessions).toBe(2);
    expect(stats.totalMinutes).toBe(70);
    expect(stats.avgDuration).toBe(35);
  });

  it("should calculate move percentage", () => {
    const sessions = [
      { id: "1", date: "2026-01-01", durationMin: 25, moved: true, label: "A" },
      { id: "2", date: "2026-01-01", durationMin: 25, moved: false, label: "B" },
      { id: "3", date: "2026-01-01", durationMin: 25, moved: true, label: "C" },
      { id: "4", date: "2026-01-01", durationMin: 25, moved: true, label: "D" },
    ];
    const stats = calculateStats(sessions);
    expect(stats.movePercentage).toBe(75);
  });
});
