"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { TruckCheckInForm } from "@/components/TruckCheckInForm";
import { RoleGate } from "@/components/RoleGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { nowISO } from "@/lib/time";

export default function CheckInPage() {
  const router = useRouter();
  const suppliers = useStore((state) => state.suppliers);
  const addTruck = useStore((state) => state.addTruck);
  const addEvent = useStore((state) => state.addEvent);
  const session = useStore((state) => state.session);

  const handleSubmit = (data: any) => {
    const truckId = `TRK${Date.now()}`;

    addTruck({
      truckId,
      driverCardId: data.driverCardId,
      driverName: data.driverName,
      driverPhone: data.driverPhone,
      driverLicense: data.driverLicense,
      vehicleRegistration: data.vehicleRegistration,
      supplierId: data.supplierId,
      lot: data.lot,
      source: data.source,
      baleType: data.baleType,
      inTime: nowISO(),
      status: "CHECK_IN",
      baleCount: 0,
      expectedBaleCount: data.expectedBaleCount ? Number(data.expectedBaleCount) : undefined,
      estimatedUnloadDuration: data.estimatedUnloadDuration ? Number(data.estimatedUnloadDuration) : undefined,
      temperatureAtArrival: data.temperatureAtArrival ? Number(data.temperatureAtArrival) : undefined,
      weatherConditions: data.weatherConditions,
      specialInstructions: data.specialInstructions,
      previousVisitReference: data.previousVisitReference,
      notes: data.notes,
      vehicleImage: data.vehicleImage,
      driverLicenseImage: data.driverLicenseImage,
      insuranceDocImage: data.insuranceDocImage,
      registrationDocImage: data.registrationDocImage,
    });

    addEvent({
      eventId: `EVT${Date.now()}`,
      scope: "Truck",
      actor: session.operatorId,
      change: `${truckId} checked in from ${data.source} - Driver: ${data.driverName}`,
      ts: nowISO(),
    });

    toast.success("Truck checked in successfully!");
    router.push(`/trucks/${truckId}`);
  };

  return (
    <RoleGate allowedRoles={["Admin", "Supervisor", "Operator"]}>
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Driver Check-In</h1>
          <p className="text-muted-foreground">Register a new truck arrival</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Truck Details</CardTitle>
          </CardHeader>
          <CardContent>
            <TruckCheckInForm suppliers={suppliers} onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      </div>
    </RoleGate>
  );
}
