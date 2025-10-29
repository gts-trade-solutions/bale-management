"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Home,
  TruckIcon,
  Package,
  Users,
  AlertCircle,
  FileText,
  Settings,
  LogIn,
  Activity,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "@/lib/types";

const routes = [
  { href: "/", label: "Dashboard", icon: Home, roles: ["Admin", "Supervisor", "Operator", "Viewer"] },
  { href: "/check-in", label: "Check-In", icon: LogIn, roles: ["Admin", "Supervisor", "Operator"] },
  { href: "/trucks", label: "Trucks", icon: TruckIcon, roles: ["Admin", "Supervisor", "Operator"] },
  { href: "/pyramids", label: "Pyramids", icon: Package, roles: ["Admin", "Supervisor", "Operator", "Viewer"] },
  { href: "/processing", label: "Processing", icon: Activity, roles: ["Admin", "Supervisor", "Operator"] },
  { href: "/traceability", label: "Traceability", icon: Search, roles: ["Admin", "Supervisor", "Operator", "Viewer"] },
  { href: "/suppliers", label: "Suppliers", icon: Users, roles: ["Admin", "Supervisor"] },
  { href: "/alerts", label: "Alerts", icon: AlertCircle, roles: ["Admin", "Supervisor", "Operator", "Viewer"] },
  { href: "/reports", label: "Reports", icon: FileText, roles: ["Admin", "Supervisor"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["Admin", "Supervisor"] },
];

export function Navigation() {
  const pathname = usePathname();
  const currentRole = useStore((state) => state.session.currentRole);
  const updateSession = useStore((state) => state.updateSession);
  const activeAlertCount = useStore((state) => state.alerts.filter((a) => !a.clearedAt).length);

  const allowedRoutes = routes.filter((route) => route.roles.includes(currentRole));

  const handleRoleChange = (role: UserRole) => {
    updateSession({ currentRole: role });
    toast.success(`Role changed to ${role}`);
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Bale Management
            </Link>
            <div className="flex space-x-1">
              {allowedRoutes.map((route) => {
                const Icon = route.icon;
                const isActive = pathname === route.href;
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
                      transition-colors relative
                      ${
                        isActive
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {route.label}
                    {route.href === "/alerts" && activeAlertCount > 0 && (
                      <Badge variant="destructive" className="ml-1">
                        {activeAlertCount}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Role:</span>
            <Select value={currentRole} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Supervisor">Supervisor</SelectItem>
                <SelectItem value="Operator">Operator</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </nav>
  );
}
