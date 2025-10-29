"use client";

import { useStore } from "@/lib/store";
import { useRolePermissions } from "@/hooks/use-role-permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/time";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AlertsPage() {
  const alerts = useStore((state) => state.alerts);
  const clearAlert = useStore((state) => state.clearAlert);
  const { canClearAlerts, currentRole } = useRolePermissions();

  const activeAlerts = alerts.filter((a) => !a.clearedAt);
  const clearedAlerts = alerts.filter((a) => a.clearedAt);

  const handleClear = (alertId: string) => {
    if (!canClearAlerts()) {
      toast.error("You don't have permission to clear alerts");
      return;
    }
    clearAlert(alertId);
    toast.success("Alert cleared");
  };

  const getSeverityColor = (severity: string) => {
    if (severity === "critical") return "bg-red-500";
    if (severity === "warn") return "bg-amber-500";
    return "bg-blue-500";
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Alerts Center</h1>
        <p className="text-muted-foreground">Monitor and manage system alerts</p>
      </div>

      {!canClearAlerts() && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            You are viewing alerts in read-only mode. Only Admin, Supervisor, and Operator roles can clear alerts.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Active Alerts ({activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeAlerts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No active alerts
              </p>
            ) : (
              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.alertId}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{alert.type}</Badge>
                      </div>
                      <p className="font-medium mb-1">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        Created: {formatDateTime(alert.createdAt)}
                      </p>
                    </div>
                    {canClearAlerts() && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClear(alert.alertId)}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Cleared Alerts ({clearedAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clearedAlerts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No cleared alerts
              </p>
            ) : (
              <div className="space-y-3">
                {clearedAlerts.slice(0, 10).map((alert) => (
                  <div
                    key={alert.alertId}
                    className="p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{alert.type}</Badge>
                    </div>
                    <p className="text-sm mb-1">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      Cleared: {alert.clearedAt && formatDateTime(alert.clearedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
