# React Components

Коллекция самостоятельно воссозданных анимированных компонентов на **React, Next.js, TypeScript, Tailwind CSS и GSAP**. Документация и интерфейсы демо на русском языке. Собственный исходный код без комментариев.

## Компоненты

| Компонент | Эффект | Запуск | Адрес |
|---|---|---|---|
| [Cloud Atlas](components/cloud-atlas) | Восходящие облака с размытием от курсора и восстановлением | `npm run dev:cloud` | http://localhost:3000 |
| [Glyph Tide](components/glyph-tide) | ASCII-прилив без взаимодействия, яркость 1.8 | `npm run dev:tide` | http://localhost:3001 |
| [Glyph Ember](components/glyph-ember) | ASCII-пламя, искры и опциональное гашение | `npm run dev:ember` | http://localhost:3002 |

## Быстрый старт

Нужны Node.js 22 и npm.

```bash
git clone https://github.com/morokaze/reactbitsprocomponents.git
cd reactbitsprocomponents
npm ci
npm run dev:ember
```

Для каждого демо используйте отдельный терминал и соответствующую команду из таблицы. `npm run dev` по умолчанию запускает Glyph Ember. Переменные окружения и API-ключи не нужны.

## Проверки и production

```bash
npm run typecheck
npm run build
```

Эти команды проверяют все три проекта. Для запуска собранного компонента:

```bash
npm run start --workspace=cloud-atlas
npm run start --workspace=glyph-tide
npm run start --workspace=glyph-ember
```

Выполняйте команды запуска в отдельных терминалах. GitHub Actions проверяет установку, TypeScript и сборку всей коллекции при push и pull request.

## Использование в своём проекте

Скопируйте папку нужного компонента из `components/ИМЯ/src/components/ИМЯ`, установите `gsap` и подключите Tailwind CSS. Задайте высоту контейнера. Примеры и особенности каждого эффекта — в его README; полные props и значения по умолчанию — в `types.ts`.

## Структура

```text
components/
  cloud-atlas/    WebGL-облака и демо
  glyph-tide/     Canvas-прилив и демо
  glyph-ember/    Canvas-пламя и демо
.github/
  workflows/     Общая проверка
package.json     Команды и npm workspaces
package-lock.json
```

Общий lock-файл обеспечивает воспроизводимую установку. `node_modules`, `.next`, `next-env.d.ts`, секреты и временные файлы не публикуются. Next.js создаёт служебные файлы самостоятельно; они могут содержать автоматически сгенерированные комментарии.

## Происхождение и лицензия

Компоненты написаны самостоятельно по публичным визуальным референсам React Bits. Это не официальный репозиторий React Bits. Закрытый исходный код, логотипы и снимки оригинальных демо не включены. Покадровое совпадение не заявляется.

Собственные исходники — [MIT](LICENSE). Зависимости, включая GSAP, сохраняют отдельные лицензии: [сторонние зависимости](THIRD_PARTY_NOTICES.md). Юридический текст MIT сохранён на английском.

[Правила участия](CONTRIBUTING.md).
