"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { RoleGate } from "@/components/RoleGate";
import { Button } from "@/components/ui/button";
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
import { formatDateTime } from "@/lib/time";
import { Eye, PlayCircle } from "lucide-react";

export default function TrucksPage() {
  const trucks = useStore((state) => state.trucks);
  const suppliers = useStore((state) => state.suppliers);

  const supplierMap = new Map(suppliers.map((s) => [s.supplierId, s]));

  const getStatusColor = (status: string) => {
    if (status === "CLOSE_TRUCK_RECORD") return "bg-gray-500";
    if (status === "BATCH_REJECT") return "bg-red-500";
    if (status === "UNLOAD_LOOP") return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <RoleGate allowedRoles={["Admin", "Supervisor", "Operator"]}>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Trucks</h1>
            <p className="text-muted-foreground">Manage truck loads and QA</p>
          </div>
          <Link href="/check-in">
            <Button>New Check-In</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Trucks</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Truck ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Lot</TableHead>
                  <TableHead>Bale Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Batch Decision</TableHead>
                  <TableHead>In Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trucks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No trucks found
                    </TableCell>
                  </TableRow>
                ) : (
                  trucks.map((truck) => {
                    const supplier = supplierMap.get(truck.supplierId);
                    return (
                      <TableRow key={truck.truckId}>
                        <TableCell className="font-medium">{truck.truckId}</TableCell>
                        <TableCell>{supplier?.name || truck.supplierId}</TableCell>
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
                                truck.batchDecision === "Accepted"
                                  ? "default"
                                  : "destructive"
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
                          <div className="flex gap-2">
                            <Link href={`/trucks/${truck.truckId}`}>
                              <Button variant="outline" size="sm">
                                {truck.status === "CLOSE_TRUCK_RECORD" ? (
                                  <>
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="h-4 w-4 mr-1" />
                                    Continue
                                  </>
                                )}
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </RoleGate>
  );
}
