// Поддержка CSS-модулей в TypeScript: позволяет импортировать CSS-файлы как объекты с классами
declare module '*.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
