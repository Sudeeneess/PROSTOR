
export function extractApiErrorMessage(data: unknown): string {
  if (data == null) return '';
  if (typeof data === 'string') return data;
  if (typeof data !== 'object') return '';
  const o = data as Record<string, unknown>;
  if (typeof o.message === 'string') return o.message;
  if (typeof o.error === 'string') return o.error;
  const pieces: string[] = [];
  for (const v of Object.values(o)) {
    if (typeof v === 'string' && v.length) pieces.push(v);
    else if (Array.isArray(v))
      for (const x of v) {
        if (typeof x === 'string') pieces.push(x);
      }
  }
  return pieces.join(' ') || '';
}
