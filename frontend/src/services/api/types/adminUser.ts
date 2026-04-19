export interface AdminRoleDto {
  id: number;
  name: string;
}

export interface AdminUserDto {
  id: number;
  userName: string;
  contactPhone: string;
  createdAt?: string;
  role: AdminRoleDto;
}

/** Ответ GET /api/admin/dashboard/stats */
export interface AdminDashboardStats {
  totalUsers: number;
  totalAdmins: number;
  activeSessions: string;
}

/** Тело POST/PUT /api/admin/users */
export interface AdminUserCreateBody {
  userName: string;
  password: string;
  contactPhone: string;
  roleId: number;
}

/** Элемент GET /api/debug/roles */
export interface AdminDebugRoleRow {
  role_id: number;
  role_name: string;
  users_count: number;
}

export interface AdministratorEntryDto {
  id: number;
  userId: number;
}
