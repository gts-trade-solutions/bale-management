"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { generateSeedData } from "@/lib/seed";
import { RoleGate } from "@/components/RoleGate";
import { SupplierForm } from "@/components/SupplierForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import type { UserRole, Supplier, SupplierTier } from "@/lib/types";
import {
  User,
  Bell,
  Palette,
  Globe,
  Database,
  Shield,
  Activity,
  FileText,
  Settings as SettingsIcon,
  Download,
  Upload,
  History,
  Users,
  Plug,
  Info,
  Moon,
  Sun,
  Monitor,
  Mail,
  Smartphone,
  Clock,
  Calendar,
  Server,
  HardDrive,
  Cpu,
  Plus,
  Search,
  Pencil,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import {
  mockUserProfile,
  mockNotificationPreferences,
  mockAppearanceSettings,
  mockLocalizationSettings,
  mockAuditLogs,
  mockBackupRecords,
  mockSystemMetrics,
  mockActiveSessions,
  mockIntegrations,
  mockScheduledReports,
} from "@/lib/mock-settings-data";

export default function SettingsPage() {
  const config = useStore((state) => state.config);
  const session = useStore((state) => state.session);
  const suppliers = useStore((state) => state.suppliers);
  const addSupplier = useStore((state) => state.addSupplier);
  const updateSupplier = useStore((state) => state.updateSupplier);
  const updateConfig = useStore((state) => state.updateConfig);
  const updateSession = useStore((state) => state.updateSession);
  const resetAllData = useStore((state) => state.resetAllData);

  const [acceptPct, setAcceptPct] = useState(config.speciesThresholds.Straw.acceptPct);
  const [rejectPct, setRejectPct] = useState(config.speciesThresholds.Straw.rejectPct);
  const [batchReject, setBatchReject] = useState(config.batchRejectEnabled);
  const [reloadThreshold, setReloadThreshold] = useState(config.reloadThresholdDays);
  const [dailyUsageA, setDailyUsageA] = useState(config.dailyUsageByGrade.A);
  const [dailyUsageB, setDailyUsageB] = useState(config.dailyUsageByGrade.B);
  const [pyramidX, setPyramidX] = useState(config.pyramidShape.x);
  const [pyramidY, setPyramidY] = useState(config.pyramidShape.y);
  const [pyramidZ, setPyramidZ] = useState(config.pyramidShape.z);

  const [userProfile] = useState(mockUserProfile);
  const [notificationPrefs, setNotificationPrefs] = useState(mockNotificationPreferences);
  const [appearanceSettings, setAppearanceSettings] = useState(mockAppearanceSettings);
  const [localizationSettings, setLocalizationSettings] = useState(mockLocalizationSettings);
  const [auditLogs] = useState(mockAuditLogs);
  const [backupRecords] = useState(mockBackupRecords);
  const [systemMetrics] = useState(mockSystemMetrics);
  const [activeSessions] = useState(mockActiveSessions);
  const [integrations] = useState(mockIntegrations);
  const [scheduledReports] = useState(mockScheduledReports);

  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
    supplier.supplierId.toLowerCase().includes(supplierSearchTerm.toLowerCase())
  );

  const handleSave = () => {
    updateConfig({
      speciesThresholds: {
        Straw: { acceptPct, rejectPct },
      },
      batchRejectEnabled: batchReject,
      reloadThresholdDays: reloadThreshold,
      dailyUsageByGrade: { A: dailyUsageA, B: dailyUsageB },
      pyramidShape: { x: pyramidX, y: pyramidY, z: pyramidZ },
    });
    toast.success("Settings saved successfully");
  };

  const handleReset = () => {
    const seedData = generateSeedData();
    resetAllData(seedData);
    toast.success("Demo data reset successfully");
  };

  const handleRoleChange = (role: UserRole) => {
    updateSession({ currentRole: role });
    toast.success(`Role changed to ${role}`);
  };

  const handleBackup = () => {
    toast.success("Backup initiated successfully");
  };

  const handleExport = () => {
    toast.success("Data export started");
  };

  const handleAddSupplier = () => {
    setEditingSupplier(undefined);
    setIsSupplierDialogOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsSupplierDialogOpen(true);
  };

  const handleSupplierSubmit = (data: any) => {
    if (editingSupplier) {
      updateSupplier(editingSupplier.supplierId, {
        name: data.name,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        address: data.address,
        tier: Number(data.tier) as SupplierTier,
        status: data.status,
      });
      toast.success("Supplier updated successfully");
    } else {
      const newSupplier: Supplier = {
        supplierId: `SUP${Date.now()}`,
        name: data.name,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        address: data.address,
        tier: Number(data.tier) as SupplierTier,
        score: 0,
        kpi: { failRatePct: 0, avgMoisturePct: 0, variance: 0 },
        status: data.status,
        createdAt: new Date().toISOString(),
      };
      addSupplier(newSupplier);
      toast.success("Supplier added successfully");
    }
    setIsSupplierDialogOpen(false);
    setEditingSupplier(undefined);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    updateSupplier(supplierId, { status: "inactive" });
    toast.success("Supplier deactivated");
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and system configuration</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-10">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="localization" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Localization</span>
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Suppliers</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Data</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Audit</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Plug className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                  <AvatarFallback>{userProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{userProfile.name}</h3>
                  <p className="text-muted-foreground">{userProfile.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge>{userProfile.role}</Badge>
                    <Badge variant="outline">{userProfile.department}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>User ID</Label>
                  <Input value={userProfile.userId} disabled className="mt-2" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={userProfile.phone} disabled className="mt-2" />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input value={userProfile.department} disabled className="mt-2" />
                </div>
                <div>
                  <Label>Last Login</Label>
                  <Input
                    value={format(new Date(userProfile.lastLogin), "MMM d, yyyy HH:mm")}
                    disabled
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Joined Date</Label>
                  <Input
                    value={format(new Date(userProfile.joinedDate), "MMM d, yyyy")}
                    disabled
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Current Role (Demo)</Label>
                  <Select value={session.currentRole} onValueChange={handleRoleChange}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Supervisor">Supervisor</SelectItem>
                      <SelectItem value="Operator">Operator</SelectItem>
                      <SelectItem value="Viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationPrefs.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationPrefs({ ...notificationPrefs, emailNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive browser push notifications</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationPrefs.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationPrefs({ ...notificationPrefs, pushNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive notifications via SMS</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationPrefs.smsNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationPrefs({ ...notificationPrefs, smsNotifications: checked })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base">Alert Types</Label>
                <p className="text-sm text-muted-foreground mb-4">Choose which alerts you want to receive</p>
                <div className="space-y-3">
                  {Object.entries(notificationPrefs.alertTypes).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="capitalize">{key} Alerts</Label>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) =>
                          setNotificationPrefs({
                            ...notificationPrefs,
                            alertTypes: { ...notificationPrefs.alertTypes, [key]: checked },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label htmlFor="frequency">Notification Frequency</Label>
                <Select
                  value={notificationPrefs.frequency}
                  onValueChange={(value: any) =>
                    setNotificationPrefs({ ...notificationPrefs, frequency: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => toast.success("Notification preferences saved")}>
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize how the application looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {[
                    { value: "light", icon: Sun, label: "Light" },
                    { value: "dark", icon: Moon, label: "Dark" },
                    { value: "system", icon: Monitor, label: "System" },
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: value as any })}
                      className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-all ${
                        appearanceSettings.theme === value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="colorScheme">Color Scheme</Label>
                <Select
                  value={appearanceSettings.colorScheme}
                  onValueChange={(value: any) =>
                    setAppearanceSettings({ ...appearanceSettings, colorScheme: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="displayDensity">Display Density</Label>
                <Select
                  value={appearanceSettings.displayDensity}
                  onValueChange={(value: any) =>
                    setAppearanceSettings({ ...appearanceSettings, displayDensity: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fontSize">Font Size</Label>
                <Select
                  value={appearanceSettings.fontSize}
                  onValueChange={(value: any) =>
                    setAppearanceSettings({ ...appearanceSettings, fontSize: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => toast.success("Appearance settings saved")}>
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="localization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Localization Settings</CardTitle>
              <CardDescription>Configure language and regional preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={localizationSettings.language}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English (US)">English (US)</SelectItem>
                      <SelectItem value="English (UK)">English (UK)</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input value={localizationSettings.timezone} disabled className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={localizationSettings.dateFormat}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select value={localizationSettings.timeFormat}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 Hour</SelectItem>
                      <SelectItem value="24h">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="numberFormat">Number Format</Label>
                  <Input value={localizationSettings.numberFormat} disabled className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input value={localizationSettings.currency} disabled className="mt-2" />
                </div>
              </div>

              <Button onClick={() => toast.success("Localization settings saved")}>
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Supplier Management</CardTitle>
                  <CardDescription>Manage your suppliers and their information</CardDescription>
                </div>
                <Button onClick={handleAddSupplier}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search suppliers by name or ID..."
                    value={supplierSearchTerm}
                    onChange={(e) => setSupplierSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No suppliers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSuppliers.map((supplier) => (
                        <TableRow key={supplier.supplierId}>
                          <TableCell className="font-mono text-sm">
                            {supplier.supplierId}
                          </TableCell>
                          <TableCell className="font-medium">{supplier.name}</TableCell>
                          <TableCell>{supplier.contactPerson || "-"}</TableCell>
                          <TableCell>{supplier.phone || "-"}</TableCell>
                          <TableCell className="text-sm">{supplier.email || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Tier {supplier.tier}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={supplier.status === "active" ? "default" : "secondary"}>
                              {supplier.status || "active"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEditSupplier(supplier)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="icon" variant="ghost">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Deactivate Supplier?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will mark the supplier as inactive. They will not appear in check-in forms.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteSupplier(supplier.supplierId)}
                                    >
                                      Deactivate
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {filteredSuppliers.length} of {suppliers.length} suppliers
                </span>
                <span>
                  Active: {suppliers.filter((s) => s.status !== "inactive").length} | Inactive:{" "}
                  {suppliers.filter((s) => s.status === "inactive").length}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <RoleGate allowedRoles={["Admin", "Supervisor"]}>
            <Card>
              <CardHeader>
                <CardTitle>Quality Thresholds</CardTitle>
                <CardDescription>Configure quality control parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="acceptPct">Accept Threshold (Straw) %</Label>
                  <Input
                    id="acceptPct"
                    type="number"
                    step="0.1"
                    value={acceptPct}
                    onChange={(e) => setAcceptPct(Number(e.target.value))}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Bales at or below this moisture % are accepted
                  </p>
                </div>

                <div>
                  <Label htmlFor="rejectPct">Reject Threshold (Straw) %</Label>
                  <Input
                    id="rejectPct"
                    type="number"
                    step="0.1"
                    value={rejectPct}
                    onChange={(e) => setRejectPct(Number(e.target.value))}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Bales above this moisture % are rejected
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="batchReject">Batch Reject Enabled</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Reject entire truck on first failed bale
                    </p>
                  </div>
                  <Switch
                    id="batchReject"
                    checked={batchReject}
                    onCheckedChange={setBatchReject}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reload Management</CardTitle>
                <CardDescription>Configure inventory management parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="reloadThreshold">Reload Threshold (Days)</Label>
                  <Input
                    id="reloadThreshold"
                    type="number"
                    value={reloadThreshold}
                    onChange={(e) => setReloadThreshold(Number(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="dailyUsageA">Daily Usage - Grade A (bales/day)</Label>
                  <Input
                    id="dailyUsageA"
                    type="number"
                    value={dailyUsageA}
                    onChange={(e) => setDailyUsageA(Number(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="dailyUsageB">Daily Usage - Grade B (bales/day)</Label>
                  <Input
                    id="dailyUsageB"
                    type="number"
                    value={dailyUsageB}
                    onChange={(e) => setDailyUsageB(Number(e.target.value))}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pyramid Configuration</CardTitle>
                <CardDescription>Default dimensions for new pyramids</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="pyramidX">Width (X)</Label>
                    <Input
                      id="pyramidX"
                      type="number"
                      value={pyramidX}
                      onChange={(e) => setPyramidX(Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pyramidY">Depth (Y)</Label>
                    <Input
                      id="pyramidY"
                      type="number"
                      value={pyramidY}
                      onChange={(e) => setPyramidY(Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pyramidZ">Height (Z)</Label>
                    <Input
                      id="pyramidZ"
                      type="number"
                      value={pyramidZ}
                      onChange={(e) => setPyramidZ(Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={handleSave} className="flex-1">
                <SettingsIcon className="h-4 w-4 mr-2" />
                Save Settings
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex-1">
                    Reset Demo Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Demo Data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will clear all current data and reload the demo dataset. This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </RoleGate>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Backup, restore, and manage your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Button onClick={handleBackup}>
                  <Download className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
                <Button variant="outline" onClick={handleExport}>
                  <Upload className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Backups</h3>
                <div className="space-y-3">
                  {backupRecords.map((backup) => (
                    <div
                      key={backup.backupId}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{format(new Date(backup.timestamp), "MMM d, yyyy HH:mm")}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{backup.size}</Badge>
                          <Badge variant={backup.type === "scheduled" ? "default" : "secondary"}>
                            {backup.type}
                          </Badge>
                          <Badge variant={backup.status === "completed" ? "default" : "destructive"}>
                            {backup.status}
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Scheduled Reports</h3>
                <div className="space-y-3">
                  {scheduledReports.map((report) => (
                    <div
                      key={report.reportId}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{report.name}</p>
                          <Badge variant={report.status === "active" ? "default" : "secondary"}>
                            {report.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{report.frequency}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Next run: {format(new Date(report.nextRun), "MMM d, HH:mm")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{report.recipients.length} recipients</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>Track all system activities and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.logId}>
                      <TableCell className="font-mono text-xs">
                        {format(new Date(log.timestamp), "MM/dd HH:mm:ss")}
                      </TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>{log.module}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {log.details}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Manage currently logged in users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {session.userName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{session.userName}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge>{session.role}</Badge>
                          <Badge variant="outline">{session.device}</Badge>
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>IP: {session.ipAddress}</span>
                          <span>Active: {format(new Date(session.lastActivity), "HH:mm")}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      End Session
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Metrics</CardTitle>
              <CardDescription>Current system performance and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      <Label>CPU Usage</Label>
                    </div>
                    <span className="text-sm font-medium">{systemMetrics.cpuUsage}%</span>
                  </div>
                  <Progress value={systemMetrics.cpuUsage} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <Label>Memory Usage</Label>
                    </div>
                    <span className="text-sm font-medium">{systemMetrics.memoryUsage}%</span>
                  </div>
                  <Progress value={systemMetrics.memoryUsage} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <Label>Disk Usage</Label>
                    </div>
                    <span className="text-sm font-medium">{systemMetrics.diskUsage}%</span>
                  </div>
                  <Progress value={systemMetrics.diskUsage} />
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">DB Connections</p>
                      <p className="text-lg font-semibold">{systemMetrics.dbConnections}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Uptime</p>
                      <p className="text-lg font-semibold">{systemMetrics.uptime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Manage external system connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div
                    key={integration.integrationId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-muted">
                        <Plug className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{integration.name}</p>
                          <Badge
                            variant={
                              integration.status === "active"
                                ? "default"
                                : integration.status === "inactive"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {integration.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{integration.type}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last sync: {format(new Date(integration.lastSync), "MMM d, HH:mm")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Configure
                      </Button>
                      <Button size="sm" variant="ghost">
                        Test
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full mt-4" variant="outline">
                <Plug className="h-4 w-4 mr-2" />
                Add New Integration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
            </DialogTitle>
            <DialogDescription>
              {editingSupplier
                ? "Update the supplier information below"
                : "Fill in the details to add a new supplier"}
            </DialogDescription>
          </DialogHeader>
          <SupplierForm
            supplier={editingSupplier}
            onSubmit={handleSupplierSubmit}
            onCancel={() => {
              setIsSupplierDialogOpen(false);
              setEditingSupplier(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
