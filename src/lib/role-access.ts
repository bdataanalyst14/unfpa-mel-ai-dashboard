import type { UserRole } from './types';

export interface RolePermissions {
  canViewGbvData: boolean;
  canExportData: boolean;
  canViewManagementCentre: boolean;
  canEditActivities: boolean;
  canApproveValidation: boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewGbvData: true,
    canExportData: true,
    canViewManagementCentre: true,
    canEditActivities: true,
    canApproveValidation: true,
  },
  manager: {
    canViewGbvData: true,
    canExportData: true,
    canViewManagementCentre: true,
    canEditActivities: false,
    canApproveValidation: true,
  },
  viewer: {
    canViewGbvData: false,
    canExportData: false,
    canViewManagementCentre: true,
    canEditActivities: false,
    canApproveValidation: false,
  },
};

export function getCurrentRole(): UserRole {
  return 'manager'; // stub - replace with auth integration when required
}

export function getRolePermissions(role?: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role ?? getCurrentRole()];
}

export function hasPermission(permission: keyof RolePermissions, role?: UserRole): boolean {
  return getRolePermissions(role)[permission];
}
