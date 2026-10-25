# Cloud Atlas

Фиолетовые облака с восходящими клубами и направленным размытием от указателя. След постепенно восстанавливается.

## Запуск

Из корня репозитория с Node.js 22:

```bash
npm ci
npm run dev:cloud
```

Демо: http://localhost:3000.

```bash
npm run typecheck --workspace=cloud-atlas
npm run build --workspace=cloud-atlas
npm run start --workspace=cloud-atlas
```

## Подключение

Скопируйте папку `src/components/cloud-atlas` в проект с React, TypeScript и Tailwind CSS. Установите `gsap`.

```tsx
import CloudAtlas from './components/cloud-atlas/CloudAtlas';

export default function Demo() {
  return <CloudAtlas className="h-[600px] w-full" />;
}
```

Типы и все значения по умолчанию находятся в [`types.ts`](src/components/cloud-atlas/types.ts). Задавайте CSS-высоту контейнера явно. `paused` останавливает анимацию. Размер автоматически обновляется при изменении контейнера.

Для CSS-резервного фона перенесите `.cloud-fallback` из `src/app/globals.css`. Нужен WebGL; при его недоступности отображается резервный фон. `rise` регулирует восходящее движение, `interactive` включает реакцию на указатель, `cursorRadius` и `cursorStrength` задают её масштаб.

Самостоятельная реализация по публичному превью React Bits. Закрытый код и сторонние текстуры не использовались. Покадровое совпадение не заявляется.

Лицензия собственного кода: [MIT](../../LICENSE). Лицензии зависимостей: [уведомления](../../THIRD_PARTY_NOTICES.md).
