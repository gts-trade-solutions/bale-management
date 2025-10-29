"use client";

import { memo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, XCircle, X } from "lucide-react";
import { useRolePermissions } from "@/hooks/use-role-permissions";
import type { Alert as AlertType } from "@/lib/types";

interface AlertBannerProps {
  alerts: AlertType[];
  onClear?: (alertId: string) => void;
}

export const AlertBanner = memo(function AlertBanner({ alerts, onClear }: AlertBannerProps) {
  const activeAlerts = alerts.filter((a) => !a.clearedAt);
  const { canClearAlerts } = useRolePermissions();

  if (activeAlerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {activeAlerts.slice(0, 5).map((alert) => {
        const variant =
          alert.severity === "critical"
            ? "destructive"
            : alert.severity === "warn"
            ? "default"
            : "default";

        const Icon =
          alert.severity === "critical"
            ? XCircle
            : alert.severity === "warn"
            ? AlertTriangle
            : Info;

        return (
          <Alert key={alert.alertId} variant={variant}>
            <Icon className="h-4 w-4" />
            <AlertTitle className="flex items-center justify-between">
              <span>{alert.type} Alert</span>
              {onClear && canClearAlerts() && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onClear(alert.alertId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
});
