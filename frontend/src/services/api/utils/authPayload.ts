import type { LoginResponse } from '../types/auth';
import { normalizeRole } from './roles';

/** Выбор роли из списка authorities (не только [0] — порядок в Spring не гарантирован). */
function pickRoleFromAuthorities(authorities: unknown): string {
  if (!Array.isArray(authorities)) return '';
  const normalized = authorities
    .filter((a): a is string => typeof a === 'string' && a.length > 0)
    .map((a) => normalizeRole(a));
  const priority = ['admin', 'warehouse_manager', 'seller', 'customer', 'user'];
  for (const p of priority) {
    if (normalized.includes(p)) return p;
  }
  return normalized[0] ?? '';
}

function pickToken(body: Record<string, unknown>): string | undefined {
  const t = body.token ?? body.accessToken ?? body.access_token;
  return typeof t === 'string' && t.length > 0 ? t : undefined;
}

function unwrapAuthBody(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return {};
  const o = raw as Record<string, unknown>;
  const inner = o.data;
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    /** Поля вроде customerId могут быть снаружи `data`, а токен — внутри; не теряем верхний уровень. */
    return { ...o, ...(inner as Record<string, unknown>) };
  }
  return o;
}

/** Положительный целочисленный id профиля из ответа логина (customerId и т.п.). */
export function parsePositiveIntId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number.parseInt(value.trim(), 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

export function parseLoginPayload(raw: unknown): LoginResponse | null {
  const body = unwrapAuthBody(raw);
  const token = pickToken(body);
  if (!token) return null;
  const username =
    (typeof body.username === 'string' && body.username) ||
    (typeof body.sub === 'string' && body.sub) ||
    '';
  const roleFromField = typeof body.role === 'string' ? body.role.trim() : '';
  const roleFromAuthorities = pickRoleFromAuthorities(body.authorities);
  const roleRaw =
    roleFromField ||
    (roleFromAuthorities.trim() ? roleFromAuthorities : '') ||
    'customer';
  const type = typeof body.type === 'string' ? body.type : 'Bearer';
  const expiresIn =
    typeof body.expiresIn === 'number'
      ? body.expiresIn
      : typeof body.expires_in === 'number'
        ? body.expires_in
        : undefined;
  const redirectUrl =
    typeof body.redirectUrl === 'string'
      ? body.redirectUrl
      : typeof body.redirect_url === 'string'
        ? body.redirect_url
        : '';
  const customerId =
    parsePositiveIntId(body.customerId) ?? parsePositiveIntId(body.customer_id);
  const result: LoginResponse = {
    token,
    type,
    username,
    role: normalizeRole(roleRaw),
    expiresIn: expiresIn ?? 0,
    redirectUrl: redirectUrl ?? '',
  };
  if (customerId != null) {
    result.customerId = customerId;
  }
  return result;
}
