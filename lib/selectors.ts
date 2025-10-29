import type { Bale, QualityGrade, Pyramid, Slot, TruckLoad, Alert } from "./types";
import { hoursAgo } from "./time";

export function onHandByGrade(
  bales: Bale[],
  pyramids: Pyramid[]
): Record<QualityGrade, number> {
  const gradeMap = new Map<string, QualityGrade>();
  pyramids.forEach((p) => {
    gradeMap.set(p.pyramidId, p.qualityGrade);
  });

  const counts = { A: 0, B: 0 };
  bales.forEach((b) => {
    if (b.pyramidId && b.decision === "Pass") {
      const grade = gradeMap.get(b.pyramidId);
      if (grade) {
        counts[grade]++;
      }
    }
  });

  return counts;
}

export function daysCoverByGrade(
  bales: Bale[],
  pyramids: Pyramid[],
  dailyUsageByGrade: Record<QualityGrade, number>
): Record<QualityGrade, number> {
  const onHand = onHandByGrade(bales, pyramids);
  return {
    A: dailyUsageByGrade.A > 0 ? Math.floor(onHand.A / dailyUsageByGrade.A) : 999,
    B: dailyUsageByGrade.B > 0 ? Math.floor(onHand.B / dailyUsageByGrade.B) : 999,
  };
}

export function failRate(bales: Bale[], lastNHours: number): number {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - lastNHours);

  const recentBales = bales.filter((b) => {
    const baleDate = new Date(b.ts);
    return baleDate >= cutoff;
  });

  if (recentBales.length === 0) return 0;

  const failCount = recentBales.filter((b) => b.decision === "Fail").length;
  return (failCount / recentBales.length) * 100;
}

export function todayThroughput(bales: Bale[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return bales.filter((b) => {
    const baleDate = new Date(b.ts);
    return baleDate >= today;
  }).length;
}

export function moistureSeries(
  bales: Bale[],
  limit: number = 100
): Array<{ ts: string; moisture: number }> {
  return bales
    .slice(-limit)
    .map((b) => ({ ts: b.ts, moisture: b.moisturePct }))
    .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
}

export function throughputSeries(
  bales: Bale[],
  hours: number = 24
): Array<{ hour: string; count: number }> {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - hours);

  const recentBales = bales.filter((b) => new Date(b.ts) >= cutoff);

  const hourlyMap = new Map<string, number>();
  recentBales.forEach((b) => {
    const date = new Date(b.ts);
    const hourKey = `${date.getHours()}:00`;
    hourlyMap.set(hourKey, (hourlyMap.get(hourKey) || 0) + 1);
  });

  return Array.from(hourlyMap.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour.localeCompare(b.hour));
}

export function pyramidOccupancy(pyramid: Pyramid, slots: Slot[]): number {
  const pyramidSlots = slots.filter((s) => s.pyramidId === pyramid.pyramidId);
  const occupied = pyramidSlots.filter((s) => s.baleId).length;
  return pyramid.capacity > 0 ? (occupied / pyramid.capacity) * 100 : 0;
}

export function activeAlerts(alerts: Alert[]): Alert[] {
  return alerts.filter((a) => !a.clearedAt);
}

export function truckBales(truckId: string, bales: Bale[]): Bale[] {
  return bales.filter((b) => b.truckId === truckId);
}

export function supplierBales(supplierId: string, bales: Bale[], trucks: TruckLoad[]): Bale[] {
  const truckIds = trucks
    .filter((t) => t.supplierId === supplierId)
    .map((t) => t.truckId);
  return bales.filter((b) => truckIds.includes(b.truckId));
}
