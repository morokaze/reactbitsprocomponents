# Glyph Tide

Автономный ASCII-прилив с пеной, контурами и влажным песком. Яркость по умолчанию — 1.8. Взаимодействие с курсором отсутствует.

## Запуск

Из корня репозитория с Node.js 22:

```bash
npm ci
npm run dev:tide
```

Демо: http://localhost:3001.

```bash
npm run typecheck --workspace=glyph-tide
npm run build --workspace=glyph-tide
npm run start --workspace=glyph-tide
```

## Подключение

Скопируйте папку `src/components/glyph-tide` в проект с React, TypeScript и Tailwind CSS. Установите `gsap`.

```tsx
import GlyphTide from './components/glyph-tide/GlyphTide';

export default function Demo() {
  return <GlyphTide className="h-[600px] w-full" />;
}
```

Типы и все значения по умолчанию находятся в [`types.ts`](src/components/glyph-tide/types.ts). Задавайте CSS-высоту контейнера явно. `paused` останавливает анимацию. Размер автоматически обновляется при изменении контейнера.

`tidePeriod` задаёт период прилива, `tideRange` — амплитуду, `foam` — пену, `brightness` — яркость. Можно задать прозрачный `backgroundColor` и свой набор `characters`.

Самостоятельная реализация по публичному превью React Bits. Закрытый код и сторонние текстуры не использовались. Покадровое совпадение не заявляется.

Лицензия собственного кода: [MIT](../../LICENSE). Лицензии зависимостей: [уведомления](../../THIRD_PARTY_NOTICES.md).
