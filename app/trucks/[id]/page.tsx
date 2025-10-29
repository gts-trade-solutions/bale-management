"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { RoleGate } from "@/components/RoleGate";
import { StateMachineStepper } from "@/components/StateMachineStepper";
import { BaleQAWidget } from "@/components/BaleQAWidget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { nowISO } from "@/lib/time";
import { classifyBale, computeDensity, findAvailableSlot, placeBaleToPyramid } from "@/lib/logic";
import { truckBales } from "@/lib/selectors";
import { AlertTriangle, Package, ArrowRight, CheckCircle2, Scale, Weight } from "lucide-react";

export default function TruckDetailPage() {
  const params = useParams();
  const truckId = params.id as string;
  const router = useRouter();
  const [gross, setGross] = useState("");
  const [tare, setTare] = useState("");
  const [showPlaceDialog, setShowPlaceDialog] = useState(false);
  const [pendingBale, setPendingBale] = useState<any>(null);
  const [selectedPyramid, setSelectedPyramid] = useState("");
  const [forceUpdateKey, setForceUpdateKey] = useState(0);

  const updateTruck = useStore((state) => state.updateTruck);
  const addBale = useStore((state) => state.addBale);
  const addSlot = useStore((state) => state.addSlot);
  const updateBale = useStore((state) => state.updateBale);
  const addEvent = useStore((state) => state.addEvent);
  const addAlert = useStore((state) => state.addAlert);
  const config = useStore((state) => state.config);
  const session = useStore((state) => state.session);
  const pyramids = useStore((state) => state.pyramids);
  const slots = useStore((state) => state.slots);

  const truck = useStore((state) => state.trucks.find((t) => t.truckId === truckId));
  const bales = useStore((state) => state.bales);
  const currentBales = truckBales(truckId, bales);

  useEffect(() => {
    if (truck?.gross) {
      setGross(truck.gross.toString());
    }
    if (truck?.tare) {
      setTare(truck.tare.toString());
    }
  }, [truck]);

  if (!truck) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Truck not found</p>
            <Button onClick={() => router.push("/trucks")} className="mt-4">
              Back to Trucks
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAdvanceStatus = () => {
    if (truck.status === "CHECK_IN") {
      updateTruck(truck.truckId, { status: "GROSS_IN" });
      addEvent({
        eventId: `EVT${Date.now()}`,
        scope: "Truck",
        actor: session.operatorId,
        change: `${truck.truckId} moved to Gross Weighing stage`,
        ts: nowISO(),
      });
      toast.success("Ready for Gross Weighing");
      setForceUpdateKey(prev => prev + 1);
      setTimeout(() => router.refresh(), 50);
    } else if (truck.status === "GROSS_IN") {
      if (!gross || Number(gross) <= 0) {
        toast.error("Please enter a valid gross weight before advancing");
        return;
      }
      updateTruck(truck.truckId, { gross: Number(gross), status: "UNLOAD_LOOP" });
      addEvent({
        eventId: `EVT${Date.now()}`,
        scope: "Truck",
        actor: session.operatorId,
        change: `${truck.truckId} gross weight recorded: ${gross}kg - Starting QA loop`,
        ts: nowISO(),
      });
      toast.success("Gross weight recorded. Starting QA loop.");
      setForceUpdateKey(prev => prev + 1);
      setTimeout(() => router.refresh(), 50);
    } else if (truck.status === "UNLOAD_LOOP" || truck.status === "BATCH_REJECT") {
      updateTruck(truck.truckId, { status: "TARE_OUT" });
      addEvent({
        eventId: `EVT${Date.now()}`,
        scope: "Truck",
        actor: session.operatorId,
        change: `${truck.truckId} unloading completed - Moving to Tare weighing`,
        ts: nowISO(),
      });
      toast.success("Moving to Tare weighing");
      setForceUpdateKey(prev => prev + 1);
      setTimeout(() => router.refresh(), 50);
    } else if (truck.status === "TARE_OUT") {
      if (!tare || Number(tare) <= 0) {
        toast.error("Please enter a valid tare weight before completing");
        return;
      }
      updateTruck(truck.truckId, {
        tare: Number(tare),
        outTime: nowISO(),
        status: "CLOSE_TRUCK_RECORD",
        batchDecision: truck.batchDecision || "Accepted",
      });
      addEvent({
        eventId: `EVT${Date.now()}`,
        scope: "Truck",
        actor: session.operatorId,
        change: `${truck.truckId} tare weight recorded: ${tare}kg - Record closed`,
        ts: nowISO(),
      });
      toast.success("Truck record completed successfully!");
      setTimeout(() => router.push("/trucks"), 1500);
    }
  };

  const handlePass = (data: { moisturePct: number; weightKg: number; density: number }) => {
    const baleId = `BALE${Date.now()}`;
    setPendingBale({
      baleId,
      truckId: truck.truckId,
      baleType: truck.baleType,
      species: "Straw",
      moisturePct: data.moisturePct,
      weightKg: data.weightKg,
      density: data.density,
      decision: "Pass",
      operatorId: session.operatorId,
      ts: nowISO(),
    });
    setShowPlaceDialog(true);
  };

  const handleFail = (data: { moisturePct: number; weightKg: number; density: number }) => {
    const baleId = `BALE${Date.now()}`;
    addBale({
      baleId,
      truckId: truck.truckId,
      baleType: truck.baleType,
      species: "Straw",
      moisturePct: data.moisturePct,
      weightKg: data.weightKg,
      density: data.density,
      decision: "Fail",
      operatorId: session.operatorId,
      ts: nowISO(),
    });

    if (config.batchRejectEnabled) {
      updateTruck(truck.truckId, {
        status: "BATCH_REJECT",
        batchDecision: "Rejected",
      });

      addAlert({
        alertId: `ALT${Date.now()}`,
        type: "Quality",
        severity: "critical",
        message: `Truck ${truck.truckId} rejected - failed bale detected`,
        createdAt: nowISO(),
        meta: { truckId: truck.truckId },
      });

      toast.error("Bale Failed! Truck marked for Batch Reject");
    } else {
      toast.warning("Bale Failed but batch reject is disabled");
    }

    updateTruck(truck.truckId, {
      baleCount: truck.baleCount + 1,
    });
  };

  const handlePlaceBale = () => {
    if (!selectedPyramid || !pendingBale) return;

    const pyramid = pyramids.find((p) => p.pyramidId === selectedPyramid);
    if (!pyramid) {
      toast.error("Pyramid not found");
      return;
    }

    const coord = findAvailableSlot(pyramid, slots);
    if (!coord) {
      toast.error("No available slots in this pyramid");
      return;
    }

    const { updatedBale, updatedSlot } = placeBaleToPyramid(
      pendingBale,
      selectedPyramid,
      coord,
      slots
    );

    addBale(updatedBale);
    addSlot(updatedSlot);

    updateTruck(truck.truckId, {
      baleCount: truck.baleCount + 1,
    });

    addEvent({
      eventId: `EVT${Date.now()}`,
      scope: "Bale",
      actor: session.operatorId,
      change: `${pendingBale.baleId} placed to ${selectedPyramid} (${coord.x},${coord.y},${coord.z})`,
      ts: nowISO(),
    });

    toast.success(`Bale placed to ${selectedPyramid}`);
    setShowPlaceDialog(false);
    setPendingBale(null);
    setSelectedPyramid("");
  };

  const canAdvance = truck.status !== "CLOSE_TRUCK_RECORD";

  const getAdvanceButtonText = () => {
    switch (truck.status) {
      case "CHECK_IN":
        return "Start Gross Weighing";
      case "GROSS_IN":
        return "Start Unloading & QA";
      case "UNLOAD_LOOP":
        return "Finish Unloading - Proceed to Tare";
      case "BATCH_REJECT":
        return "Proceed to Tare Weighing";
      case "TARE_OUT":
        return "Complete & Close Record";
      default:
        return "Next Step";
    }
  };

  const isAdvanceDisabled = () => {
    if (truck.status === "GROSS_IN" && (!gross || Number(gross) <= 0)) return true;
    if (truck.status === "TARE_OUT" && (!tare || Number(tare) <= 0)) return true;
    return false;
  };

  const passedBales = currentBales.filter((b) => b.decision === "Pass").length;
  const failedBales = currentBales.filter((b) => b.decision === "Fail").length;

  const getStatusInstruction = () => {
    switch (truck.status) {
      case "CHECK_IN":
        return "Click the button below to begin the gross weighing process.";
      case "GROSS_IN":
        return "Enter the gross weight of the loaded truck, then proceed to QA.";
      case "UNLOAD_LOOP":
        return "Perform QA on each bale. When finished, proceed to tare weighing.";
      case "BATCH_REJECT":
        return "This batch has been rejected. Handle rejected material and proceed to tare.";
      case "TARE_OUT":
        return "Enter the tare weight of the empty truck to complete the record.";
      case "CLOSE_TRUCK_RECORD":
        return "This truck record is complete.";
      default:
        return "";
    }
  };

  return (
    <RoleGate allowedRoles={["Admin", "Supervisor", "Operator"]}>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Truck {truck.truckId}</h1>
            <p className="text-muted-foreground">
              Lot: {truck.lot} | Source: {truck.source}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/trucks")}>
            Back to Trucks
          </Button>
        </div>

        <StateMachineStepper key={`${truck.truckId}-${truck.status}-${forceUpdateKey}`} currentStatus={truck.status} />

        {truck.status !== "CLOSE_TRUCK_RECORD" && (
          <Card className="mt-6 border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-900">{getStatusInstruction()}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            {truck.status === "CHECK_IN" && (
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Check-In Complete
                  </CardTitle>
                  <CardDescription>
                    Truck has been checked in. Ready to proceed to gross weighing.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Driver:</span>
                      <span className="font-medium">{truck.driverName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vehicle:</span>
                      <span className="font-medium">{truck.vehicleRegistration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bale Type:</span>
                      <span className="font-medium">{truck.baleType}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {(truck.status === "CHECK_IN" || truck.status === "GROSS_IN") && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    Gross Weight
                  </CardTitle>
                  <CardDescription>
                    Enter the total weight of the loaded truck
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="gross">Gross Weight (kg) *</Label>
                      <Input
                        id="gross"
                        type="number"
                        value={gross}
                        onChange={(e) => setGross(e.target.value)}
                        placeholder="Enter gross weight"
                        className="mt-2"
                        disabled={truck.status === "CHECK_IN"}
                      />
                      {truck.status === "CHECK_IN" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Click "Start Gross Weighing" to enable input
                        </p>
                      )}
                    </div>
                    {truck.gross && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-800">
                          <CheckCircle2 className="h-4 w-4 inline mr-1" />
                          Gross weight recorded: {truck.gross} kg
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {(truck.status === "UNLOAD_LOOP" || truck.status === "BATCH_REJECT") && (
              <>
                {truck.status === "BATCH_REJECT" && (
                  <Card className="border-red-500 bg-red-50">
                    <CardHeader>
                      <CardTitle className="text-red-800 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Batch Rejected
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-red-700 mb-4">
                        This truck failed QA. Choose an action:
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => toast.info("Reload simulated")}>
                          Reload to Truck
                        </Button>
                        <Button variant="outline" onClick={() => toast.info("Routed to reject bay")}>
                          Route to Reject Bay
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {truck.status === "UNLOAD_LOOP" && (
                  <>
                    <Card className="border-blue-200">
                      <CardHeader>
                        <CardTitle>QA Progress</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{currentBales.length}</div>
                            <div className="text-xs text-muted-foreground">Total Bales</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{passedBales}</div>
                            <div className="text-xs text-muted-foreground">Passed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{failedBales}</div>
                            <div className="text-xs text-muted-foreground">Failed</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <BaleQAWidget
                      config={config}
                      baleType={truck.baleType}
                      onPass={handlePass}
                      onFail={handleFail}
                    />
                  </>
                )}
              </>
            )}

            {truck.status === "TARE_OUT" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Weight className="h-5 w-5" />
                    Tare Weight
                  </CardTitle>
                  <CardDescription>
                    Enter the weight of the empty truck
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="tare">Tare Weight (kg) *</Label>
                      <Input
                        id="tare"
                        type="number"
                        value={tare}
                        onChange={(e) => setTare(e.target.value)}
                        placeholder="Enter tare weight"
                        className="mt-2"
                      />
                    </div>
                    {truck.tare && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-800">
                          <CheckCircle2 className="h-4 w-4 inline mr-1" />
                          Tare weight recorded: {truck.tare} kg
                        </p>
                      </div>
                    )}
                    {truck.gross && tare && Number(tare) > 0 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800 font-medium">
                          Net Weight: {truck.gross - Number(tare)} kg
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {truck.status === "CLOSE_TRUCK_RECORD" && (
              <Card className="border-green-500 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Record Complete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-700 mb-4">
                    This truck record has been successfully completed.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Batch Decision:</span>
                      <Badge variant={truck.batchDecision === "Accepted" ? "default" : "destructive"}>
                        {truck.batchDecision}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Bales:</span>
                      <span className="font-medium">{currentBales.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gross Weight:</span>
                      <span className="font-medium">{truck.gross} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tare Weight:</span>
                      <span className="font-medium">{truck.tare} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Net Weight:</span>
                      <span className="font-medium">{truck.gross && truck.tare ? truck.gross - truck.tare : 0} kg</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Truck Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge className="ml-2">{truck.status.replace(/_/g, " ")}</Badge>
                </div>
                <div>
                  <span className="font-medium">Bale Count:</span> {currentBales.length}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {truck.baleType}
                </div>
                {truck.gross && (
                  <div>
                    <span className="font-medium">Gross:</span> {truck.gross} kg
                  </div>
                )}
                {truck.tare && (
                  <div>
                    <span className="font-medium">Tare:</span> {truck.tare} kg
                  </div>
                )}
                {truck.gross && truck.tare && (
                  <div>
                    <span className="font-medium">Net:</span> {truck.gross - truck.tare} kg
                  </div>
                )}
              </CardContent>
            </Card>

            {currentBales.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {currentBales.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No bales recorded yet
                      </p>
                    ) : (
                      currentBales.slice(-10).reverse().map((bale) => (
                        <div
                          key={bale.baleId}
                          className={`text-xs p-2 rounded border ${
                            bale.decision === "Pass"
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                          }`}
                        >
                          <p className="font-medium">{bale.baleId}</p>
                          <p>Moisture: {bale.moisturePct}% | {bale.weightKg} kg</p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {canAdvance && (
              <Button
                onClick={handleAdvanceStatus}
                className="w-full"
                size="lg"
                disabled={isAdvanceDisabled()}
              >
                {getAdvanceButtonText()}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <Dialog open={showPlaceDialog} onOpenChange={setShowPlaceDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Place Bale to Pyramid</DialogTitle>
              <DialogDescription>
                Select a pyramid to store this bale
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Select Pyramid</Label>
                <Select value={selectedPyramid} onValueChange={setSelectedPyramid}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose pyramid" />
                  </SelectTrigger>
                  <SelectContent>
                    {pyramids
                      .filter((p) => p.status === "Active")
                      .map((p) => (
                        <SelectItem key={p.pyramidId} value={p.pyramidId}>
                          {p.pyramidId} - Grade {p.qualityGrade}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handlePlaceBale} className="w-full" disabled={!selectedPyramid}>
                <Package className="h-4 w-4 mr-2" />
                Place Bale
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGate>
  );
}
