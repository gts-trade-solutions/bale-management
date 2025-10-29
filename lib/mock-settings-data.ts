export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  lastLogin: string;
  department: string;
  phone: string;
  joinedDate: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  alertTypes: {
    reload: boolean;
    quality: boolean;
    equipment: boolean;
    system: boolean;
  };
  frequency: "realtime" | "hourly" | "daily";
}

export interface AppearanceSettings {
  theme: "light" | "dark" | "system";
  colorScheme: "default" | "blue" | "green" | "orange";
  displayDensity: "comfortable" | "compact" | "spacious";
  fontSize: "small" | "medium" | "large";
}

export interface LocalizationSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  numberFormat: string;
  currency: string;
}

export interface AuditLogEntry {
  logId: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
}

export interface BackupRecord {
  backupId: string;
  timestamp: string;
  size: string;
  type: "manual" | "scheduled";
  status: "completed" | "in_progress" | "failed";
  location: string;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  dbConnections: number;
  uptime: string;
  lastRestart: string;
}

export interface ActiveSession {
  sessionId: string;
  userId: string;
  userName: string;
  role: string;
  loginTime: string;
  lastActivity: string;
  ipAddress: string;
  device: string;
}

export interface IntegrationConfig {
  integrationId: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "error";
  lastSync: string;
  endpoint: string;
}

export const mockUserProfile: UserProfile = {
  userId: "USR001",
  name: "John Doe",
  email: "john.doe@example.com",
  role: "Admin",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  department: "Operations",
  phone: "+91-9876543210",
  joinedDate: "2023-01-15T00:00:00Z",
};

export const mockNotificationPreferences: NotificationPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  alertTypes: {
    reload: true,
    quality: true,
    equipment: true,
    system: false,
  },
  frequency: "realtime",
};

export const mockAppearanceSettings: AppearanceSettings = {
  theme: "light",
  colorScheme: "default",
  displayDensity: "comfortable",
  fontSize: "medium",
};

export const mockLocalizationSettings: LocalizationSettings = {
  language: "English (US)",
  timezone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  numberFormat: "1,234.56",
  currency: "INR",
};

export const mockAuditLogs: AuditLogEntry[] = [
  {
    logId: "LOG001",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    user: "John Doe (Admin)",
    action: "Updated Configuration",
    module: "Settings",
    details: "Modified quality thresholds for Straw",
    ipAddress: "192.168.1.100",
  },
  {
    logId: "LOG002",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: "Jane Smith (Supervisor)",
    action: "Truck Check-In",
    module: "Truck Management",
    details: "Checked in truck TRK001 from supplier SUP001",
    ipAddress: "192.168.1.101",
  },
  {
    logId: "LOG003",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    user: "Bob Wilson (Operator)",
    action: "Bale Placement",
    module: "Pyramid Management",
    details: "Placed 25 bales in pyramid PYR-A1",
    ipAddress: "192.168.1.102",
  },
  {
    logId: "LOG004",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    user: "System",
    action: "Alert Generated",
    module: "Alerts",
    details: "Grade A inventory low - 2 days cover remaining",
    ipAddress: "127.0.0.1",
  },
  {
    logId: "LOG005",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    user: "John Doe (Admin)",
    action: "User Role Changed",
    module: "User Management",
    details: "Changed role from Operator to Supervisor for Alice Brown",
    ipAddress: "192.168.1.100",
  },
  {
    logId: "LOG006",
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    user: "Jane Smith (Supervisor)",
    action: "Report Generated",
    module: "Reports",
    details: "Generated monthly quality report",
    ipAddress: "192.168.1.101",
  },
];

export const mockBackupRecords: BackupRecord[] = [
  {
    backupId: "BKP001",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    size: "2.4 GB",
    type: "scheduled",
    status: "completed",
    location: "/backups/2024-10-26.zip",
  },
  {
    backupId: "BKP002",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    size: "2.3 GB",
    type: "scheduled",
    status: "completed",
    location: "/backups/2024-10-25.zip",
  },
  {
    backupId: "BKP003",
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    size: "2.5 GB",
    type: "manual",
    status: "completed",
    location: "/backups/2024-10-24-manual.zip",
  },
  {
    backupId: "BKP004",
    timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    size: "2.2 GB",
    type: "scheduled",
    status: "completed",
    location: "/backups/2024-10-23.zip",
  },
];

export const mockSystemMetrics: SystemMetrics = {
  cpuUsage: 45,
  memoryUsage: 62,
  diskUsage: 38,
  dbConnections: 12,
  uptime: "15 days, 7 hours",
  lastRestart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
};

export const mockActiveSessions: ActiveSession[] = [
  {
    sessionId: "SES001",
    userId: "USR001",
    userName: "John Doe",
    role: "Admin",
    loginTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    ipAddress: "192.168.1.100",
    device: "Chrome on Windows",
  },
  {
    sessionId: "SES002",
    userId: "USR002",
    userName: "Jane Smith",
    role: "Supervisor",
    loginTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    ipAddress: "192.168.1.101",
    device: "Safari on macOS",
  },
  {
    sessionId: "SES003",
    userId: "USR003",
    userName: "Bob Wilson",
    role: "Operator",
    loginTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    ipAddress: "192.168.1.102",
    device: "Firefox on Linux",
  },
];

export const mockIntegrations: IntegrationConfig[] = [
  {
    integrationId: "INT001",
    name: "ERP System",
    type: "SAP",
    status: "active",
    lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    endpoint: "https://erp.example.com/api",
  },
  {
    integrationId: "INT002",
    name: "Weather Service",
    type: "API",
    status: "active",
    lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    endpoint: "https://weather.example.com/api",
  },
  {
    integrationId: "INT003",
    name: "Mobile App",
    type: "Mobile",
    status: "active",
    lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    endpoint: "wss://mobile.example.com",
  },
  {
    integrationId: "INT004",
    name: "Email Service",
    type: "SMTP",
    status: "inactive",
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    endpoint: "smtp.example.com:587",
  },
];

export interface ScheduledReport {
  reportId: string;
  name: string;
  type: string;
  frequency: string;
  recipients: string[];
  lastRun: string;
  nextRun: string;
  status: "active" | "paused";
}

export const mockScheduledReports: ScheduledReport[] = [
  {
    reportId: "REP001",
    name: "Daily Quality Report",
    type: "Quality Metrics",
    frequency: "Daily at 08:00",
    recipients: ["john.doe@example.com", "jane.smith@example.com"],
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    status: "active",
  },
  {
    reportId: "REP002",
    name: "Weekly Inventory Report",
    type: "Inventory",
    frequency: "Weekly on Monday",
    recipients: ["john.doe@example.com"],
    lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
  },
  {
    reportId: "REP003",
    name: "Monthly Supplier Performance",
    type: "Supplier Analysis",
    frequency: "Monthly on 1st",
    recipients: ["john.doe@example.com", "management@example.com"],
    lastRun: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
  },
];
