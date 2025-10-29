"use client";

import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { PyramidGrid } from "@/components/PyramidGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, History, AlertCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function PyramidDetailPage() {
  const params = useParams();
  const pyramidId = params.id as string;
  const pyramids = useStore((state) => state.pyramids);
  const slots = useStore((state) => state.slots);
  const bales = useStore((state) => state.bales);

  const pyramid = pyramids.find((p) => p.pyramidId === pyramidId);

  if (!pyramid) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Pyramid Not Found</h2>
            <p className="text-muted-foreground mb-4">The pyramid you're looking for doesn't exist.</p>
            <Link href="/pyramids">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Pyramids
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pyramidBales = bales.filter((b) => b.pyramidId === pyramid.pyramidId);
  const pyramidSlots = slots.filter((s) => s.pyramidId === pyramid.pyramidId);

  const recentActivity = pyramidSlots
    .filter((s) => s.placedTs)
    .sort((a, b) => new Date(b.placedTs!).getTime() - new Date(a.placedTs!).getTime())
    .slice(0, 5);

  const handleExport = () => {
    const csvContent = [
      ['Bale ID', 'Moisture %', 'Weight (kg)', 'Position', 'Placed At', 'Decision'],
      ...pyramidBales.map((bale) => [
        bale.baleId,
        bale.moisturePct.toFixed(2),
        bale.weightKg.toString(),
        bale.slot ? `(${bale.slot.x},${bale.slot.y},${bale.slot.z})` : 'N/A',
        format(new Date(bale.ts), 'yyyy-MM-dd HH:mm:ss'),
        bale.decision,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pyramid.pyramidId}_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/pyramids">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Pyramid {pyramid.pyramidId}</h1>
            <p className="text-muted-foreground">Grade {pyramid.qualityGrade} | Zone {pyramid.zone}</p>
          </div>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <PyramidGrid pyramid={pyramid} slots={slots} bales={bales} />

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((slot) => {
                  const bale = bales.find((b) => b.baleId === slot.baleId);
                  return (
                    <div key={slot.slotId} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{slot.baleId}</p>
                        <p className="text-xs text-muted-foreground">
                          Position: ({slot.x}, {slot.y}, {slot.z})
                        </p>
                      </div>
                      <div className="text-right">
                        {bale && (
                          <Badge variant={bale.decision === "Pass" ? "default" : "destructive"} className="mb-1">
                            {bale.moisturePct.toFixed(1)}%
                          </Badge>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {slot.placedTs && format(new Date(slot.placedTs), "MMM d, HH:mm")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pyramid Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-muted-foreground">Pyramid ID</span>
                <span className="font-medium">{pyramid.pyramidId}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-muted-foreground">Quality Grade</span>
                <Badge className={pyramid.qualityGrade === "A" ? "bg-green-600" : "bg-amber-600"}>
                  Grade {pyramid.qualityGrade}
                </Badge>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-muted-foreground">Zone</span>
                <span className="font-medium">{pyramid.zone}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={pyramid.status === "Active" ? "default" : "secondary"}>
                  {pyramid.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-muted-foreground">Dimensions</span>
                <span className="font-medium">
                  {pyramid.shape.x} × {pyramid.shape.y} × {pyramid.shape.z}
                </span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm text-muted-foreground">Capacity</span>
                <span className="font-medium">{pyramid.capacity} bales</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Base Position</span>
                <span className="font-medium">
                  ({pyramid.x0}, {pyramid.y0}, {pyramid.z0})
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
