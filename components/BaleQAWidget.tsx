"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle } from "lucide-react";
import type { BaleDecision, Config } from "@/lib/types";
import { classifyBale, computeDensity } from "@/lib/logic";

const baleQASchema = z.object({
  moisturePct: z.coerce.number().min(0).max(100),
  weightKg: z.coerce.number().min(1),
});

type BaleQAFormData = z.infer<typeof baleQASchema>;

interface BaleQAWidgetProps {
  config: Config;
  baleType: string;
  onPass: (data: { moisturePct: number; weightKg: number; density: number }) => void;
  onFail: (data: { moisturePct: number; weightKg: number; density: number }) => void;
}

export function BaleQAWidget({ config, baleType, onPass, onFail }: BaleQAWidgetProps) {
  const [result, setResult] = useState<{ decision: BaleDecision; density: number } | null>(
    null
  );

  const form = useForm<BaleQAFormData>({
    resolver: zodResolver(baleQASchema),
    defaultValues: {
      moisturePct: 0,
      weightKg: 0,
    },
  });

  const handleSubmit = (data: BaleQAFormData) => {
    const decision = classifyBale(data.moisturePct, "Straw", config);
    const density = computeDensity(data.weightKg, baleType);

    setResult({ decision, density });

    const payload = { ...data, density };

    if (decision === "Pass") {
      onPass(payload);
    } else {
      onFail(payload);
    }

    form.reset();
    setTimeout(() => setResult(null), 3000);
  };

  const threshold = config.speciesThresholds.Straw.rejectPct;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bale QA Widget</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="moisturePct"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moisture %</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Threshold: ≤{threshold}% Pass, &gt;{threshold}% Fail
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weightKg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="0.0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Record Bale
            </Button>
          </form>
        </Form>

        {result && (
          <div
            className={`mt-4 p-4 rounded-md flex items-center gap-2 ${
              result.decision === "Pass"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {result.decision === "Pass" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <div>
              <p className="font-semibold">{result.decision}</p>
              <p className="text-sm">Density: {result.density.toFixed(2)} kg/m³</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
