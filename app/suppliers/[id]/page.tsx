"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { RoleGate } from "@/components/RoleGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, TrendingDown, TrendingUp, AlertCircle, Package, Truck } from "lucide-react";
import { formatDateTime } from "@/lib/time";
import { supplierBales } from "@/lib/selectors";

export default function SupplierDetailPage() {
  const params = useParams();
  const supplierId = params.id as string;

  const getSupplier = useStore((state) => state.getSupplier);
  const trucks = useStore((state) => state.trucks);
  const bales = useStore((state) => state.bales);

  const supplier = getSupplier(supplierId);

  if (!supplier) {
    return (
      <RoleGate allowedRoles={["Admin", "Supervisor"]}>
        <div className="container mx-auto py-8 px-4">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Supplier Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The supplier you're looking for doesn't exist.
              </p>
              <Link href="/suppliers">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Suppliers
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </RoleGate>
    );
  }

  const supplierTrucks = trucks.filter((t) => t.supplierId === supplierId);
  const supplierBalesList = supplierBales(supplierId, bales, trucks);

  const passedBales = supplierBalesList.filter((b) => b.decision === "Pass");
  const failedBales = supplierBalesList.filter((b) => b.decision === "Fail");
  const totalBales = supplierBalesList.length;
  const passRate = totalBales > 0 ? ((passedBales.length / totalBales) * 100).toFixed(1) : "0";
  const failRate = totalBales > 0 ? ((failedBales.length / totalBales) * 100).toFixed(1) : "0";

  const balesByType = supplierBalesList.reduce((acc, bale) => {
    acc[bale.baleType] = (acc[bale.baleType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalWeight = supplierBalesList.reduce((sum, b) => sum + b.weightKg, 0);
  const avgWeight = totalBales > 0 ? (totalWeight / totalBales).toFixed(1) : "0";

  const getTierColor = (tier: number) => {
    if (tier === 1) return "bg-green-600";
    if (tier === 2) return "bg-amber-600";
    return "bg-red-600";
  };

  const getStatusColor = (status: string) => {
    if (status === "CLOSE_TRUCK_RECORD") return "bg-gray-500";
    if (status === "BATCH_REJECT") return "bg-red-500";
    if (status === "UNLOAD_LOOP") return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <RoleGate allowedRoles={["Admin", "Supervisor"]}>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/suppliers">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{supplier.name}</h1>
              <p className="text-muted-foreground">{supplier.supplierId}</p>
            </div>
          </div>
          <Badge className={getTierColor(supplier.tier)} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
            Tier {supplier.tier}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Supplier Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{supplier.score}</div>
              <p className="text-xs text-muted-foreground mt-1">Out of 100</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalBales}</div>
              <div className="flex gap-2 mt-1">
                <span className="text-xs text-green-600">{passedBales.length} passed</span>
                <span className="text-xs text-red-600">{failedBales.length} failed</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Trucks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{supplierTrucks.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Deliveries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Weight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{(totalWeight / 1000).toFixed(1)}</div>
              <p className="text-xs text-muted-foreground mt-1">Metric tons</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm text-muted-foreground">Fail Rate</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-lg font-semibold ${
                      supplier.kpi.failRatePct > 5 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {supplier.kpi.failRatePct.toFixed(1)}%
                  </span>
                  {supplier.kpi.failRatePct > 5 ? (
                    <TrendingUp className="h-4 w-4 text-red-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm text-muted-foreground">Avg Moisture</span>
                <span
                  className={`text-lg font-semibold ${
                    supplier.kpi.avgMoisturePct > 14 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {supplier.kpi.avgMoisturePct.toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm text-muted-foreground">Variance</span>
                <span className="text-lg font-semibold">{supplier.kpi.variance.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pass Rate</span>
                <span className="text-lg font-semibold text-green-600">{passRate}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm text-muted-foreground">Supplier ID</span>
                <span className="font-medium">{supplier.supplierId}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm text-muted-foreground">Tier</span>
                <Badge className={getTierColor(supplier.tier)}>
                  Tier {supplier.tier}
                  {supplier.tierOverride && " (Override)"}
                </Badge>
              </div>

              {supplier.contacts && (
                <div className="pb-3 border-b">
                  <span className="text-sm text-muted-foreground block mb-1">Contacts</span>
                  <span className="font-medium text-sm">{supplier.contacts}</span>
                </div>
              )}

              <div className="pb-3 border-b">
                <span className="text-sm text-muted-foreground block mb-2">Bales by Type</span>
                <div className="space-y-1">
                  {Object.entries(balesByType).map(([type, count]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span>{type}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Bale Weight</span>
                <span className="font-medium">{avgWeight} kg</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Truck Delivery History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {supplierTrucks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Truck ID</TableHead>
                    <TableHead>Lot</TableHead>
                    <TableHead>Bale Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Batch Decision</TableHead>
                    <TableHead>In Time</TableHead>
                    <TableHead>Out Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplierTrucks
                    .sort((a, b) => new Date(b.inTime).getTime() - new Date(a.inTime).getTime())
                    .map((truck) => (
                      <TableRow key={truck.truckId}>
                        <TableCell className="font-medium">{truck.truckId}</TableCell>
                        <TableCell>{truck.lot}</TableCell>
                        <TableCell>{truck.baleType}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(truck.status)}>
                            {truck.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {truck.batchDecision ? (
                            <Badge
                              variant={
                                truck.batchDecision === "Accepted" ? "default" : "destructive"
                              }
                            >
                              {truck.batchDecision}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{formatDateTime(truck.inTime)}</TableCell>
                        <TableCell>
                          {truck.outTime ? formatDateTime(truck.outTime) : "-"}
                        </TableCell>
                        <TableCell>
                          <Link href={`/trucks/${truck.truckId}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No trucks found for this supplier</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tier Classification Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-md">
                <Badge className="bg-green-600 mt-1">Tier 1</Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">Premium Supplier</p>
                  <p className="text-sm text-muted-foreground">
                    Fail rate &lt;2% and average moisture ≤14%
                  </p>
                </div>
                {supplier.tier === 1 && (
                  <Badge variant="outline" className="mt-1">Current</Badge>
                )}
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-md">
                <Badge className="bg-amber-600 mt-1">Tier 2</Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">Standard Supplier</p>
                  <p className="text-sm text-muted-foreground">
                    All suppliers not meeting Tier 1 or Tier 3 criteria
                  </p>
                </div>
                {supplier.tier === 2 && (
                  <Badge variant="outline" className="mt-1">Current</Badge>
                )}
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-md">
                <Badge className="bg-red-600 mt-1">Tier 3</Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">At-Risk Supplier</p>
                  <p className="text-sm text-muted-foreground">
                    Fail rate &gt;8% - requires immediate attention
                  </p>
                </div>
                {supplier.tier === 3 && (
                  <Badge variant="outline" className="mt-1">Current</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGate>
  );
}
