import type { Product } from '../services/api';

export type ReceptionBatchKey = string;

export const RECEPTION_LAST_SELLER_ID = 'warehouse_reception_last_seller_id';
const SELLER_SNAPSHOT_KEY = (sellerId: number) => `warehouse_reception_seller_snapshot_${sellerId}`;
export const sellerLoginStorageKey = (sellerId: number) => `warehouse_reception_seller_login_${sellerId}`;
const STATUS_KEY = (sellerId: number, dateKey: string) =>
  `warehouse_reception_v1:status:${sellerId}:${dateKey}`;

export interface ReceptionSellerSnapshot {
  sellerId: number;
  username?: string;
  orgLine: string;
  inn?: string;
  updatedAt: string;
}

export function localDateKeyFromCreatedAt(iso?: string | null): string | null {
  if (!iso?.trim()) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDateKeyRu(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return dateKey;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function syncSellerSnapshotFromLk(sellerId: number): void {
  try {
    const profRaw = localStorage.getItem('sellerProfile');
    const prof = profRaw ? (JSON.parse(profRaw) as Record<string, string>) : {};
    const username = sessionStorage.getItem('userName')?.trim() ?? '';
    if (username) {
      localStorage.setItem(sellerLoginStorageKey(sellerId), username);
    }
    const orgForm = prof.orgForm ?? '';
    const fio = prof.fio ?? '';
    const inn = prof.inn ?? '';
    const orgLine =
      [orgForm, fio].filter((s) => s && String(s).trim()).join(' · ') || username || '';
    const payload: ReceptionSellerSnapshot = {
      sellerId,
      username: username || undefined,
      orgLine: orgLine || username || `seller_id ${sellerId}`,
      inn: inn || undefined,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(SELLER_SNAPSHOT_KEY(sellerId), JSON.stringify(payload));
  } catch {
  }
}

export function getSellerDisplayForReception(sellerId: number): { title: string; subtitle?: string } {
  const storedLogin = localStorage.getItem(sellerLoginStorageKey(sellerId))?.trim();
  const raw = localStorage.getItem(SELLER_SNAPSHOT_KEY(sellerId));
  let snap: ReceptionSellerSnapshot | null = null;
  if (raw) {
    try {
      snap = JSON.parse(raw) as ReceptionSellerSnapshot;
    } catch {
      snap = null;
    }
  }

  const login = storedLogin || snap?.username?.trim();
  const org = snap?.orgLine?.trim();
  const inn = snap?.inn?.trim();
  const orgLooksSynthetic = !org || org.startsWith('seller_id ');

  const subtitleParts: string[] = [];
  if (login) subtitleParts.push(login);
  if (inn) subtitleParts.push(`ИНН ${inn}`);

  if (!orgLooksSynthetic && org) {
    const sub = subtitleParts.length > 0 ? subtitleParts.join(' · ') : undefined;
    return { title: org, subtitle: sub };
  }

  if (login) {
    return {
      title: login,
      subtitle: inn ? `ИНН ${inn}` : undefined,
    };
  }

  return { title: `seller_id ${sellerId}` };
}

export function getReceptionBatchStatus(sellerId: number, dateKey: string): 'pending' | 'accepted' {
  return localStorage.getItem(STATUS_KEY(sellerId, dateKey)) === 'accepted' ? 'accepted' : 'pending';
}

export function setReceptionBatchAccepted(sellerId: number, dateKey: string): void {
  localStorage.setItem(STATUS_KEY(sellerId, dateKey), 'accepted');
}

export interface ReceptionBatch {
  key: ReceptionBatchKey;
  sellerId: number;
  dateKey: string;
  products: Product[];
}

export function buildReceptionBatches(products: Product[]): ReceptionBatch[] {
  const map = new Map<ReceptionBatchKey, Product[]>();
  for (const p of products) {
    if (p.sellerId == null) continue;
    const dk = localDateKeyFromCreatedAt(p.createdAt);
    if (!dk) continue;
    const key: ReceptionBatchKey = `${p.sellerId}|${dk}`;
    const list = map.get(key) ?? [];
    list.push(p);
    map.set(key, list);
  }
  const batches: ReceptionBatch[] = [];
  for (const [key, list] of map) {
    const [sid, dateKey] = key.split('|');
    batches.push({
      key,
      sellerId: Number(sid),
      dateKey,
      products: list.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return ta - tb;
      }),
    });
  }
  batches.sort((a, b) => {
    if (a.dateKey !== b.dateKey) return a.dateKey < b.dateKey ? 1 : -1;
    return a.sellerId - b.sellerId;
  });
  return batches;
}
