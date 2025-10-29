"use client";

import { useStore } from "@/lib/store";
import type { UserRole } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ allowedRoles, children, fallback }: RoleGateProps) {
  const currentRole = useStore((state) => state.session.currentRole);

  if (!allowedRoles.includes(currentRole)) {
    return (
      fallback || (
        <div className="container mx-auto py-8">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              Access denied. Required role: {allowedRoles.join(" or ")}
            </AlertDescription>
          </Alert>
        </div>
      )
    );
  }

  return <>{children}</>;
}
