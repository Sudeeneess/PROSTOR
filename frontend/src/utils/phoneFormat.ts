/** 11 цифр с ведущей 7 → значение для маски +7 (999) 999-99-99 */
export function formatRuPhoneFromDigits(digits: string): string {
  const d = digits.replace(/\D/g, '');
  if (d.length !== 11 || d[0] !== '7') {
    return '+7';
  }
  const r = d.slice(1);
  return `+7 (${r.slice(0, 3)}) ${r.slice(3, 6)}-${r.slice(6, 8)}-${r.slice(8, 10)}`;
}

/* пользовательский ввод в вид +7 (999) 999-99-99 c поддержкой частичного ввода */
export function formatRuPhoneInput(value: string): string {
  const onlyDigits = value.replace(/\D/g, '');

  if (!onlyDigits) {
    return '+7';
  }

  let normalized = onlyDigits;
  if (normalized[0] === '8') {
    normalized = `7${normalized.slice(1)}`;
  } else if (normalized[0] !== '7') {
    normalized = `7${normalized}`;
  }

  normalized = normalized.slice(0, 11);
  const rest = normalized.slice(1);

  if (!rest) {
    return '+7';
  }

  let formatted = '+7';
  if (rest.length > 0) {
    formatted += ` (${rest.slice(0, 3)}`;
  }
  if (rest.length >= 4) {
    formatted += ') ';
    formatted += rest.slice(3, 6);
  }
  if (rest.length >= 7) {
    formatted += `-${rest.slice(6, 8)}`;
  }
  if (rest.length >= 9) {
    formatted += `-${rest.slice(8, 10)}`;
  }

  return formatted;
}
