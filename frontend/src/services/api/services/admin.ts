import type { RequestFn } from '../client';
import type {
  AdminUserDto,
  AdminDashboardStats,
  AdminUserCreateBody,
  AdminDebugRoleRow,
  AdministratorEntryDto,
} from '../types/adminUser';

export function createAdminService(request: RequestFn) {
  return {
    getAdminDashboardStats(): Promise<AdminDashboardStats> {
      return request<AdminDashboardStats>('/api/admin/dashboard/stats');
    },

    getAdminSystemInfo(): Promise<Record<string, unknown>> {
      return request<Record<string, unknown>>('/api/admin/system/info');
    },

    getAdminHealth(): Promise<Record<string, string>> {
      return request<Record<string, string>>('/api/admin/health');
    },

    getAdminUsers(): Promise<AdminUserDto[]> {
      return request<AdminUserDto[]>('/api/admin/users');
    },

    getAdminUser(id: number): Promise<AdminUserDto> {
      return request<AdminUserDto>(`/api/admin/users/${id}`);
    },

    getAdminUserByUsername(username: string): Promise<AdminUserDto> {
      const enc = encodeURIComponent(username);
      return request<AdminUserDto>(`/api/admin/users/username/${enc}`);
    },

    getAdminUsersByRole(roleId: number): Promise<AdminUserDto[]> {
      return request<AdminUserDto[]>(`/api/admin/users/role/${roleId}`);
    },

    createAdminUser(body: AdminUserCreateBody): Promise<AdminUserDto> {
      return request<AdminUserDto>('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },

    updateAdminUser(id: number, body: AdminUserCreateBody): Promise<AdminUserDto> {
      return request<AdminUserDto>(`/api/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    },

    deleteAdminUser(id: number): Promise<void> {
      return request<void>(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });
    },

    getAdminAdministrators(): Promise<AdministratorEntryDto[]> {
      return request<AdministratorEntryDto[]>('/api/admin/admins');
    },

    /** Справочник ролей (id + имя). Требует роль ADMIN. */
    getDebugRoles(): Promise<AdminDebugRoleRow[]> {
      return request<AdminDebugRoleRow[]>('/api/debug/roles');
    },
  };
}
