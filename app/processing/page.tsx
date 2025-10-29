"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { RoleGate } from "@/components/RoleGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { nowISO } from "@/lib/time";
import { Activity, Package, PlayCircle, CheckCircle, Clock, Layers } from "lucide-react";
import type { Bale, QualityGrade } from "@/lib/types";

export default function ProcessingPage() {
  const bales = useStore((state) => state.bales);
  const pyramids = useStore((state) => state.pyramids);
  const slots = useStore((state) => state.slots);
  const updateBale = useStore((state) => state.updateBale);
  const updateSlot = useStore((state) => state.updateSlot);
  const addConsumptionBatch = useStore((state) => state.addConsumptionBatch);
  const updateConsumptionBatch = useStore((state) => state.updateConsumptionBatch);
  const addEvent = useStore((state) => state.addEvent);
  const consumptionBatches = useStore((state) => state.consumptionBatches);
  const session = useStore((state) => state.session);

  const [showSelectionDialog, setShowSelectionDialog] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<QualityGrade>("A");
  const [selectedLine, setSelectedLine] = useState("Line-1");
  const [selectedBales, setSelectedBales] = useState<string[]>([]);
  const [batchQuantity, setBatchQuantity] = useState(10);

  const availableBales = bales.filter((b) => {
    if (!b.pyramidId || b.decision !== "Pass" || !b.slot) return false;
    const slotId = `${b.pyramidId}-${b.slot.x}-${b.slot.y}-${b.slot.z}`;
    const slot = slots.find((s) => s.slotId === slotId);
    return !slot?.emptiedTs;
  });

  const gradeMap = new Map<string, QualityGrade>();
  pyramids.forEach((p) => {
    gradeMap.set(p.pyramidId, p.qualityGrade);
  });

  const filteredBales = availableBales
    .filter((b) => b.pyramidId && gradeMap.get(b.pyramidId) === selectedGrade)
    .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime())
    .slice(0, 50);

  const activeBatches = consumptionBatches.filter((b) => !b.endTs);
  const completedBatches = consumptionBatches.filter((b) => b.endTs).slice(-10);

  const handleOpenSelection = (grade: QualityGrade) => {
    setSelectedGrade(grade);
    setSelectedBales([]);
    setShowSelectionDialog(true);
  };

  const toggleBaleSelection = (baleId: string) => {
    setSelectedBales((prev) =>
      prev.includes(baleId)
        ? prev.filter((id) => id !== baleId)
        : [...prev, baleId]
    );
  };

  const handleAutoSelectFEFO = () => {
    const oldest = filteredBales
      .filter((b) => b.pyramidId && gradeMap.get(b.pyramidId) === selectedGrade)
      .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime())
      .slice(0, batchQuantity)
      .map((b) => b.baleId);
    setSelectedBales(oldest);
    toast.success(`Selected ${oldest.length} oldest bales (FEFO)`);
  };

  const handleCreateBatch = () => {
    if (selectedBales.length === 0) {
      toast.error("Please select at least one bale");
      return;
    }

    const batchId = `BATCH${Date.now()}`;
    const selectedBaleData = bales.filter((b) => selectedBales.includes(b.baleId));

    const avgMoisture =
      selectedBaleData.reduce((sum, b) => sum + b.moisturePct, 0) /
      selectedBaleData.length;
    const avgWeight =
      selectedBaleData.reduce((sum, b) => sum + b.weightKg, 0) /
      selectedBaleData.length;

    addConsumptionBatch({
      batchId,
      line: selectedLine,
      startTs: nowISO(),
      baleIds: selectedBales,
      averageMoisture: avgMoisture,
      avgWeightKg: avgWeight,
    });

    selectedBales.forEach((baleId) => {
      const bale = bales.find((b) => b.baleId === baleId);
      if (bale && bale.slot) {
        const slotId = `${bale.pyramidId}-${bale.slot.x}-${bale.slot.y}-${bale.slot.z}`;
        updateSlot(slotId, { emptiedTs: nowISO() });
      }
    });

    addEvent({
      eventId: `EVT${Date.now()}`,
      scope: "System",
      actor: session.operatorId,
      change: `Created consumption batch ${batchId} with ${selectedBales.length} bales for ${selectedLine}`,
      ts: nowISO(),
    });

    toast.success(`Batch ${batchId} created with ${selectedBales.length} bales`);
    setShowSelectionDialog(false);
    setSelectedBales([]);
  };

  const handleCompleteBatch = (batchId: string) => {
    updateConsumptionBatch(batchId, { endTs: nowISO() });
    addEvent({
      eventId: `EVT${Date.now()}`,
      scope: "System",
      actor: session.operatorId,
      change: `Completed consumption batch ${batchId}`,
      ts: nowISO(),
    });
    toast.success(`Batch ${batchId} completed`);
  };

  const onHandByGrade = { A: 0, B: 0 };
  availableBales.forEach((b) => {
    if (b.pyramidId) {
      const grade = gradeMap.get(b.pyramidId);
      if (grade) onHandByGrade[grade]++;
    }
  });

  return (
    <RoleGate allowedRoles={["Admin", "Supervisor", "Operator"]}>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Processing & Consumption</h1>
          <p className="text-muted-foreground">Manage bale selection and processing batches</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                Grade A Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onHandByGrade.A}</div>
              <Button
                onClick={() => handleOpenSelection("A")}
                className="w-full mt-3"
                size="sm"
              >
                Select for Processing
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                Grade B Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onHandByGrade.B}</div>
              <Button
                onClick={() => handleOpenSelection("B")}
                className="w-full mt-3"
                size="sm"
              >
                Select for Processing
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                Active Batches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBatches.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                Completed Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedBatches.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Last 10 shown</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-blue-600" />
                Active Batches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeBatches.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No active batches
                </p>
              ) : (
                <div className="space-y-3">
                  {activeBatches.map((batch) => (
                    <div
                      key={batch.batchId}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{batch.batchId}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{batch.line}</Badge>
                          <Badge>{batch.baleIds.length} bales</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Started: {new Date(batch.startTs).toLocaleString()}
                        </p>
                        {batch.averageMoisture && (
                          <p className="text-xs text-muted-foreground">
                            Avg Moisture: {batch.averageMoisture.toFixed(1)}%
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleCompleteBatch(batch.batchId)}
                      >
                        Complete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Recent Completed Batches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedBatches.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No completed batches
                </p>
              ) : (
                <div className="space-y-3">
                  {completedBatches.map((batch) => (
                    <div
                      key={batch.batchId}
                      className="p-4 border rounded-lg bg-gray-50"
                    >
                      <p className="font-medium">{batch.batchId}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{batch.line}</Badge>
                        <Badge variant="secondary">{batch.baleIds.length} bales</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Completed: {batch.endTs && new Date(batch.endTs).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={showSelectionDialog} onOpenChange={setShowSelectionDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select Bales for Processing - Grade {selectedGrade}</DialogTitle>
              <DialogDescription>
                Choose bales using FEFO (First Expired First Out) method
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Processing Line</Label>
                  <Select value={selectedLine} onValueChange={setSelectedLine}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Line-1">Line 1</SelectItem>
                      <SelectItem value="Line-2">Line 2</SelectItem>
                      <SelectItem value="Line-3">Line 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Batch Quantity</Label>
                  <Input
                    type="number"
                    value={batchQuantity}
                    onChange={(e) => setBatchQuantity(Number(e.target.value))}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedBales.length} bales
                </p>
                <Button onClick={handleAutoSelectFEFO} variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Auto-Select FEFO
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Bale ID</TableHead>
                    <TableHead>Pyramid</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Moisture %</TableHead>
                    <TableHead>Weight (kg)</TableHead>
                    <TableHead>Age (days)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBales.map((bale) => {
                    const age = Math.floor(
                      (Date.now() - new Date(bale.ts).getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <TableRow
                        key={bale.baleId}
                        className={selectedBales.includes(bale.baleId) ? "bg-blue-50" : ""}
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedBales.includes(bale.baleId)}
                            onChange={() => toggleBaleSelection(bale.baleId)}
                            className="w-4 h-4"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{bale.baleId}</TableCell>
                        <TableCell>{bale.pyramidId}</TableCell>
                        <TableCell>
                          {bale.slot
                            ? `(${bale.slot.x}, ${bale.slot.y}, ${bale.slot.z})`
                            : "N/A"}
                        </TableCell>
                        <TableCell>{bale.moisturePct.toFixed(1)}%</TableCell>
                        <TableCell>{bale.weightKg}</TableCell>
                        <TableCell>
                          <Badge variant={age > 7 ? "destructive" : "outline"}>{age}d</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSelectionDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBatch} disabled={selectedBales.length === 0}>
                  <Package className="h-4 w-4 mr-2" />
                  Create Batch ({selectedBales.length})
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGate>
  );
}
