# Проверка и сборка DeskFlow

1. Скопировать или клонировать репозиторий в отдельную папку.
2. Установить Node.js 22+ и выполнить `npm ci`.
3. Запустить `npm test`.
4. Для Windows установить runtime командой `npm run setup`, затем выполнить `npm run build`.
5. Готовые файлы находятся в `release/`.

Рабочие инструменты тестового окружения автора не входят в репозиторий; абсолютные пути к его SDK и профилю не нужны.

Документация: [Electron Builder](https://www.electron.build/), [Capacitor Android](https://capacitorjs.com/docs/android).
