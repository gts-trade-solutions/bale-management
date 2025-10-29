# Bale Management System - Application Documentation

**Version:** 1.0
**Date:** October 28, 2025
**Status:** Production-Ready Frontend Implementation

---

## Executive Summary

The Bale Management System is a comprehensive web application designed to manage the end-to-end lifecycle of bale processing in an industrial setting. The system tracks bales from initial truck arrival through quality assurance, storage in pyramidal structures, and eventual consumption in processing lines. Built with modern web technologies, it provides real-time operational visibility, traceability, and quality control.

### Key Capabilities

- **Truck Check-In & QA Workflow:** Automated workflow for truck arrival, weighing, per-bale quality assessment, and batch decisions
- **3D Pyramid Storage Management:** Visual management of bales in multi-dimensional storage pyramids with XYZ coordinate tracking
- **Processing & Consumption:** FEFO (First Expired First Out) bale selection for processing lines with batch tracking
- **End-to-End Traceability:** Sub-30-second queries tracking bales from supplier through consumption
- **Supplier Performance Management:** Automated tiering and scorecarding based on quality metrics
- **Real-Time Alerts:** Proactive notifications for quality failures, reload needs, and system events
- **Role-Based Access Control:** Granular permissions for Admin, Supervisor, Operator, and Viewer roles

---

## Technology Stack

### Frontend Framework
- **Next.js 14.2.12** - React framework with App Router
- **React 18.2.0** - UI library
- **TypeScript 5.2.2** - Type-safe development

### UI Component Library
- **shadcn/ui** - Accessible, customizable component system
- **Radix UI** - Unstyled, accessible component primitives
- **Tailwind CSS 3.3.3** - Utility-first CSS framework
- **Lucide React** - Icon library

### State Management
- **Zustand 5.0.8** - Lightweight state management
- **Immer 10.2.0** - Immutable state updates
- **Zustand Persist** - Local storage persistence

### Data Visualization
- **Recharts 2.12.7** - Composable charting library

### Form Management
- **React Hook Form 7.53.0** - Performance forms
- **Zod 3.23.8** - Schema validation
- **@hookform/resolvers** - Form validation integration

### Date/Time Handling
- **date-fns 3.6.0** - Modern date utility library
- **date-fns-tz 3.2.0** - Timezone support

### Notifications
- **Sonner 1.5.0** - Toast notifications

---

## Architecture Overview

### Application Structure

```
project/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Dashboard (/)
│   ├── check-in/            # Truck check-in (/check-in)
│   ├── trucks/              # Truck management (/trucks)
│   │   └── [id]/           # Truck detail workflow
│   ├── pyramids/           # Pyramid storage (/pyramids)
│   │   └── [id]/           # Pyramid 3D visualization
│   ├── processing/          # Processing & consumption (/processing)
│   ├── traceability/        # Traceability queries (/traceability)
│   ├── suppliers/           # Supplier management (/suppliers)
│   ├── alerts/              # Alert center (/alerts)
│   ├── reports/             # Reporting & exports (/reports)
│   └── settings/            # System configuration (/settings)
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── AlertBanner.tsx      # Dashboard alert display
│   ├── BaleQAWidget.tsx     # Quality assessment form
│   ├── KpiCards.tsx         # Dashboard KPI cards
│   ├── Navigation.tsx       # Top navigation bar
│   ├── PyramidGrid.tsx      # 3D pyramid visualization
│   ├── RoleGate.tsx         # Access control wrapper
│   ├── StateMachineStepper.tsx  # Truck workflow stepper
│   └── TruckCheckInForm.tsx     # Check-in form
├── lib/
│   ├── types.ts             # TypeScript type definitions
│   ├── store.ts             # Zustand global state
│   ├── logic.ts             # Business logic functions
│   ├── selectors.ts         # Data selectors/queries
│   ├── time.ts              # Date/time utilities
│   ├── csv.ts               # CSV export utilities
│   ├── seed.ts              # Demo data generation
│   ├── mock-settings-data.ts  # Settings page mock data
│   └── utils.ts             # General utilities
└── hooks/
    ├── use-role-permissions.ts  # Permission hooks
    └── use-toast.ts             # Toast notification hook
```

### State Management Architecture

The application uses **Zustand** with **Immer** middleware for clean, immutable state updates. State is persisted to localStorage for demo purposes.

**Core State Entities:**
- `trucks[]` - Truck load records
- `bales[]` - Individual bale records with QA results
- `pyramids[]` - Storage pyramid configurations
- `slots[]` - XYZ storage slot occupancy
- `suppliers[]` - Supplier information and scorecards
- `alerts[]` - System alerts and notifications
- `events[]` - Audit trail events
- `consumptionBatches[]` - Processing batch records
- `config` - System configuration (thresholds, usage rates)
- `session` - User session (role, operator ID)

### Data Flow

```
User Action → Component Handler → Store Action → State Update → UI Re-render
                                        ↓
                                  Side Effects:
                                  - Event logging
                                  - Alert generation
                                  - Slot updates
```

---

## Feature Implementation Status

### ✅ Fully Implemented Features

#### 1. Truck Check-In Workflow
- **Location:** `/check-in`, `/trucks/[id]`
- **Features:**
  - Driver card ID capture
  - Manual metadata entry (supplier, lot, source, bale type)
  - Gross weight capture
  - Per-bale QA loop with moisture and weight measurement
  - Automated pass/fail classification against configurable thresholds
  - Batch reject mechanism on first failure
  - Pyramid placement dialog with visual selection
  - Tare weight capture
  - Truck record closure with batch decision
  - State machine visualization (CHECK_IN → GROSS_IN → UNLOAD_LOOP → TARE_OUT → CLOSE)

#### 2. Pyramid Storage Management
- **Location:** `/pyramids`, `/pyramids/[id]`
- **Features:**
  - Grid-based list view with occupancy percentages
  - Interactive 3D layer-by-layer visualization
  - XYZ coordinate tracking for each bale
  - Quality grade zoning (Grade A and Grade B pyramids)
  - Slot availability checking
  - Bale placement with stability considerations
  - Detailed pyramid metrics (occupancy, avg moisture, avg weight)
  - Clickable bale cells with tooltip and detail dialog
  - CSV export of pyramid contents
  - Recent activity log

#### 3. Processing & Consumption
- **Location:** `/processing`
- **Features:**
  - Available bale inventory by grade
  - FEFO (First Expired First Out) auto-selection
  - Manual bale selection with checkbox interface
  - Processing line assignment (Line 1, 2, 3)
  - Batch creation with metadata (avg moisture, avg weight)
  - Active batch tracking
  - Batch completion workflow
  - Consumption history (last 10 completed batches)
  - Slot emptying on consumption

#### 4. Traceability
- **Location:** `/traceability`
- **Features:**
  - Multi-modal search (Bale ID, Truck ID, Supplier, Lot/PO)
  - Query performance tracking (target: <30s)
  - End-to-end chain visualization
  - Supplier → Truck → Bale QA → Storage → Processing flow
  - Detailed information cards for each step
  - Batch-level traceability (multiple bales in one query)
  - Visual workflow indicators

#### 5. Supplier Management
- **Location:** `/suppliers`
- **Features:**
  - Supplier scorecards with KPIs
  - Auto-tiering (Tier 1/2/3) based on:
    - Fail rate < 2% and avg moisture ≤14% → Tier 1
    - Fail rate > 8% → Tier 3
    - All others → Tier 2
  - Fail rate percentage tracking
  - Average moisture percentage
  - Variance calculation
  - Volume tracking (total bales)
  - Visual tier color coding

#### 6. Alerts & Notifications
- **Location:** `/alerts`
- **Features:**
  - Active alerts display with severity levels (info, warn, critical)
  - Alert clearing functionality (role-restricted)
  - Cleared alerts history
  - Alert type categorization (Reload, Quality, Equipment)
  - Dashboard banner for critical alerts
  - Real-time alert count in navigation

#### 7. Reports & Data Export
- **Location:** `/reports`
- **Features:**
  - CSV export for bales (all fields)
  - CSV export for trucks (full load details)
  - CSV export for suppliers (scorecards)
  - One-click export with automatic timestamp
  - Export count display

#### 8. Settings & Configuration
- **Location:** `/settings`
- **Features:**
  - **Profile:** User information display with role switching (demo)
  - **Notifications:** Email/SMS/Push preferences, alert type filtering
  - **Appearance:** Theme (light/dark/system), color schemes, display density, font size
  - **Localization:** Language, timezone, date/time format, currency
  - **System:** Quality thresholds (accept/reject %), batch reject toggle, reload threshold
  - **Reload Management:** Daily usage by grade, days-cover calculation
  - **Pyramid Configuration:** Default dimensions (X, Y, Z)
  - **Data Management:** Backup interface, export functionality, backup history, scheduled reports
  - **Audit Log:** System activity tracking with timestamp, user, action, module
  - **Active Sessions:** User session monitoring, device tracking
  - **System Metrics:** CPU/memory/disk usage, DB connections, uptime
  - **Integrations:** External system connection management
  - **Demo Reset:** Full data reset with seed data regeneration

#### 9. Dashboard & Analytics
- **Location:** `/` (homepage)
- **Features:**
  - Real-time KPI cards (on-hand by grade, days cover, throughput, fail rate)
  - Moisture distribution chart (bar chart, last 50 bales)
  - Hourly throughput chart (line chart, last 24 hours)
  - Supplier tier distribution (pie chart)
  - Recent events feed (last 5 alerts)
  - Alert banner for critical notifications

#### 10. Role-Based Access Control
- **Roles:** Admin, Supervisor, Operator, Viewer
- **Features:**
  - Route-level access control via RoleGate component
  - Navigation menu filtering by role
  - Permission-based action restrictions (e.g., alert clearing)
  - Demo role switching in navigation

---

### ⚠️ Partially Implemented / UI-Only Features

These features have UI components but lack backend/hardware integration:

#### 1. Microwave Sensor Integration
- **Status:** Manual entry only
- **Missing:** Real-time sensor data acquisition, auto temp normalization, fault detection

#### 2. Weighbridge Integration
- **Status:** Manual weight entry
- **Missing:** Automatic import from weighbridge, weight delta reconciliation

#### 3. Golden Bale Calibration
- **Status:** Not implemented
- **Missing:** Shift-start verification workflow, drift tracking UI, out-of-bounds alarms

#### 4. Fallback Probe Station
- **Status:** Not implemented
- **Missing:** Penetrating probe workflow, temperature compensation, manual logging

#### 5. Equipment Monitoring
- **Status:** Mock data in settings
- **Missing:** Real-time sensor health, maintenance schedule tracking, calibration management

#### 6. Reload Forecasting Alerts
- **Status:** Days-cover calculation exists
- **Missing:** Proactive alert generation, threshold breach detection, notification delivery

#### 7. ERP/MES Integration
- **Status:** Not implemented
- **Missing:** API posting of receipts, inventory updates, consumption confirmations

---

### ❌ Not Implemented Features

#### 1. Safety & Interlocks
- E-stop integration
- Light curtain monitoring
- Safety zone status displays
- Motion inhibit controls
- LOTO procedure tracking

#### 2. Reject Bay Management
- Dedicated reject storage UI
- Reject bay capacity tracking
- Reject bale routing workflow

#### 3. Advanced Exception Handling
- Sensor fault recovery workflows
- Uncertain read retry mechanisms
- Scale fault diagnostics
- Path blocked resolution guides

#### 4. Performance Monitoring
- 60 bales/hour target tracking
- Cycle time (≤60s) monitoring
- Weighbridge time (≤5 min) tracking
- Buffer capacity indicators

#### 5. Crane Operations
- Real-time crane position display
- Crane path visualization
- Interlocked transfer status
- Crane utilization metrics

#### 6. Mobile Interface
- Touch-optimized mobile views
- Barcode scanner integration
- Offline mode with sync queue

#### 7. Advanced Analytics
- Predictive maintenance
- AI-driven quality predictions
- Seasonal trend analysis
- Cost optimization recommendations

---

## User Workflows

### Workflow 1: Truck Arrival to Bale Storage

**Actors:** Weighbridge Clerk, Operator

**Steps:**

1. **Pre-Arrival**
   - Operator logs into system
   - Verifies that pyramids have available capacity
   - Checks system health on dashboard

2. **Check-In** (`/check-in`)
   - Clerk scans driver card (or enters driver ID)
   - Operator selects supplier from dropdown
   - Enters lot/PO number
   - Enters source location
   - Selects bale type (Midi, Legacy70, Legacy130)
   - Adds optional notes
   - Clicks "Check In Truck"
   - System creates truck record and navigates to `/trucks/[id]`

3. **Gross Weighing** (`/trucks/[id]`)
   - State machine shows "Gross Weight" step active
   - Clerk enters gross weight from weighbridge
   - Clicks "Advance to Next Step"
   - System transitions to "UNLOAD_LOOP" state

4. **Per-Bale QA Loop**
   - Crane operator lifts bale
   - Operator enters moisture % and weight (kg) in Bale QA Widget
   - Clicks "Record Bale"
   - System classifies bale:
     - **If Pass (≤14% moisture):**
       - Opens "Place Bale to Pyramid" dialog
       - Operator selects appropriate grade pyramid
       - Clicks "Place Bale"
       - System finds next available XYZ slot
       - Bale appears in "Recent Bales" sidebar (green)
       - Loop continues for next bale
     - **If Fail (>14% moisture):**
       - System marks bale as failed (red in sidebar)
       - If batch reject enabled: truck state changes to "BATCH_REJECT"
       - Critical alert generated
       - Operator must choose: "Reload to Truck" or "Route to Reject Bay"
       - Cannot continue QA loop if batch rejected

5. **Unload Completion**
   - When all bales processed, operator clicks "Advance to Next Step"
   - System transitions to "TARE_OUT" state

6. **Tare Weighing**
   - Clerk enters tare weight
   - Clicks "Advance to Next Step"
   - System:
     - Records out time
     - Sets batch decision (Accepted or Rejected)
     - Closes truck record
     - Redirects to `/trucks` list

**Success Criteria:**
- All bales placed in appropriate pyramids
- Truck record closed with batch decision
- Events logged for audit trail

---

### Workflow 2: Selecting Bales for Processing

**Actors:** Operator, Processing Line Supervisor

**Steps:**

1. **Navigate to Processing** (`/processing`)
   - View available bales by grade (Grade A and Grade B counts)
   - View active batches currently processing
   - View recent completed batches

2. **Initiate Batch Creation**
   - Click "Select for Processing" on desired grade (A or B)
   - "Select Bales for Processing" dialog opens

3. **Configure Batch**
   - Select processing line (Line 1, 2, or 3)
   - Enter desired batch quantity (default: 10)

4. **Select Bales (FEFO Method)**
   - **Option A: Auto-Select**
     - Click "Auto-Select FEFO" button
     - System selects oldest bales up to quantity limit
     - Selected bales highlighted in blue
   - **Option B: Manual Selection**
     - Check individual bales in table
     - Table shows: Bale ID, Pyramid, Position (X,Y,Z), Moisture %, Weight, Age (days)
     - Bales sorted by age (oldest first)

5. **Create Batch**
   - Click "Create Batch (N)" button
   - System:
     - Generates unique batch ID (BATCH + timestamp)
     - Calculates average moisture and weight
     - Marks slots as emptied (emptiedTs set)
     - Creates consumption batch record
     - Logs event in audit trail
   - Dialog closes, batch appears in "Active Batches" section

6. **Monitor Processing**
   - Active batch shows:
     - Batch ID
     - Processing line
     - Bale count
     - Average moisture
     - Start timestamp

7. **Complete Batch**
   - When processing finishes, click "Complete" button
   - System:
     - Sets end timestamp
     - Moves batch to "Recent Completed Batches"
     - Logs completion event

**Success Criteria:**
- FEFO selection ensures oldest bales consumed first
- Batch metadata accurately captured
- Inventory updated (slots marked empty)
- Processing line tracking maintained

---

### Workflow 3: Tracing a Bale

**Actors:** Quality Manager, Compliance Officer

**Steps:**

1. **Navigate to Traceability** (`/traceability`)

2. **Select Search Type**
   - Click one of four search type buttons:
     - **Bale ID:** Direct bale lookup
     - **Truck ID:** All bales from a truck
     - **Supplier:** All bales from a supplier
     - **Lot/PO:** All bales in a purchase order

3. **Enter Search Term**
   - Type identifier in search box
   - Press Enter or click "Search" button
   - System displays query time (target: <30s)

4. **Review Traceability Chain** (Bale ID search)
   - **Visual Flow Diagram** shows:
     - Supplier → Truck → Bale QA → Storage → Processing
     - Each stage with icon and label
   - **Supplier Information Card:**
     - Supplier name and ID
     - Tier badge (Tier 1/2/3 with color)
     - Score
   - **Truck Information Card:**
     - Truck ID, Lot/PO, Source
     - Arrival timestamp
     - Batch decision badge
   - **Bale Details Card:**
     - Bale ID, Type, Species
     - Moisture % and Weight
     - QA decision badge
     - Timestamp
   - **Storage Location Card:**
     - Pyramid ID, Quality Grade, Zone
     - XYZ coordinates
     - Status badge
   - **Consumption Information Card** (if consumed):
     - Batch ID, Processing Line
     - Start/end timestamps
     - Total bales in batch

5. **Bulk Search Results** (Truck/Supplier/Lot search)
   - **Summary Card** shows:
     - Total bales count
     - Passed QA count
     - Failed QA count
   - **Bales List** (scrollable):
     - All bales with ID, moisture, weight, pyramid
     - Pass/Fail badge for each
     - Filterable and sortable

**Success Criteria:**
- Query completes in <30 seconds
- Complete chain visible for any bale
- All metadata accurate and timestamped
- Easy to identify quality issues

---

## Data Models

### Type Definitions (from `lib/types.ts`)

```typescript
// User & Session
type UserRole = "Admin" | "Supervisor" | "Operator" | "Viewer";

type Session = {
  currentRole: UserRole;
  operatorId: string;
};

// Bale Types
type BaleType = "Midi" | "Legacy70" | "Legacy130";
type Species = "Straw";
type BaleDecision = "Pass" | "Fail";

type Bale = {
  baleId: string;              // Unique identifier
  truckId: string;             // Reference to truck
  baleType: BaleType;          // Physical bale type
  species: Species;            // Material type
  moisturePct: number;         // Moisture percentage (0-100)
  weightKg: number;            // Weight in kilograms
  density?: number;            // Calculated density (kg/m³)
  decision: BaleDecision;      // QA result
  operatorId?: string;         // Operator who processed
  ts: string;                  // ISO timestamp
  pyramidId?: string;          // Storage location
  slot?: { x: number; y: number; z: number; };  // Exact position
};

// Truck Management
type TruckStatus =
  | "WAIT_TRUCK"
  | "CHECK_IN"
  | "GROSS_IN"
  | "UNLOAD_LOOP"
  | "BATCH_REJECT"
  | "TARE_OUT"
  | "CLOSE_TRUCK_RECORD";

type BatchDecision = "Accepted" | "Rejected";

type TruckLoad = {
  truckId: string;             // Unique identifier
  driverCardId?: string;       // Driver identification
  supplierId: string;          // Reference to supplier
  lot: string;                 // Purchase order / lot number
  source: string;              // Origin location
  baleType: BaleType;          // Bale type for this truck
  inTime: string;              // Check-in timestamp
  outTime?: string;            // Check-out timestamp
  gross?: number;              // Gross weight (kg)
  tare?: number;               // Tare weight (kg)
  baleCount: number;           // Number of bales processed
  batchDecision?: BatchDecision; // Overall truck decision
  notes?: string;              // Operator notes
  status: TruckStatus;         // Current workflow state
};

// Pyramid Storage
type QualityGrade = "A" | "B";
type PyramidStatus = "Active" | "Locked";

type Pyramid = {
  pyramidId: string;           // Unique identifier
  qualityGrade: QualityGrade;  // Storage grade classification
  zone: string;                // Physical zone location
  x0: number;                  // Base X coordinate
  y0: number;                  // Base Y coordinate
  z0: number;                  // Base Z coordinate
  capacity: number;            // Total bale capacity
  status: PyramidStatus;       // Active or maintenance
  shape: { x: number; y: number; z: number; }; // Dimensions
};

type Slot = {
  slotId: string;              // Pyramid-X-Y-Z format
  pyramidId: string;           // Reference to pyramid
  x: number;                   // X position (0-based)
  y: number;                   // Y position (0-based)
  z: number;                   // Z layer (0-based)
  baleId?: string;             // Occupying bale (if any)
  placedTs?: string;           // Placement timestamp
  emptiedTs?: string;          // Removal timestamp
};

// Consumption & Processing
type ConsumptionBatch = {
  batchId: string;             // Unique identifier
  line: string;                // Processing line (Line-1, Line-2, Line-3)
  startTs: string;             // Batch start timestamp
  endTs?: string;              // Batch end timestamp
  baleIds: string[];           // Array of consumed bale IDs
  averageMoisture?: number;    // Average moisture of batch
  avgWeightKg?: number;        // Average weight of batch
};

// Supplier Management
type SupplierTier = 1 | 2 | 3;

type Supplier = {
  supplierId: string;          // Unique identifier
  name: string;                // Supplier name
  contacts?: string;           // Contact information
  tier: SupplierTier;          // Quality tier (1=best, 3=worst)
  score: number;               // Overall score (0-100)
  kpi: {
    failRatePct: number;       // Percentage of failed bales
    avgMoisturePct: number;    // Average moisture
    variance: number;          // Moisture variance
  };
  tierOverride?: SupplierTier; // Manual tier override
};

// Alerts & Events
type AlertType = "Reload" | "Quality" | "Equipment";
type AlertSeverity = "info" | "warn" | "critical";

type Alert = {
  alertId: string;             // Unique identifier
  type: AlertType;             // Alert category
  severity: AlertSeverity;     // Severity level
  message: string;             // Human-readable message
  createdAt: string;           // Creation timestamp
  clearedAt?: string;          // Cleared timestamp
  meta?: Record<string, any>;  // Additional metadata
};

type EventScope = "Truck" | "Bale" | "System";

type Event = {
  eventId: string;             // Unique identifier
  scope: EventScope;           // Event category
  actor: string;               // User who triggered
  change: string;              // Description of change
  ts: string;                  // Event timestamp
};

// Configuration
type Config = {
  speciesThresholds: Record<Species, {
    acceptPct: number;         // Acceptance threshold
    rejectPct: number;         // Rejection threshold
  }>;
  batchRejectEnabled: boolean; // Reject entire truck on first fail
  reloadThresholdDays: number; // Days before reload alert
  dailyUsageByGrade: Record<QualityGrade, number>; // Bales per day
  pyramidShape: { x: number; y: number; z: number; }; // Default dimensions
  timezone: "Asia/Kolkata";    // System timezone
};
```

### Entity Relationships

```
Supplier (1) ──── (N) TruckLoad
TruckLoad (1) ──── (N) Bale
Pyramid (1) ──── (N) Slot
Bale (1) ──── (1) Slot
ConsumptionBatch (1) ──── (N) Bale (via baleIds array)
```

---

## Business Logic & Rules

### Quality Classification

**Function:** `classifyBale(moisturePct, species, config)`

```typescript
if (moisturePct <= config.speciesThresholds[species].rejectPct) {
  return "Pass";
} else {
  return "Fail";
}
```

**Current Threshold:** Straw bales with moisture ≤14% pass, >14% fail

### Density Calculation

**Function:** `computeDensity(weightKg, baleType)`

```typescript
const volumeMap = {
  Midi: 0.5 m³,
  Legacy70: 0.7 m³,
  Legacy130: 1.3 m³,
};
density = weightKg / volume;
```

### Supplier Tiering

**Function:** `supplierTiering(failRatePct, avgMoisturePct, acceptPct)`

```typescript
if (failRatePct < 2% && avgMoisturePct <= acceptPct) {
  return Tier 1;  // Premium supplier
} else if (failRatePct > 8%) {
  return Tier 3;  // Problem supplier
} else {
  return Tier 2;  // Standard supplier
}
```

### Days Cover Calculation

**Function:** `computeDaysCover(onHand, dailyUsage)`

```typescript
if (dailyUsage === 0) return 999;
return Math.floor(onHand / dailyUsage);
```

**Example:** 240 bales on hand, 80 bales/day usage = 3 days cover

### FEFO Selection Logic

Bales are sorted by timestamp (oldest first), then filtered by:
1. Quality grade match (A or B)
2. Pass decision
3. Not yet consumed (no emptiedTs on slot)
4. Located in active pyramid

### Batch Reject Logic

When `config.batchRejectEnabled === true`:
- On first bale failure, entire truck is marked "BATCH_REJECT"
- No further bales can be processed from that truck
- Operator must choose remediation action
- All bales from truck are treated as rejected

---

## Role-Based Access Control

### Permission Matrix

| Feature | Admin | Supervisor | Operator | Viewer |
|---------|-------|------------|----------|--------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Check-In | ✅ | ✅ | ✅ | ❌ |
| Trucks | ✅ | ✅ | ✅ | ❌ |
| Pyramids (View) | ✅ | ✅ | ✅ | ✅ |
| Processing | ✅ | ✅ | ✅ | ❌ |
| Traceability | ✅ | ✅ | ✅ | ✅ |
| Suppliers | ✅ | ✅ | ❌ | ❌ |
| Alerts (View) | ✅ | ✅ | ✅ | ✅ |
| Alerts (Clear) | ✅ | ✅ | ✅ | ❌ |
| Reports | ✅ | ✅ | ❌ | ❌ |
| Settings (View) | ✅ | ✅ | ❌ | ❌ |
| Settings (Edit) | ✅ | ✅ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ |

### Implementation

**RoleGate Component:**
```tsx
<RoleGate allowedRoles={["Admin", "Supervisor", "Operator"]}>
  <RestrictedContent />
</RoleGate>
```

**Permission Hook:**
```typescript
const { canClearAlerts } = useRolePermissions();

if (!canClearAlerts()) {
  toast.error("Insufficient permissions");
  return;
}
```

---

## Configuration Management

### System Configuration (`config` state)

**Quality Thresholds:**
- Accept/Reject percentages per species
- Configurable in Settings > System tab
- Default: Straw ≤14% accept, >14% reject

**Batch Reject:**
- Toggle to enable/disable truck-level batch rejection
- When enabled, first bale failure rejects entire truck
- Default: Enabled

**Reload Management:**
- Reload threshold in days (alerts when days-cover falls below)
- Daily usage by grade (A and B) in bales/day
- Default: 3 days threshold, 80 bales/day (A), 40 bales/day (B)

**Pyramid Defaults:**
- Default pyramid dimensions (X, Y, Z)
- Applied when creating new pyramids
- Default: 8×8×5 (320 bale capacity)

**Timezone:**
- System timezone for all timestamps
- Default: Asia/Kolkata

### Session Configuration (`session` state)

**Current Role:**
- User's active role (Admin, Supervisor, Operator, Viewer)
- Switchable in demo via navigation dropdown
- Controls access to features and actions

**Operator ID:**
- Identifier for current operator
- Logged with all actions (bale QA, placement, etc.)
- Default: OP001

---

## Data Persistence & Demo Mode

### Current Implementation

**Storage:** Zustand with localStorage persistence
- All state automatically saved to browser localStorage
- Key: `bale-management-storage`
- Version: 1
- Data survives page refreshes

**Demo Data Generation:**
- `generateSeedData()` creates realistic sample data:
  - 5 suppliers with varied tier levels
  - 20 trucks with mixed batch decisions
  - 200+ bales with realistic moisture distributions
  - 6 pyramids (3 Grade A, 3 Grade B)
  - Alerts, events, and consumption batches
- Auto-loads on first visit (empty state)
- Manual reset available in Settings > System

**Data Reset:**
- Settings > System > "Reset Demo Data" button
- Clears all data and regenerates seed data
- Confirmation dialog prevents accidental resets

### Production Database Strategy

**Future Implementation:** Supabase PostgreSQL database

**Migration Path:**
1. Create database schema matching current types
2. Implement Supabase client in `lib/supabase.ts`
3. Replace Zustand actions with API calls
4. Add loading/error states to components
5. Implement real-time subscriptions for live updates
6. Add Row Level Security (RLS) policies

**Schema Tables:**
- `truck_load` - Truck records
- `bale` - Bale records
- `pyramid` - Pyramid configurations
- `slot` - Storage slots
- `supplier` - Supplier information
- `consumption_batch` + `consumption_batch_bales` - Consumption tracking
- `alert` - System alerts
- `event` - Audit trail
- `config` - System configuration (single row)

---

## Integration Points (Future)

### ERP/MES Integration

**Outbound Data:**
- Truck receipts (truckId, supplier, lot, bale count, gross, tare)
- Inventory updates (pyramid occupancy, XYZ coordinates)
- Consumption batch confirmations (batchId, line, bale IDs, timestamps)

**Inbound Data:**
- Inbound truck schedules
- Purchase order details
- Supplier master data updates

**Protocol:** REST API or message queue (e.g., RabbitMQ)

### Weighbridge Integration

**Automatic Weight Capture:**
- Replace manual input with API call to weighbridge controller
- Capture gross on check-in
- Capture tare on departure
- Reconcile weight delta with bale count

**Protocol:** Serial/RS-232, Modbus, or proprietary weighbridge API

### Microwave Sensor Integration

**Real-Time Moisture Readings:**
- Crane-mounted sensor streams moisture data
- Temperature normalization applied automatically
- Readings displayed in real-time on QA widget
- Operator confirms or overrides reading

**Sensor Fault Handling:**
- Auto-detect sensor failures
- Fallback to manual probe station
- Log all sensor events

**Protocol:** Industrial fieldbus (Profibus, Modbus TCP) or OPC UA

### Notification Services

**Alert Delivery:**
- Email notifications for critical alerts
- SMS for reload advisories
- Webhook for integration with SCADA/MES

**Configuration:**
- Recipient lists per alert type
- Delivery method preferences
- Escalation rules

**Protocol:** SMTP (email), Twilio (SMS), HTTP POST (webhooks)

---

## Testing Strategy

### Component Testing

**Manual Testing Checklist:**

**Truck Workflow:**
- [ ] Check-in form validation
- [ ] Gross weight capture
- [ ] Bale QA pass scenario
- [ ] Bale QA fail scenario (batch reject)
- [ ] Pyramid placement dialog
- [ ] Tare weight capture
- [ ] Truck record closure

**Pyramid Management:**
- [ ] Pyramid list display
- [ ] 3D layer navigation
- [ ] Bale click interaction
- [ ] Detail dialog display
- [ ] CSV export

**Processing:**
- [ ] Available bale counts
- [ ] FEFO auto-selection
- [ ] Manual bale selection
- [ ] Batch creation
- [ ] Batch completion

**Traceability:**
- [ ] Bale ID search
- [ ] Truck ID search
- [ ] Supplier search
- [ ] Lot search
- [ ] Query time display
- [ ] Chain visualization

**Settings:**
- [ ] Threshold updates
- [ ] Batch reject toggle
- [ ] Demo data reset
- [ ] Role switching

### Performance Testing

**Targets:**
- Page load time: <2 seconds
- Traceability query: <30 seconds
- Dashboard refresh: <1 second
- Pyramid 3D render: <2 seconds

**Load Testing:**
- 1000+ bales in state
- 50+ trucks
- 10+ pyramids
- Verify UI responsiveness

### Browser Compatibility

**Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile Responsiveness:**
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- Touch-friendly controls
- Responsive navigation

---

## Deployment Guide

### Prerequisites

**System Requirements:**
- Node.js 18.x or later
- npm 9.x or later
- Modern web browser

**Environment Setup:**
1. Clone repository
2. Install dependencies: `npm install`
3. Configure environment variables (if applicable)

### Development Mode

```bash
npm run dev
```

- Runs on http://localhost:3000
- Hot module reloading enabled
- Source maps for debugging

### Production Build

```bash
npm run build
npm run start
```

- Optimized production bundle
- Static assets pre-rendered
- Runs on http://localhost:3000 by default

### Deployment Options

**Option 1: Vercel (Recommended)**
- Connect GitHub repository to Vercel
- Automatic deployments on push
- Edge network CDN
- Zero configuration required

**Option 2: Self-Hosted**
- Build production bundle: `npm run build`
- Serve `.next` folder with Node.js server
- Use PM2 or systemd for process management
- Reverse proxy with nginx

**Option 3: Docker**
- Create Dockerfile with Node.js base image
- COPY package files and install dependencies
- Build application
- EXPOSE port 3000
- CMD ["npm", "start"]

### Environment Variables

**For Production:**
- `NEXT_PUBLIC_APP_URL` - Application base URL
- `NEXT_PUBLIC_API_URL` - Backend API URL (when implemented)

**For Supabase Integration (Future):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

---

## Troubleshooting

### Common Issues

**Issue:** "Hydration mismatch" error
- **Cause:** Server-rendered HTML doesn't match client
- **Solution:** Ensure no browser-only APIs used during SSR; add "use client" directive

**Issue:** State resets on page refresh
- **Cause:** localStorage persistence not working
- **Solution:** Check browser privacy settings; verify storage quota

**Issue:** Pyramids not loading bales
- **Cause:** Bale pyramidId doesn't match pyramid
- **Solution:** Verify bale placement logic; check slot assignment

**Issue:** Traceability query returns "Not Found"
- **Cause:** Search term doesn't match any records
- **Solution:** Ensure exact match or use includes(); check for leading/trailing spaces

**Issue:** Permissions error on action
- **Cause:** Current role doesn't have required permission
- **Solution:** Switch to appropriate role in navigation; verify RoleGate configuration

---

## Roadmap

### Phase 2: Backend Integration (Q1 2026)

- [ ] Migrate to Supabase PostgreSQL
- [ ] Implement REST API layer
- [ ] Add authentication & real users
- [ ] Real-time data synchronization
- [ ] Multi-tenant support

### Phase 3: Hardware Integration (Q2 2026)

- [ ] Microwave sensor integration
- [ ] Weighbridge automatic capture
- [ ] Golden bale calibration system
- [ ] Fallback probe station
- [ ] Safety interlock monitoring

### Phase 4: Advanced Features (Q3 2026)

- [ ] Equipment monitoring dashboard
- [ ] Predictive maintenance alerts
- [ ] AI-driven quality predictions
- [ ] Mobile operator interface
- [ ] Offline mode with sync

### Phase 5: Analytics & Optimization (Q4 2026)

- [ ] Advanced reporting engine
- [ ] Custom dashboard builder
- [ ] Cost optimization recommendations
- [ ] Seasonal trend analysis
- [ ] Performance benchmarking

---

## Support & Maintenance

### Known Limitations

1. **Demo Data Only:** No persistent database; data resets on localStorage clear
2. **Manual Entry:** Sensor and weighbridge data entered manually
3. **No Authentication:** Single-user demo mode; role switching without login
4. **No Real-Time:** No WebSocket or SSE for live updates
5. **Browser-Based:** No native mobile apps; mobile web only

### Contact Information

**For Technical Support:**
- Email: support@balemanagement.example.com
- Phone: +1-XXX-XXX-XXXX
- Hours: 24/7 for critical issues

**For Feature Requests:**
- GitHub Issues: github.com/org/bale-management/issues
- Email: features@balemanagement.example.com

**For Training:**
- Online Documentation: docs.balemanagement.example.com
- Video Tutorials: youtube.com/balemanagement
- On-Site Training: Contact sales team

---

## Appendix

### Glossary

- **Bale:** Compressed rectangular bundle of straw or other material
- **FEFO:** First Expired First Out - inventory rotation method prioritizing oldest stock
- **Pyramid:** Multi-dimensional storage structure for bales with XYZ coordinates
- **QA:** Quality Assurance - inspection and testing process
- **Batch Reject:** Decision to reject all bales from a truck based on quality failure
- **Tier:** Supplier quality classification (1=best, 3=worst)
- **Days Cover:** Number of days current inventory will last at current consumption rate
- **Moisture %:** Percentage of water content in bale material
- **Traceability:** Ability to track and trace product through supply chain

### Keyboard Shortcuts

**Global:**
- `/` - Focus search (where applicable)
- `Esc` - Close dialogs
- `Enter` - Submit forms

**Navigation:**
- `Alt+1` - Dashboard
- `Alt+2` - Check-In
- `Alt+3` - Trucks
- `Alt+4` - Pyramids
- `Alt+5` - Processing

### Data Backup

**Export All Data:**
1. Navigate to Settings > Data tab
2. Click "Export Data" button
3. Save JSON file to secure location
4. File includes all trucks, bales, pyramids, suppliers, alerts

**Restore Data:**
1. Clear localStorage
2. Import JSON file
3. Use browser dev tools to set localStorage item:
   ```javascript
   localStorage.setItem('bale-management-storage', jsonString);
   ```
4. Refresh page

---

## Change Log

### Version 1.0 (October 28, 2025)

**Initial Release:**
- Complete truck check-in and QA workflow
- Pyramid storage management with 3D visualization
- Processing and consumption tracking
- End-to-end traceability
- Supplier management and scorecarding
- Alert system
- Comprehensive settings interface
- Role-based access control
- Data export functionality

**Known Issues:**
- None

---

**Document Version:** 1.0
**Last Updated:** October 28, 2025
**Next Review:** January 1, 2026
