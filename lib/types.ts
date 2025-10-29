export type UserRole = "Admin" | "Supervisor" | "Operator" | "Viewer";

export type BaleType = "Midi" | "Legacy70" | "Legacy130";

export type TruckStatus =
  | "WAIT_TRUCK"
  | "CHECK_IN"
  | "GROSS_IN"
  | "UNLOAD_LOOP"
  | "BATCH_REJECT"
  | "TARE_OUT"
  | "CLOSE_TRUCK_RECORD";

export type BatchDecision = "Accepted" | "Rejected";

export type TruckLoad = {
  truckId: string;
  driverCardId?: string;
  driverName?: string;
  driverPhone?: string;
  driverLicense?: string;
  vehicleRegistration?: string;
  vehicleType?: string;
  supplierId: string;
  lot: string;
  source: string;
  baleType: BaleType;
  inTime: string;
  outTime?: string;
  gross?: number;
  tare?: number;
  baleCount: number;
  expectedBaleCount?: number;
  estimatedUnloadDuration?: number;
  temperatureAtArrival?: number;
  weatherConditions?: string;
  specialInstructions?: string;
  previousVisitReference?: string;
  batchDecision?: BatchDecision;
  notes?: string;
  status: TruckStatus;
  vehicleImage?: string;
  driverLicenseImage?: string;
  insuranceDocImage?: string;
  registrationDocImage?: string;
  additionalDocuments?: string[];
};

export type Species = "Straw";

export type BaleDecision = "Pass" | "Fail";

export type Bale = {
  baleId: string;
  truckId: string;
  baleType: BaleType;
  species: Species;
  moisturePct: number;
  weightKg: number;
  density?: number;
  decision: BaleDecision;
  operatorId?: string;
  ts: string;
  pyramidId?: string;
  slot?: { x: number; y: number; z: number };
};

export type QualityGrade = "A" | "B";

export type PyramidStatus = "Active" | "Locked";

export type Pyramid = {
  pyramidId: string;
  qualityGrade: QualityGrade;
  zone: string;
  x0: number;
  y0: number;
  z0: number;
  capacity: number;
  status: PyramidStatus;
  shape: { x: number; y: number; z: number };
};

export type Slot = {
  slotId: string;
  pyramidId: string;
  x: number;
  y: number;
  z: number;
  baleId?: string;
  placedTs?: string;
  emptiedTs?: string;
};

export type ConsumptionBatch = {
  batchId: string;
  line: string;
  startTs: string;
  endTs?: string;
  baleIds: string[];
  averageMoisture?: number;
  avgWeightKg?: number;
};

export type SupplierTier = 1 | 2 | 3;

export type Supplier = {
  supplierId: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  contacts?: string;
  tier: SupplierTier;
  score: number;
  kpi: { failRatePct: number; avgMoisturePct: number; variance: number };
  tierOverride?: SupplierTier;
  status?: "active" | "inactive";
  createdAt?: string;
};

export type AlertType = "Reload" | "Quality" | "Equipment";

export type AlertSeverity = "info" | "warn" | "critical";

export type Alert = {
  alertId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  createdAt: string;
  clearedAt?: string;
  meta?: Record<string, any>;
};

export type EventScope = "Truck" | "Bale" | "System";

export type Event = {
  eventId: string;
  scope: EventScope;
  actor: string;
  change: string;
  ts: string;
};

export type Config = {
  speciesThresholds: Record<Species, { acceptPct: number; rejectPct: number }>;
  batchRejectEnabled: boolean;
  reloadThresholdDays: number;
  dailyUsageByGrade: Record<QualityGrade, number>;
  pyramidShape: { x: number; y: number; z: number };
  timezone: "Asia/Kolkata";
};

export type Session = {
  currentRole: UserRole;
  operatorId: string;
};
