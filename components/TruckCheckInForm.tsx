"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSection } from "@/components/ui/form-section";
import { ImageUpload } from "@/components/ui/image-upload";
import type { Supplier, BaleType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

const checkInSchema = z.object({
  driverName: z.string().min(1, "Driver name is required"),
  driverPhone: z.string().min(1, "Driver phone is required"),
  driverLicense: z.string().min(1, "Driver license number is required"),
  driverCardId: z.string().optional(),
  vehicleRegistration: z.string().min(1, "Vehicle registration is required"),
  supplierId: z.string().min(1, "Supplier is required"),
  lot: z.string().min(1, "Lot/PO is required"),
  source: z.string().min(1, "Source is required"),
  baleType: z.enum(["Midi", "Legacy70", "Legacy130"]),
  expectedBaleCount: z.string().optional(),
  estimatedUnloadDuration: z.string().optional(),
  temperatureAtArrival: z.string().optional(),
  weatherConditions: z.string().optional(),
  specialInstructions: z.string().optional(),
  previousVisitReference: z.string().optional(),
  notes: z.string().optional(),
  vehicleImage: z.string().optional(),
  driverLicenseImage: z.string().optional(),
  insuranceDocImage: z.string().optional(),
  registrationDocImage: z.string().optional(),
});

type CheckInFormData = z.infer<typeof checkInSchema>;

interface TruckCheckInFormProps {
  suppliers: Supplier[];
  onSubmit: (data: CheckInFormData) => void;
}

export function TruckCheckInForm({ suppliers, onSubmit }: TruckCheckInFormProps) {
  const form = useForm<CheckInFormData>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      driverName: "",
      driverPhone: "",
      driverLicense: "",
      driverCardId: "",
      vehicleRegistration: "",
      supplierId: "",
      lot: "",
      source: "",
      baleType: "Midi",
      expectedBaleCount: "",
      estimatedUnloadDuration: "",
      temperatureAtArrival: "",
      weatherConditions: "",
      specialInstructions: "",
      previousVisitReference: "",
      notes: "",
      vehicleImage: "",
      driverLicenseImage: "",
      insuranceDocImage: "",
      registrationDocImage: "",
    },
  });

  const watchedFields = form.watch();
  const requiredFields = [
    "driverName",
    "driverPhone",
    "driverLicense",
    "vehicleRegistration",
    "supplierId",
    "lot",
    "source",
    "baleType",
  ];

  const filledRequired = requiredFields.filter(
    (field) => watchedFields[field as keyof CheckInFormData]
  ).length;
  const completionPct = Math.round((filledRequired / requiredFields.length) * 100);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-muted/30 rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Form Completion</span>
            <Badge variant={completionPct === 100 ? "default" : "secondary"}>
              {completionPct}%
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          {completionPct === 100 && (
            <div className="flex items-center gap-2 mt-2 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" />
              <span>All required fields completed</span>
            </div>
          )}
        </div>

        <FormSection
          title="Driver Information"
          description="Enter driver details and identification"
          defaultOpen={true}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="driverName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Driver Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="driverPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Driver Phone <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="+1 234 567 8900" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="driverLicense"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Driver License Number <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="DL123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="driverCardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver Card ID</FormLabel>
                  <FormControl>
                    <Input placeholder="DRV12345" {...field} />
                  </FormControl>
                  <FormDescription>Optional access card ID</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        <FormSection
          title="Vehicle and Load Information"
          description="Details about the vehicle, cargo, and delivery"
          defaultOpen={true}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="vehicleRegistration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Vehicle Registration <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="ABC-1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Supplier <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers
                        .filter((s) => s.status !== "inactive")
                        .map((s) => (
                          <SelectItem key={s.supplierId} value={s.supplierId}>
                            {s.name} (Tier {s.tier})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Lot / PO Number <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="LOT-2024-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Source <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Farm A, District 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="baleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Bale Type <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Midi">Midi</SelectItem>
                      <SelectItem value="Legacy70">Legacy 70</SelectItem>
                      <SelectItem value="Legacy130">Legacy 130</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="previousVisitReference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Previous Visit Reference</FormLabel>
                  <FormControl>
                    <Input placeholder="TRK12345678" {...field} />
                  </FormControl>
                  <FormDescription>
                    Previous truck ID if returning driver
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expectedBaleCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Bale Count</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="250" {...field} />
                  </FormControl>
                  <FormDescription>Estimated number of bales</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedUnloadDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unload Duration (min)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="120" {...field} />
                  </FormControl>
                  <FormDescription>Expected duration in minutes</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="temperatureAtArrival"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperature (°C)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="25" {...field} />
                  </FormControl>
                  <FormDescription>Temperature at arrival</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weatherConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weather Conditions</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select weather" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Sunny">Sunny</SelectItem>
                      <SelectItem value="Cloudy">Cloudy</SelectItem>
                      <SelectItem value="Rainy">Rainy</SelectItem>
                      <SelectItem value="Windy">Windy</SelectItem>
                      <SelectItem value="Foggy">Foggy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialInstructions"
              render={({ field }) => (
                <FormItem className="sm:col-span-2 lg:col-span-3">
                  <FormLabel>Special Handling Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special requirements or handling instructions..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="sm:col-span-2 lg:col-span-3">
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes or observations..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        <FormSection
          title="Document Uploads"
          description="Upload required documents and images"
          defaultOpen={false}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="vehicleImage"
              render={({ field }) => (
                <FormItem>
                  <ImageUpload
                    label="Vehicle Image"
                    description="Photo of the vehicle for identification"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="driverLicenseImage"
              render={({ field }) => (
                <FormItem>
                  <ImageUpload
                    label="Driver License Image"
                    description="Photo of driver's license"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="insuranceDocImage"
              render={({ field }) => (
                <FormItem>
                  <ImageUpload
                    label="Insurance Document"
                    description="Vehicle insurance documentation"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="registrationDocImage"
              render={({ field }) => (
                <FormItem>
                  <ImageUpload
                    label="Registration Document"
                    description="Vehicle registration document"
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        <Button type="submit" className="w-full" size="lg">
          Start Truck Check-In
        </Button>
      </form>
    </Form>
  );
}
