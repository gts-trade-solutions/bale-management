import type {
  Config,
  Species,
  BaleDecision,
  Supplier,
  SupplierTier,
  TruckStatus,
  Bale,
  Pyramid,
  Slot,
  QualityGrade,
} from "./types";

export function classifyBale(
  moisturePct: number,
  species: Species,
  config: Config
): BaleDecision {
  const threshold = config.speciesThresholds[species];
  if (!threshold) return "Fail";
  return moisturePct <= threshold.rejectPct ? "Pass" : "Fail";
}

export function computeDensity(weightKg: number, baleType: string): number {
  const volumeMap: Record<string, number> = {
    Midi: 0.5,
    Legacy70: 0.7,
    Legacy130: 1.3,
  };
  const volume = volumeMap[baleType] || 1;
  return weightKg / volume;
}

export function supplierTiering(
  failRatePct: number,
  avgMoisturePct: number,
  acceptPct: number
): SupplierTier {
  if (failRatePct < 2 && avgMoisturePct <= acceptPct) return 1;
  if (failRatePct > 8) return 3;
  return 2;
}

export function computeDaysCover(
  onHand: number,
  dailyUsage: number
): number {
  if (dailyUsage === 0) return 999;
  return Math.floor(onHand / dailyUsage);
}

export function getNextTruckStatus(current: TruckStatus): TruckStatus | null {
  const flow: Record<TruckStatus, TruckStatus | null> = {
    WAIT_TRUCK: "CHECK_IN",
    CHECK_IN: "GROSS_IN",
    GROSS_IN: "UNLOAD_LOOP",
    UNLOAD_LOOP: "TARE_OUT",
    BATCH_REJECT: "TARE_OUT",
    TARE_OUT: "CLOSE_TRUCK_RECORD",
    CLOSE_TRUCK_RECORD: null,
  };
  return flow[current] || null;
}

export function canTransitionTruck(
  current: TruckStatus,
  next: TruckStatus
): boolean {
  const allowed = getNextTruckStatus(current);
  return allowed === next;
}

export function findAvailableSlot(
  pyramid: Pyramid,
  slots: Slot[]
): { x: number; y: number; z: number } | null {
  const pyramidSlots = slots.filter((s) => s.pyramidId === pyramid.pyramidId);
  const occupied = new Set(
    pyramidSlots.filter((s) => s.baleId).map((s) => `${s.x},${s.y},${s.z}`)
  );

  for (let z = 0; z < pyramid.shape.z; z++) {
    for (let y = 0; y < pyramid.shape.y; y++) {
      for (let x = 0; x < pyramid.shape.x; x++) {
        const key = `${x},${y},${z}`;
        if (!occupied.has(key)) {
          return { x, y, z };
        }
      }
    }
  }
  return null;
}

export function placeBaleToPyramid(
  bale: Bale,
  pyramidId: string,
  coord: { x: number; y: number; z: number },
  slots: Slot[]
): { updatedBale: Bale; updatedSlot: Slot } {
  const slotId = `${pyramidId}-${coord.x}-${coord.y}-${coord.z}`;
  const existingSlot = slots.find((s) => s.slotId === slotId);

  const updatedBale = {
    ...bale,
    pyramidId,
    slot: coord,
  };

  const updatedSlot: Slot = existingSlot
    ? { ...existingSlot, baleId: bale.baleId, placedTs: new Date().toISOString() }
    : {
        slotId,
        pyramidId,
        ...coord,
        baleId: bale.baleId,
        placedTs: new Date().toISOString(),
      };

  return { updatedBale, updatedSlot };
}

export function calculateSupplierKPI(
  supplierId: string,
  bales: Bale[]
): { failRatePct: number; avgMoisturePct: number; variance: number } {
  const supplierBales = bales.filter((b) => {
    return true;
  });

  if (supplierBales.length === 0) {
    return { failRatePct: 0, avgMoisturePct: 0, variance: 0 };
  }

  const failCount = supplierBales.filter((b) => b.decision === "Fail").length;
  const failRatePct = (failCount / supplierBales.length) * 100;

  const moistureValues = supplierBales.map((b) => b.moisturePct);
  const avgMoisturePct =
    moistureValues.reduce((sum, v) => sum + v, 0) / moistureValues.length;

  const variance =
    moistureValues.reduce((sum, v) => sum + Math.pow(v - avgMoisturePct, 2), 0) /
    moistureValues.length;

  return {
    failRatePct: Math.round(failRatePct * 100) / 100,
    avgMoisturePct: Math.round(avgMoisturePct * 100) / 100,
    variance: Math.round(variance * 100) / 100,
  };
}
