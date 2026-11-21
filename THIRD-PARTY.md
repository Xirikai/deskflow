# Сторонние компоненты DeskFlow

Собственный код проекта распространяется по MIT. Сторонние компоненты сохраняют свои условия; MIT проекта их не заменяет. Точные установленные версии и адреса исходников перечислены в [licenses/DEPENDENCIES.json](licenses/DEPENDENCIES.json), тексты уведомлений — в папках licenses.

## JavaScript-зависимости

| Компонент | Версия | Лицензия |
| --- | --- | --- |
| @img/colour | 1.1.0 | MIT |
| @img/sharp-win32-x64 | 0.35.5 | Apache-2.0 AND LGPL-3.0-or-later |
| @pdf-lib/standard-fonts | 1.0.0 | MIT |
| @pdf-lib/upng | 1.0.1 | MIT |
| detect-libc | 2.1.2 | Apache-2.0 |
| pako | 1.0.11 | (MIT AND Zlib) |
| pdf-lib | 1.17.1 | MIT |
| semver | 7.8.6 | ISC |
| sharp | 0.35.5 | Apache-2.0 |
| tslib | 1.14.1 | 0BSD |

## Оболочки и нативные компоненты

- Electron 45.4.1 — MIT, Chromium и его сторонние компоненты. Лицензионные файлы входят в поставку Electron и Windows-архив приложения. Исходники: https://github.com/electron/electron/tree/v45.4.1 .
- NAudio 1.10.0 — Microsoft Public License; неизменённая DLL загружается из NuGet и проверяется по SHA-256. Исходники: https://github.com/naudio/NAudio/tree/v1.10.0 .
- Sharp использует динамические DLL libvips и других библиотек. Их версии и условия сохранены в licenses/SHARP-NATIVE-VERSIONS.json и SHARP-NATIVE-COMPONENTS.md. Сборочные скрипты: https://github.com/lovell/sharp-libvips ; libvips: https://github.com/libvips/libvips .
- FFmpeg не входит в публичную поставку. Это отдельно подключаемый пользователем процесс со своей лицензией: https://ffmpeg.org/legal.html .
- Windows OCR, Windows PowerShell и .NET Framework — системные компоненты, не распространяются в архиве.

Документация и лицензии взяты из установленных официальных пакетов. При обновлении зависимостей нужно обновлять уведомления и проверять условия соответствующей версии.
