/** 11 цифр с ведущей 7 → значение для маски +7 (999) 999-99-99 */
export function formatRuPhoneFromDigits(digits: string): string {
  const d = digits.replace(/\D/g, '');
  if (d.length !== 11 || d[0] !== '7') {
    return '+7';
  }
  const r = d.slice(1);
  return `+7 (${r.slice(0, 3)}) ${r.slice(3, 6)}-${r.slice(6, 8)}-${r.slice(8, 10)}`;
}
