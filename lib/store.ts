import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type {
  TruckLoad,
  Bale,
  Pyramid,
  Slot,
  Supplier,
  Alert,
  Event,
  Config,
  Session,
  ConsumptionBatch,
} from "./types";

interface AppState {
  trucks: TruckLoad[];
  bales: Bale[];
  pyramids: Pyramid[];
  slots: Slot[];
  suppliers: Supplier[];
  alerts: Alert[];
  events: Event[];
  consumptionBatches: ConsumptionBatch[];
  config: Config;
  session: Session;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  addTruck: (truck: TruckLoad) => void;
  updateTruck: (truckId: string, updates: Partial<TruckLoad>) => void;
  getTruck: (truckId: string) => TruckLoad | undefined;

  addBale: (bale: Bale) => void;
  updateBale: (baleId: string, updates: Partial<Bale>) => void;
  getBale: (baleId: string) => Bale | undefined;

  addPyramid: (pyramid: Pyramid) => void;
  updatePyramid: (pyramidId: string, updates: Partial<Pyramid>) => void;
  getPyramid: (pyramidId: string) => Pyramid | undefined;

  addSlot: (slot: Slot) => void;
  updateSlot: (slotId: string, updates: Partial<Slot>) => void;
  getSlot: (slotId: string) => Slot | undefined;

  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplierId: string, updates: Partial<Supplier>) => void;
  getSupplier: (supplierId: string) => Supplier | undefined;

  addAlert: (alert: Alert) => void;
  clearAlert: (alertId: string) => void;

  addEvent: (event: Event) => void;

  addConsumptionBatch: (batch: ConsumptionBatch) => void;
  updateConsumptionBatch: (batchId: string, updates: Partial<ConsumptionBatch>) => void;
  getConsumptionBatch: (batchId: string) => ConsumptionBatch | undefined;

  updateConfig: (updates: Partial<Config>) => void;
  updateSession: (updates: Partial<Session>) => void;

  resetAllData: (newState: Partial<AppState>) => void;
}

export const useStore = create<AppState>()(
  persist(
    immer((set, get) => ({
      trucks: [],
      bales: [],
      pyramids: [],
      slots: [],
      suppliers: [],
      alerts: [],
      events: [],
      consumptionBatches: [],
      config: {
        speciesThresholds: {
          Straw: { acceptPct: 14, rejectPct: 14 },
        },
        batchRejectEnabled: true,
        reloadThresholdDays: 3,
        dailyUsageByGrade: { A: 80, B: 40 },
        pyramidShape: { x: 8, y: 8, z: 5 },
        timezone: "Asia/Kolkata",
      },
      session: {
        currentRole: "Admin",
        operatorId: "OP001",
      },
      _hasHydrated: false,
      setHasHydrated: (state) =>
        set(() => ({
          _hasHydrated: state,
        })),

      addTruck: (truck) =>
        set((state) => {
          state.trucks.push(truck);
        }),

      updateTruck: (truckId, updates) =>
        set((state) => {
          const truck = state.trucks.find((t) => t.truckId === truckId);
          if (truck) {
            Object.assign(truck, updates);
          }
        }),

      getTruck: (truckId) => get().trucks.find((t) => t.truckId === truckId),

      addBale: (bale) =>
        set((state) => {
          state.bales.push(bale);
        }),

      updateBale: (baleId, updates) =>
        set((state) => {
          const bale = state.bales.find((b) => b.baleId === baleId);
          if (bale) {
            Object.assign(bale, updates);
          }
        }),

      getBale: (baleId) => get().bales.find((b) => b.baleId === baleId),

      addPyramid: (pyramid) =>
        set((state) => {
          state.pyramids.push(pyramid);
        }),

      updatePyramid: (pyramidId, updates) =>
        set((state) => {
          const pyramid = state.pyramids.find((p) => p.pyramidId === pyramidId);
          if (pyramid) {
            Object.assign(pyramid, updates);
          }
        }),

      getPyramid: (pyramidId) =>
        get().pyramids.find((p) => p.pyramidId === pyramidId),

      addSlot: (slot) =>
        set((state) => {
          const existingIndex = state.slots.findIndex(
            (s) => s.slotId === slot.slotId
          );
          if (existingIndex >= 0) {
            state.slots[existingIndex] = slot;
          } else {
            state.slots.push(slot);
          }
        }),

      updateSlot: (slotId, updates) =>
        set((state) => {
          const slot = state.slots.find((s) => s.slotId === slotId);
          if (slot) {
            Object.assign(slot, updates);
          }
        }),

      getSlot: (slotId) => get().slots.find((s) => s.slotId === slotId),

      addSupplier: (supplier) =>
        set((state) => {
          state.suppliers.push(supplier);
        }),

      updateSupplier: (supplierId, updates) =>
        set((state) => {
          const supplier = state.suppliers.find(
            (s) => s.supplierId === supplierId
          );
          if (supplier) {
            Object.assign(supplier, updates);
          }
        }),

      getSupplier: (supplierId) =>
        get().suppliers.find((s) => s.supplierId === supplierId),

      addAlert: (alert) =>
        set((state) => {
          state.alerts.push(alert);
        }),

      clearAlert: (alertId) =>
        set((state) => {
          const alert = state.alerts.find((a) => a.alertId === alertId);
          if (alert) {
            alert.clearedAt = new Date().toISOString();
          }
        }),

      addEvent: (event) =>
        set((state) => {
          state.events.push(event);
        }),

      addConsumptionBatch: (batch) =>
        set((state) => {
          state.consumptionBatches.push(batch);
        }),

      updateConsumptionBatch: (batchId, updates) =>
        set((state) => {
          const batch = state.consumptionBatches.find((b) => b.batchId === batchId);
          if (batch) {
            Object.assign(batch, updates);
          }
        }),

      getConsumptionBatch: (batchId) =>
        get().consumptionBatches.find((b) => b.batchId === batchId),

      updateConfig: (updates) =>
        set((state) => {
          Object.assign(state.config, updates);
        }),

      updateSession: (updates) =>
        set((state) => {
          Object.assign(state.session, updates);
        }),

      resetAllData: (newState) =>
        set((state) => {
          if (state.bales.length === 0 || newState.trucks || newState.bales) {
            Object.assign(state, newState);
          }
        }),
    })),
    {
      name: "bale-management-storage",
      version: 1,
      skipHydration: false,
      partialize: (state) => ({
        trucks: state.trucks,
        bales: state.bales,
        pyramids: state.pyramids,
        slots: state.slots,
        suppliers: state.suppliers,
        alerts: state.alerts,
        events: state.events,
        consumptionBatches: state.consumptionBatches,
        config: state.config,
        session: state.session,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
