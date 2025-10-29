"use client";

import { useStore } from "@/lib/store";
import { RoleGate } from "@/components/RoleGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { exportToCSV } from "@/lib/csv";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

export default function ReportsPage() {
  const bales = useStore((state) => state.bales);
  const trucks = useStore((state) => state.trucks);
  const suppliers = useStore((state) => state.suppliers);

  const handleExportBales = () => {
    const data = bales.map((b) => ({
      baleId: b.baleId,
      truckId: b.truckId,
      baleType: b.baleType,
      species: b.species,
      moisturePct: b.moisturePct,
      weightKg: b.weightKg,
      density: b.density || "",
      decision: b.decision,
      pyramidId: b.pyramidId || "",
      timestamp: b.ts,
    }));
    exportToCSV(data, `bales-export-${Date.now()}.csv`);
    toast.success("Bales exported");
  };

  const handleExportTrucks = () => {
    const data = trucks.map((t) => ({
      truckId: t.truckId,
      supplierId: t.supplierId,
      lot: t.lot,
      source: t.source,
      baleType: t.baleType,
      status: t.status,
      batchDecision: t.batchDecision || "",
      gross: t.gross || "",
      tare: t.tare || "",
      inTime: t.inTime,
      outTime: t.outTime || "",
    }));
    exportToCSV(data, `trucks-export-${Date.now()}.csv`);
    toast.success("Trucks exported");
  };

  const handleExportSuppliers = () => {
    const data = suppliers.map((s) => ({
      supplierId: s.supplierId,
      name: s.name,
      tier: s.tier,
      score: s.score,
      failRatePct: s.kpi.failRatePct,
      avgMoisturePct: s.kpi.avgMoisturePct,
      variance: s.kpi.variance,
    }));
    exportToCSV(data, `suppliers-export-${Date.now()}.csv`);
    toast.success("Suppliers exported");
  };

  return (
    <RoleGate allowedRoles={["Admin", "Supervisor"]}>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Export data and view analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Bales Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Export all bale records including QA results
              </p>
              <p className="text-2xl font-bold mb-4">{bales.length} bales</p>
              <Button onClick={handleExportBales} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Trucks Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Export truck load records and status
              </p>
              <p className="text-2xl font-bold mb-4">{trucks.length} trucks</p>
              <Button onClick={handleExportTrucks} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Suppliers Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Export supplier scorecards and KPIs
              </p>
              <p className="text-2xl font-bold mb-4">{suppliers.length} suppliers</p>
              <Button onClick={handleExportSuppliers} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGate>
  );
}
