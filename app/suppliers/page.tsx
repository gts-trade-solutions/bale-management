"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { RoleGate } from "@/components/RoleGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supplierBales } from "@/lib/selectors";
import { Eye } from "lucide-react";

export default function SuppliersPage() {
  const suppliers = useStore((state) => state.suppliers);
  const bales = useStore((state) => state.bales);
  const trucks = useStore((state) => state.trucks);

  const getTierColor = (tier: number) => {
    if (tier === 1) return "bg-green-600";
    if (tier === 2) return "bg-amber-600";
    return "bg-red-600";
  };

  return (
    <RoleGate allowedRoles={["Admin", "Supervisor"]}>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground">Supplier scorecards and tiering</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Supplier Scorecards</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Fail Rate %</TableHead>
                  <TableHead>Avg Moisture %</TableHead>
                  <TableHead>Variance</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => {
                  const volume = supplierBales(supplier.supplierId, bales, trucks).length;
                  return (
                    <TableRow key={supplier.supplierId}>
                      <TableCell className="font-medium">
                        <div>
                          <p>{supplier.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {supplier.supplierId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTierColor(supplier.tier)}>
                          Tier {supplier.tier}
                        </Badge>
                      </TableCell>
                      <TableCell>{supplier.score}</TableCell>
                      <TableCell>
                        <span
                          className={
                            supplier.kpi.failRatePct > 5 ? "text-red-600 font-medium" : ""
                          }
                        >
                          {supplier.kpi.failRatePct.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>{supplier.kpi.avgMoisturePct.toFixed(1)}%</TableCell>
                      <TableCell>{supplier.kpi.variance.toFixed(2)}</TableCell>
                      <TableCell>{volume} bales</TableCell>
                      <TableCell>
                        <Link href={`/suppliers/${supplier.supplierId}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="mt-6 p-4 bg-gray-50 rounded-md text-sm">
              <h3 className="font-semibold mb-2">Auto-Tiering Rules</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Tier 1: Fail rate &lt;2% and avg moisture ≤14%</li>
                <li>• Tier 3: Fail rate &gt;8%</li>
                <li>• Tier 2: All others</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGate>
  );
}
