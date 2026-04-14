import type { LoginResponse } from '../types/auth';

/** Роль из JWT/API: ADMIN, ROLE_CUSTOMER, customer → каноническое имя для guards. */
export function normalizeRole(role: string | undefined | null): string {
  if (role == null || String(role).trim() === '') return 'customer';
  let r = String(role).trim().toLowerCase().replace(/^role_/, '');
  if (r === 'administrator') r = 'admin';
  if (r === 'warehouse' || r === 'warehousemanager' || r === 'warehouse_manager')
    r = 'warehouse_manager';
  return r;
}

/** Роль считается покупательской (витрина + личный кабинет клиента). */
export function isBuyerPortalRole(role: string | undefined | null): boolean {
  const r = (role ?? '').toLowerCase();
  return r === 'customer' || r === 'user';
}

function defaultPathForRole(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'seller':
      return '/seller/dashboard';
    case 'warehouse_manager':
      return '/warehouse/dashboard';
    default:
      return '/customer';
  }
}

/** Разрешить redirectUrl только если путь соответствует роли (иначе ловим «покупатель → /seller»). */
function isRedirectAllowedForRole(role: string, pathnameWithQuery: string): boolean {
  const path = pathnameWithQuery.split('#')[0] ?? pathnameWithQuery;
  const pathname = path.split('?')[0] || path;
  switch (role) {
    case 'admin':
      return pathname === '/admin' || pathname.startsWith('/admin/');
    case 'seller':
      return pathname.startsWith('/seller');
    case 'warehouse_manager':
      return pathname.startsWith('/warehouse');
    case 'customer':
    case 'user':
      return (
        pathname.startsWith('/customer') ||
        pathname.startsWith('/profile') ||
        pathname.startsWith('/orders') ||
        pathname.startsWith('/basket') ||
        pathname.startsWith('/order-formalization') ||
        pathname.startsWith('/catalog') ||
        pathname.startsWith('/product/')
      );
    default:
      return pathname.startsWith('/customer') || pathname.startsWith('/profile');
  }
}

/** Куда вести после успешного логина (redirectUrl от API только если безопасен для роли). */
export function resolveAfterLogin(data: LoginResponse): string {
  const fallback = defaultPathForRole(data.role);
  const url = data.redirectUrl?.trim();
  if (url) {
    try {
      let path = '';
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const u = new URL(url);
        if (u.origin === window.location.origin) {
          path = `${u.pathname}${u.search}${u.hash}`;
        }
      } else if (url.startsWith('/')) {
        path = url;
      }
      if (path && isRedirectAllowedForRole(data.role, path)) {
        return path;
      }
    } catch {
      /* ignore */
    }
  }
  return fallback;
}
