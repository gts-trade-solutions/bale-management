"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  TruckIcon,
  Package,
  Layers,
  ArrowRight,
  Clock,
  MapPin,
  User,
  Droplet,
  Weight,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import type { Bale, TruckLoad, Pyramid } from "@/lib/types";

export default function TraceabilityPage() {
  const bales = useStore((state) => state.bales);
  const trucks = useStore((state) => state.trucks);
  const suppliers = useStore((state) => state.suppliers);
  const pyramids = useStore((state) => state.pyramids);
  const consumptionBatches = useStore((state) => state.consumptionBatches);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"bale" | "truck" | "supplier" | "lot">("bale");
  const [results, setResults] = useState<any>(null);
  const [searchTime, setSearchTime] = useState<number>(0);

  const handleSearch = () => {
    const startTime = performance.now();

    if (searchType === "bale") {
      const bale = bales.find((b) => b.baleId.includes(searchTerm));
      if (bale) {
        const truck = trucks.find((t) => t.truckId === bale.truckId);
        const supplier = truck && suppliers.find((s) => s.supplierId === truck.supplierId);
        const pyramid = bale.pyramidId && pyramids.find((p) => p.pyramidId === bale.pyramidId);
        const consumption = consumptionBatches.find((cb) => cb.baleIds.includes(bale.baleId));

        setResults({
          type: "bale",
          bale,
          truck,
          supplier,
          pyramid,
          consumption,
        });
      } else {
        setResults({ type: "notfound" });
      }
    } else if (searchType === "truck") {
      const truck = trucks.find((t) => t.truckId.includes(searchTerm));
      if (truck) {
        const supplier = suppliers.find((s) => s.supplierId === truck.supplierId);
        const truckBales = bales.filter((b) => b.truckId === truck.truckId);

        setResults({
          type: "truck",
          truck,
          supplier,
          bales: truckBales,
        });
      } else {
        setResults({ type: "notfound" });
      }
    } else if (searchType === "supplier") {
      const supplier = suppliers.find((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.supplierId.includes(searchTerm)
      );
      if (supplier) {
        const supplierTrucks = trucks.filter((t) => t.supplierId === supplier.supplierId);
        const supplierBales = bales.filter((b) =>
          supplierTrucks.some((t) => t.truckId === b.truckId)
        );

        setResults({
          type: "supplier",
          supplier,
          trucks: supplierTrucks,
          bales: supplierBales,
        });
      } else {
        setResults({ type: "notfound" });
      }
    } else if (searchType === "lot") {
      const matchingTrucks = trucks.filter((t) => t.lot.includes(searchTerm));
      if (matchingTrucks.length > 0) {
        const lotBales = bales.filter((b) =>
          matchingTrucks.some((t) => t.truckId === b.truckId)
        );

        setResults({
          type: "lot",
          trucks: matchingTrucks,
          bales: lotBales,
        });
      } else {
        setResults({ type: "notfound" });
      }
    }

    const endTime = performance.now();
    setSearchTime(endTime - startTime);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Traceability Query</h1>
        <p className="text-muted-foreground">
          End-to-end bale traceability from supplier to consumption
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button
                variant={searchType === "bale" ? "default" : "outline"}
                onClick={() => setSearchType("bale")}
                className="w-full"
              >
                <Package className="h-4 w-4 mr-2" />
                Bale ID
              </Button>
              <Button
                variant={searchType === "truck" ? "default" : "outline"}
                onClick={() => setSearchType("truck")}
                className="w-full"
              >
                <TruckIcon className="h-4 w-4 mr-2" />
                Truck ID
              </Button>
              <Button
                variant={searchType === "supplier" ? "default" : "outline"}
                onClick={() => setSearchType("supplier")}
                className="w-full"
              >
                <User className="h-4 w-4 mr-2" />
                Supplier
              </Button>
              <Button
                variant={searchType === "lot" ? "default" : "outline"}
                onClick={() => setSearchType("lot")}
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Lot/PO
              </Button>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="search">Search {searchType}</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder={`Enter ${searchType} identifier...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="mt-2"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {searchTime > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Query completed in {searchTime.toFixed(2)}ms
                {searchTime < 30000 && (
                  <Badge variant="default" className="ml-2">
                    &lt; 30s Target
                  </Badge>
                )}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {results && results.type === "notfound" && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
            <p className="text-muted-foreground">
              No matching records found for "{searchTerm}"
            </p>
          </CardContent>
        </Card>
      )}

      {results && results.type === "bale" && results.bale && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Traceability Chain
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-xs font-medium">Supplier</p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                      <TruckIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-xs font-medium">Truck</p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                      <Package className="h-6 w-6 text-purple-600" />
                    </div>
                    <p className="text-xs font-medium">Bale QA</p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                      <Layers className="h-6 w-6 text-amber-600" />
                    </div>
                    <p className="text-xs font-medium">Storage</p>
                  </div>
                  {results.consumption && (
                    <>
                      <ArrowRight className="h-6 w-6 text-gray-400" />
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                          <Package className="h-6 w-6 text-red-600" />
                        </div>
                        <p className="text-xs font-medium">Processing</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.supplier && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4" />
                    Supplier Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Supplier:</span>
                    <span className="font-medium">{results.supplier.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="font-medium">{results.supplier.supplierId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tier:</span>
                    <Badge className={
                      results.supplier.tier === 1 ? "bg-green-600" :
                      results.supplier.tier === 2 ? "bg-amber-600" : "bg-red-600"
                    }>
                      Tier {results.supplier.tier}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Score:</span>
                    <span className="font-medium">{results.supplier.score}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {results.truck && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TruckIcon className="h-4 w-4" />
                    Truck Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Truck ID:</span>
                    <span className="font-medium">{results.truck.truckId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lot/PO:</span>
                    <span className="font-medium">{results.truck.lot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Source:</span>
                    <span className="font-medium">{results.truck.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Arrival:</span>
                    <span className="font-medium">
                      {format(new Date(results.truck.inTime), "MMM d, yyyy HH:mm")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Batch Decision:</span>
                    <Badge variant={results.truck.batchDecision === "Accepted" ? "default" : "destructive"}>
                      {results.truck.batchDecision || "Pending"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4" />
                  Bale Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bale ID:</span>
                  <span className="font-medium">{results.bale.baleId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{results.bale.baleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Species:</span>
                  <span className="font-medium">{results.bale.species}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Droplet className="h-3 w-3" />
                    Moisture:
                  </span>
                  <span className="font-medium">{results.bale.moisturePct.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Weight className="h-3 w-3" />
                    Weight:
                  </span>
                  <span className="font-medium">{results.bale.weightKg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Decision:</span>
                  <Badge variant={results.bale.decision === "Pass" ? "default" : "destructive"}>
                    {results.bale.decision}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timestamp:</span>
                  <span className="font-medium">
                    {format(new Date(results.bale.ts), "MMM d, yyyy HH:mm")}
                  </span>
                </div>
              </CardContent>
            </Card>

            {results.pyramid && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Layers className="h-4 w-4" />
                    Storage Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pyramid ID:</span>
                    <span className="font-medium">{results.pyramid.pyramidId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quality Grade:</span>
                    <Badge className={results.pyramid.qualityGrade === "A" ? "bg-green-600" : "bg-amber-600"}>
                      Grade {results.pyramid.qualityGrade}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Zone:</span>
                    <span className="font-medium">{results.pyramid.zone}</span>
                  </div>
                  {results.bale.slot && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Position:
                      </span>
                      <span className="font-medium">
                        ({results.bale.slot.x}, {results.bale.slot.y}, {results.bale.slot.z})
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={results.pyramid.status === "Active" ? "default" : "secondary"}>
                      {results.pyramid.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {results.consumption && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Consumption Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Batch ID:</span>
                  <span className="font-medium">{results.consumption.batchId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing Line:</span>
                  <span className="font-medium">{results.consumption.line}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Started:</span>
                  <span className="font-medium">
                    {format(new Date(results.consumption.startTs), "MMM d, yyyy HH:mm")}
                  </span>
                </div>
                {results.consumption.endTs && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="font-medium">
                      {format(new Date(results.consumption.endTs), "MMM d, yyyy HH:mm")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Bales in Batch:</span>
                  <span className="font-medium">{results.consumption.baleIds.length}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {results && (results.type === "truck" || results.type === "supplier" || results.type === "lot") && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {results.type === "truck" && "Truck Summary"}
                {results.type === "supplier" && "Supplier Summary"}
                {results.type === "lot" && "Lot Summary"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold">{results.bales?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Bales</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {results.bales?.filter((b: Bale) => b.decision === "Pass").length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Passed QA</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {results.bales?.filter((b: Bale) => b.decision === "Fail").length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Failed QA</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {results.bales && results.bales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bales ({results.bales.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {results.bales.map((bale: Bale) => (
                    <div
                      key={bale.baleId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{bale.baleId}</p>
                        <p className="text-xs text-muted-foreground">
                          {bale.moisturePct.toFixed(1)}% | {bale.weightKg} kg | {bale.pyramidId || "Not stored"}
                        </p>
                      </div>
                      <Badge variant={bale.decision === "Pass" ? "default" : "destructive"}>
                        {bale.decision}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
