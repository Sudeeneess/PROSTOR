/** Допустимые символы при вводе ФИО (кириллица, латиница, пробел, дефис). */
const FIO_STRIP = /[^а-яёА-ЯЁa-zA-Z\s\-]/g;

export function sanitizeFioInput(raw: string): string {
  let s = raw.replace(FIO_STRIP, '');
  s = s.replace(/\s+/g, ' ');
  if (s.length > 120) s = s.slice(0, 120);
  return s;
}

function capitalizeWord(w: string): string {
  if (!w) return w;
  const first = w[0];
  const rest = w.slice(1);
  return first.toLocaleUpperCase('ru-RU') + rest.toLocaleLowerCase('ru-RU');
}

/** Нормализация для отображения и сохранения: «Иванов Иван Иванович». */
export function formatFioDisplay(raw: string): string {
  const s = sanitizeFioInput(raw.trim());
  if (!s) return '';
  return s.split(/\s+/).filter(Boolean).map(capitalizeWord).join(' ');
}
