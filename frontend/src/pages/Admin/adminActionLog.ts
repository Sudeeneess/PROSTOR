const STORAGE_KEY = 'prostor_admin_recent_actions';
const MAX_ENTRIES = 50;

export interface AdminActionEntry {
  time: string;
  action: string;
  userLabel: string;
  status: string;
}

function parseStored(): AdminActionEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter(
      (x): x is AdminActionEntry =>
        x != null &&
        typeof x === 'object' &&
        typeof (x as AdminActionEntry).action === 'string' &&
        typeof (x as AdminActionEntry).time === 'string'
    );
  } catch {
    return [];
  }
}

export function readAdminActions(): AdminActionEntry[] {
  return parseStored();
}

export function appendAdminAction(entry: Omit<AdminActionEntry, 'time'> & { time?: string }): void {
  const time =
    entry.time ??
    new Date().toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  const row: AdminActionEntry = {
    time,
    action: entry.action,
    userLabel: entry.userLabel,
    status: entry.status,
  };
  const next = [row, ...parseStored()].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
