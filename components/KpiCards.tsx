"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, Clock, AlertTriangle } from "lucide-react";

interface KpiCardsProps {
  onHandA: number;
  onHandB: number;
  daysCoverA: number;
  daysCoverB: number;
  todayThroughput: number;
  failRate: number;
}

export const KpiCards = memo(function KpiCards({
  onHandA,
  onHandB,
  daysCoverA,
  daysCoverB,
  todayThroughput,
  failRate,
}: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">On-Hand Inventory</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {onHandA + onHandB} bales
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            <span className="text-green-600 font-medium">Grade A: {onHandA}</span>
            {" | "}
            <span className="text-amber-600 font-medium">Grade B: {onHandB}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Days Cover</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.min(daysCoverA, daysCoverB)} days
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            <span className="text-green-600 font-medium">A: {daysCoverA}d</span>
            {" | "}
            <span className="text-amber-600 font-medium">B: {daysCoverB}d</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Today Throughput</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayThroughput}</div>
          <p className="text-xs text-muted-foreground mt-1">
            bales processed today
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Fail Rate (24h)</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${failRate > 5 ? "text-red-600" : ""}`}>
            {failRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            last 24 hours
          </p>
        </CardContent>
      </Card>
    </div>
  );
});
