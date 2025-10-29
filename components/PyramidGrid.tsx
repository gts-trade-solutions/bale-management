"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Pyramid, Slot, Bale } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Box, Droplet, Weight, MapPin, Calendar, Layers } from "lucide-react";
import { format } from "date-fns";

interface PyramidGridProps {
  pyramid: Pyramid;
  slots: Slot[];
  bales: Bale[];
}

export function PyramidGrid({ pyramid, slots, bales }: PyramidGridProps) {
  const [selectedLayer, setSelectedLayer] = useState(0);
  const [selectedBale, setSelectedBale] = useState<Bale | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const pyramidSlots = slots.filter((s) => s.pyramidId === pyramid.pyramidId);
  const baleMap = new Map(bales.map((b) => [b.baleId, b]));

  const layers = Array.from({ length: pyramid.shape.z }, (_, z) => z);

  const getSlotAt = (x: number, y: number, z: number) => {
    return pyramidSlots.find((s) => s.x === x && s.y === y && s.z === z);
  };

  const filledSlots = pyramidSlots.filter((s) => s.baleId).length;
  const totalSlots = pyramid.capacity;
  const occupancyPct = (filledSlots / totalSlots) * 100;

  const pyramidBales = bales.filter((b) => b.pyramidId === pyramid.pyramidId);
  const avgMoisture = pyramidBales.length > 0
    ? pyramidBales.reduce((sum, b) => sum + b.moisturePct, 0) / pyramidBales.length
    : 0;
  const avgWeight = pyramidBales.length > 0
    ? pyramidBales.reduce((sum, b) => sum + b.weightKg, 0) / pyramidBales.length
    : 0;

  const getLayerStats = (layer: number) => {
    const layerSlots = pyramidSlots.filter((s) => s.z === layer);
    const filled = layerSlots.filter((s) => s.baleId).length;
    const total = pyramid.shape.x * pyramid.shape.y;
    return { filled, total, percentage: (filled / total) * 100 };
  };

  const handleBaleClick = (bale: Bale | null) => {
    if (bale) {
      setSelectedBale(bale);
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Box className="h-4 w-4 text-muted-foreground" />
              Total Bales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pyramidBales.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filledSlots} of {totalSlots} slots filled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyPct.toFixed(1)}%</div>
            <Progress value={occupancyPct} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Droplet className="h-4 w-4 text-muted-foreground" />
              Avg Moisture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMoisture.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Grade {pyramid.qualityGrade} threshold: ≤14%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Weight className="h-4 w-4 text-muted-foreground" />
              Avg Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgWeight.toFixed(0)} kg</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total: {(pyramidBales.length * avgWeight).toFixed(0)} kg
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {pyramid.pyramidId} - Grade {pyramid.qualityGrade}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Zone: {pyramid.zone} | Shape: {pyramid.shape.x} × {pyramid.shape.y} × {pyramid.shape.z}
              </p>
            </div>
            <Badge variant={pyramid.status === "Active" ? "default" : "secondary"}>
              {pyramid.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Legend:</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border ${
                    pyramid.qualityGrade === "A"
                      ? "bg-green-200 border-green-400"
                      : "bg-amber-200 border-amber-400"
                  }`} />
                  <span className="text-xs">Filled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border bg-gray-100 border-gray-300" />
                  <span className="text-xs">Empty</span>
                </div>
              </div>
            </div>
          </div>

          <Tabs value={String(selectedLayer)} onValueChange={(v) => setSelectedLayer(Number(v))}>
            <TabsList className="mb-4 flex-wrap">
              {layers.map((z) => {
                const stats = getLayerStats(z);
                return (
                  <TabsTrigger key={z} value={String(z)} className="flex-col gap-1 py-2">
                    <span>Layer {z}</span>
                    <span className="text-xs text-muted-foreground">
                      {stats.filled}/{stats.total}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

          {layers.map((z) => (
            <TabsContent key={z} value={String(z)}>
              <div className="grid gap-1" style={{
                gridTemplateColumns: `repeat(${pyramid.shape.x}, minmax(0, 1fr))`,
              }}>
                {Array.from({ length: pyramid.shape.y }, (_, y) =>
                  Array.from({ length: pyramid.shape.x }, (_, x) => {
                    const slot = getSlotAt(x, y, z);
                    const bale = slot?.baleId ? baleMap.get(slot.baleId) : null;

                    return (
                      <TooltipProvider key={`${x}-${y}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleBaleClick(bale || null)}
                              className={`
                                aspect-square border rounded flex items-center justify-center
                                text-xs font-medium transition-all
                                ${
                                  bale
                                    ? pyramid.qualityGrade === "A"
                                      ? "bg-green-200 hover:bg-green-300 border-green-400 hover:scale-105 cursor-pointer"
                                      : "bg-amber-200 hover:bg-amber-300 border-amber-400 hover:scale-105 cursor-pointer"
                                    : "bg-gray-100 hover:bg-gray-200 border-gray-300 cursor-default"
                                }
                              `}
                            >
                              {bale ? bale.baleId.slice(-4) : ""}
                            </button>
                          </TooltipTrigger>
                          {bale && (
                            <TooltipContent>
                              <div className="text-xs space-y-1">
                                <p className="font-semibold">{bale.baleId}</p>
                                <p>Moisture: {bale.moisturePct.toFixed(1)}%</p>
                                <p>Weight: {bale.weightKg} kg</p>
                                <p>Position: ({x}, {y}, {z})</p>
                                <p className="text-muted-foreground pt-1">Click for details</p>
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="text-sm">
            <p className="font-medium mb-2">Layer Statistics</p>
            <div className="space-y-1">
              {layers.map((z) => {
                const stats = getLayerStats(z);
                return (
                  <div key={z} className="flex items-center justify-between text-xs">
                    <span>Layer {z}:</span>
                    <span className="font-medium">
                      {stats.filled}/{stats.total} ({stats.percentage.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-sm">
            <p className="font-medium mb-2">Quality Metrics</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Pass Rate:</span>
                <span className="font-medium">
                  {pyramidBales.length > 0
                    ? ((pyramidBales.filter((b) => b.decision === "Pass").length / pyramidBales.length) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Min Moisture:</span>
                <span className="font-medium">
                  {pyramidBales.length > 0
                    ? Math.min(...pyramidBales.map((b) => b.moisturePct)).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Max Moisture:</span>
                <span className="font-medium">
                  {pyramidBales.length > 0
                    ? Math.max(...pyramidBales.map((b) => b.moisturePct)).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="text-sm">
            <p className="font-medium mb-2">Storage Info</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Capacity:</span>
                <span className="font-medium">{pyramid.capacity} bales</span>
              </div>
              <div className="flex justify-between">
                <span>Available:</span>
                <span className="font-medium">{totalSlots - filledSlots} slots</span>
              </div>
              <div className="flex justify-between">
                <span>Utilization:</span>
                <span className="font-medium">{occupancyPct.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bale Details</DialogTitle>
          <DialogDescription>
            Complete information for {selectedBale?.baleId}
          </DialogDescription>
        </DialogHeader>
        {selectedBale && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  Basic Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bale ID:</span>
                    <span className="font-medium">{selectedBale.baleId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Truck ID:</span>
                    <span className="font-medium">{selectedBale.truckId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{selectedBale.baleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Species:</span>
                    <span className="font-medium">{selectedBale.species}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Decision:</span>
                    <Badge variant={selectedBale.decision === "Pass" ? "default" : "destructive"}>
                      {selectedBale.decision}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Droplet className="h-4 w-4" />
                  Quality Metrics
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Moisture:</span>
                    <span className="font-medium">{selectedBale.moisturePct.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight:</span>
                    <span className="font-medium">{selectedBale.weightKg} kg</span>
                  </div>
                  {selectedBale.density && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Density:</span>
                      <span className="font-medium">{selectedBale.density.toFixed(2)} kg/m³</span>
                    </div>
                  )}
                  {selectedBale.operatorId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Operator:</span>
                      <span className="font-medium">{selectedBale.operatorId}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Storage Location
                </h3>
                <div className="space-y-2 text-sm">
                  {selectedBale.pyramidId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pyramid:</span>
                      <span className="font-medium">{selectedBale.pyramidId}</span>
                    </div>
                  )}
                  {selectedBale.slot && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Position:</span>
                        <span className="font-medium">
                          ({selectedBale.slot.x}, {selectedBale.slot.y}, {selectedBale.slot.z})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Layer:</span>
                        <span className="font-medium">Layer {selectedBale.slot.z}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timestamp
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processed:</span>
                    <span className="font-medium">
                      {format(new Date(selectedBale.ts), "MMM d, yyyy HH:mm")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Days in storage:</span>
                    <span className="font-medium">
                      {Math.floor((Date.now() - new Date(selectedBale.ts).getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  </>
  );
}
