import { useStore } from "@/lib/store";
import type { UserRole } from "@/lib/types";

export function useRolePermissions() {
  const currentRole = useStore((state) => state.session.currentRole);

  const canModifySettings = () => {
    return ["Admin", "Supervisor"].includes(currentRole);
  };

  const canClearAlerts = () => {
    return ["Admin", "Supervisor", "Operator"].includes(currentRole);
  };

  const canManageTrucks = () => {
    return ["Admin", "Supervisor", "Operator"].includes(currentRole);
  };

  const canManageSuppliers = () => {
    return ["Admin", "Supervisor"].includes(currentRole);
  };

  const canExportReports = () => {
    return ["Admin", "Supervisor"].includes(currentRole);
  };

  const canCheckInTrucks = () => {
    return ["Admin", "Supervisor", "Operator"].includes(currentRole);
  };

  const canPerformQA = () => {
    return ["Admin", "Supervisor", "Operator"].includes(currentRole);
  };

  const hasRole = (roles: UserRole[]) => {
    return roles.includes(currentRole);
  };

  return {
    currentRole,
    canModifySettings,
    canClearAlerts,
    canManageTrucks,
    canManageSuppliers,
    canExportReports,
    canCheckInTrucks,
    canPerformQA,
    hasRole,
  };
}
