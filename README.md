# DeskFlow

**English** | [Русский](README.ru.md)

Local Windows utilities for screenshots, OCR, file management, audio control, and launching applications.

A personal project under active development, built with substantial AI assistance. The first publication is planned as a **prerelease**; compatibility with every device is not guaranteed.

![DeskFlow interface](docs/images/deskflow-dark.png)

The screenshot shows version 1.0. Public version 1.0.1 adds a separate FFmpeg configuration option.

## Download

Open [Releases](https://github.com/Xirikai/deskflow/releases) and download **DeskFlow-Windows-v1.0.1.zip**. Extract the ZIP and run the EXE inside. End users do not need Node.js.

GitHub's **Source code** downloads contain the development sources. The ready-to-run application is in the platform ZIP. Download links will become available after the repository and its first release are published.

## Features

- Screenshots, an image editor, and local OCR using Windows components.
- File sorting and batch renaming with previews, history, and undo.
- Image conversion, photos to PDF, and removing audio from video using an external FFmpeg installation.
- Search for installed applications and add custom shortcuts.
- Volume controls for playback devices and active applications, with audio profiles.
- A shelf for local copies of files, text, and links.
- Light, dark, and system themes.

## Run from source

Requirements: Node.js 22+, Windows 10/11 x64, and .NET Framework 4.

```powershell
npm ci
npm run setup
npm start
```

If npm did not run Electron's installation script automatically, `npm run setup` downloads the official runtime.

## Build for Windows

```powershell
npm run build
```

The output is saved to `release/`. The audio helper is compiled from `native/Audio.cs`. NAudio 1.10.0 is downloaded from NuGet and verified using SHA-256. FFmpeg is not bundled; see the [FFmpeg setup guide, in Russian](docs/FFMPEG.md).

## Checks

```powershell
npm test
```

All 14 automated checks passed, covering images, PDF generation, file operations, undo, and video processing with external FFmpeg. A clean dependency installation and compilation of the C# helper using the verified NuGet package also passed.

GitHub Actions checks are configured to run after publication. Successful local checks do not imply that the not-yet-run GitHub workflows have passed.

## Data and limitations

- Windows 10/11 x64 only.
- The video tool requires a separate FFmpeg installation.
- OCR depends on the Windows language components installed on the device.
- Applications that hold on to an audio device may need playback to be restarted after a device switch.
- The EXE is not code-signed. Automatic updates are not implemented.

Settings, history, and shelf copies are stored in `%APPDATA%/DeskFlow`. Close the application completely before backing up this folder. Adding a file to the shelf leaves the original file in place.

## Development process

The author selected features, tested workflows, identified usability issues, and refined requirements. AI produced a substantial part of the code, documentation, and technical decisions. This is a learning project; independent expertise in every technology used is not claimed.

## Feedback

When opening an Issue, include the steps to reproduce, expected and actual behavior, the application version, and your Windows version. Do not attach personal backups, passwords, or keys.

## Licenses

Original project code is licensed under [MIT](LICENSE). Third-party components retain their own licenses: see [THIRD-PARTY.md, in Russian](THIRD-PARTY.md) and the notices in `licenses/`. Dependency versions are recorded in `package-lock.json`.

Supporting build and user guides are currently in Russian.
