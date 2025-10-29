"use client";

import { useEffect, useRef, useMemo } from "react";
import { useStore } from "@/lib/store";
import { generateSeedData } from "@/lib/seed";
import { KpiCards } from "@/components/KpiCards";
import { AlertBanner } from "@/components/AlertBanner";
import {
  onHandByGrade,
  daysCoverByGrade,
  todayThroughput,
  failRate,
  moistureSeries,
  throughputSeries,
} from "@/lib/selectors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const initRef = useRef(false);
  const bales = useStore((state) => state.bales);
  const pyramids = useStore((state) => state.pyramids);
  const suppliers = useStore((state) => state.suppliers);
  const alerts = useStore((state) => state.alerts);
  const config = useStore((state) => state.config);
  const clearAlert = useStore((state) => state.clearAlert);
  const resetAllData = useStore((state) => state.resetAllData);

  useEffect(() => {
    if (!initRef.current && bales.length === 0) {
      initRef.current = true;
      const seedData = generateSeedData();
      resetAllData(seedData);
    }
  }, []);

  const onHand = useMemo(() => onHandByGrade(bales, pyramids), [bales, pyramids]);
  const daysCover = useMemo(() => daysCoverByGrade(bales, pyramids, config.dailyUsageByGrade), [bales, pyramids, config.dailyUsageByGrade]);
  const throughput = useMemo(() => todayThroughput(bales), [bales]);
  const fail = useMemo(() => failRate(bales, 24), [bales]);

  const moistureData = useMemo(() => moistureSeries(bales, 50), [bales]);
  const throughputData = useMemo(() => throughputSeries(bales, 24), [bales]);

  const tierData = useMemo(() => [
    { name: "Tier 1", value: suppliers.filter((s) => s.tier === 1).length, color: "#22c55e" },
    { name: "Tier 2", value: suppliers.filter((s) => s.tier === 2).length, color: "#f59e0b" },
    { name: "Tier 3", value: suppliers.filter((s) => s.tier === 3).length, color: "#ef4444" },
  ], [suppliers]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Real-time bale management overview</p>
        </div>
      </div>

      <AlertBanner alerts={alerts} onClear={clearAlert} />

      <KpiCards
        onHandA={onHand.A}
        onHandB={onHand.B}
        daysCoverA={daysCover.A}
        daysCoverB={daysCover.B}
        todayThroughput={throughput}
        failRate={fail}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Moisture Distribution (Last 50 Bales)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={moistureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ts" tickFormatter={(v) => ""} />
                <YAxis label={{ value: "Moisture %", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  labelFormatter={(v) => new Date(v).toLocaleString()}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Moisture"]}
                />
                <Bar dataKey="moisture" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hourly Throughput (Last 24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={throughputData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis label={{ value: "Bales", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supplier Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tierData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.alertId} className="text-sm border-l-4 border-amber-400 pl-3 py-2">
                  <p className="font-medium">{alert.type} Alert</p>
                  <p className="text-muted-foreground text-xs">{alert.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
