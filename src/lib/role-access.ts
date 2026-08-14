import type { UserRole } from './types';

export interface RolePermissions {
  canViewGbvData: boolean;
  canExportData: boolean;
  canViewManagementCentre: boolean;
  canEditActivities: boolean;
  canApproveValidation: boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  ADMIN: {
    canViewGbvData: true,
    canExportData: true,
    canViewManagementCentre: true,
    canEditActivities: true,
    canApproveValidation: true,
  },
  AUTHORIZED_USER: {
    canViewGbvData: true,
    canExportData: true,
    canViewManagementCentre: true,
    canEditActivities: false,
    canApproveValidation: true,
  },
};

export function getCurrentRole(): UserRole | null {
  return null;
}

export function getRolePermissions(role?: UserRole): RolePermissions {
  return role ? ROLE_PERMISSIONS[role] : {
    canViewGbvData: false,
    canExportData: false,
    canViewManagementCentre: false,
    canEditActivities: false,
    canApproveValidation: false,
  };
}

export function hasPermission(permission: keyof RolePermissions, role?: UserRole): boolean {
  return getRolePermissions(role)[permission];
}
