import type {
  TruckLoad,
  Bale,
  Pyramid,
  Slot,
  Supplier,
  Alert,
  Event,
  Config,
} from "./types";
import { nowISO } from "./time";

export function generateSeedData() {
  const now = new Date();

  const suppliers: Supplier[] = [
    {
      supplierId: "SUP001",
      name: "Agro Prime",
      contacts: "John Doe, +91-9876543210",
      tier: 1,
      score: 95,
      kpi: { failRatePct: 1.5, avgMoisturePct: 12.5, variance: 0.8 },
    },
    {
      supplierId: "SUP002",
      name: "HarvestCo",
      contacts: "Jane Smith, +91-9876543211",
      tier: 2,
      score: 78,
      kpi: { failRatePct: 4.2, avgMoisturePct: 13.8, variance: 1.5 },
    },
    {
      supplierId: "SUP003",
      name: "Strawlink",
      contacts: "Bob Wilson, +91-9876543212",
      tier: 3,
      score: 62,
      kpi: { failRatePct: 9.5, avgMoisturePct: 14.5, variance: 2.3 },
    },
  ];

  const pyramids: Pyramid[] = [
    {
      pyramidId: "PYR-A1",
      qualityGrade: "A",
      zone: "North",
      x0: 0,
      y0: 0,
      z0: 0,
      capacity: 320,
      status: "Active",
      shape: { x: 8, y: 8, z: 5 },
    },
    {
      pyramidId: "PYR-A2",
      qualityGrade: "A",
      zone: "North",
      x0: 10,
      y0: 0,
      z0: 0,
      capacity: 320,
      status: "Active",
      shape: { x: 8, y: 8, z: 5 },
    },
    {
      pyramidId: "PYR-B1",
      qualityGrade: "B",
      zone: "South",
      x0: 0,
      y0: 10,
      z0: 0,
      capacity: 320,
      status: "Active",
      shape: { x: 8, y: 8, z: 5 },
    },
  ];

  const trucks: TruckLoad[] = [
    {
      truckId: "TRK001",
      driverCardId: "DRV12345",
      supplierId: "SUP001",
      lot: "LOT-2024-001",
      source: "Farm A, District 1",
      baleType: "Midi",
      inTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      status: "UNLOAD_LOOP",
      baleCount: 0,
      notes: "Premium quality expected",
    },
    {
      truckId: "TRK002",
      driverCardId: "DRV12346",
      supplierId: "SUP003",
      lot: "LOT-2024-002",
      source: "Farm C, District 3",
      baleType: "Legacy70",
      inTime: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      status: "UNLOAD_LOOP",
      baleCount: 0,
      notes: "Quality concerns noted",
    },
  ];

  const bales: Bale[] = [];
  const slots: Slot[] = [];

  let baleCounter = 1;

  function addBale(
    truckId: string,
    pyramidId: string,
    grade: "A" | "B",
    moisture: number,
    x: number,
    y: number,
    z: number
  ) {
    const baleId = `BALE${String(baleCounter).padStart(5, "0")}`;
    baleCounter++;

    const weight = 450 + Math.random() * 100;
    const ts = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);

    const bale: Bale = {
      baleId,
      truckId,
      baleType: "Midi",
      species: "Straw",
      moisturePct: moisture,
      weightKg: Math.round(weight),
      density: Math.round((weight / 0.5) * 100) / 100,
      decision: moisture <= 14 ? "Pass" : "Fail",
      operatorId: "OP001",
      ts: ts.toISOString(),
      pyramidId: moisture <= 14 ? pyramidId : undefined,
      slot: moisture <= 14 ? { x, y, z } : undefined,
    };

    bales.push(bale);

    if (moisture <= 14) {
      const slotId = `${pyramidId}-${x}-${y}-${z}`;
      slots.push({
        slotId,
        pyramidId,
        x,
        y,
        z,
        baleId,
        placedTs: ts.toISOString(),
      });
    }
  }

  for (let z = 0; z < 3; z++) {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 5; x++) {
        const moisture = 11 + Math.random() * 2;
        addBale("TRK-HIST-001", "PYR-A1", "A", moisture, x, y, z);
      }
    }
  }

  for (let z = 0; z < 2; z++) {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 4; x++) {
        const moisture = 12.5 + Math.random() * 1.5;
        addBale("TRK-HIST-002", "PYR-A2", "A", moisture, x, y, z);
      }
    }
  }

  for (let z = 0; z < 2; z++) {
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const moisture = 13 + Math.random() * 1;
        addBale("TRK-HIST-003", "PYR-B1", "B", moisture, x, y, z);
      }
    }
  }

  const alerts: Alert[] = [
    {
      alertId: "ALT001",
      type: "Reload",
      severity: "warn",
      message: "Grade A inventory low - 2 days cover remaining",
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      meta: { grade: "A", daysCover: 2 },
    },
    {
      alertId: "ALT002",
      type: "Quality",
      severity: "critical",
      message: "High fail rate detected from Strawlink (SUP003)",
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      meta: { supplierId: "SUP003", failRate: 9.5 },
    },
  ];

  const events: Event[] = [
    {
      eventId: "EVT001",
      scope: "Truck",
      actor: "OP001",
      change: "TRK001 transitioned CHECK_IN → GROSS_IN",
      ts: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      eventId: "EVT002",
      scope: "Bale",
      actor: "OP001",
      change: "BALE00001 placed to PYR-A1 (0,0,0)",
      ts: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      eventId: "EVT003",
      scope: "System",
      actor: "SYSTEM",
      change: "Reload alert generated for Grade A",
      ts: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return {
    suppliers,
    pyramids,
    trucks,
    bales,
    slots,
    alerts,
    events,
  };
}
