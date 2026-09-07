# Aether OS

An accessible, browser-based operating-system simulation built as a frontend engineering case study.

**Live demo:** [aether-os-seven-kappa.vercel.app](https://aether-os-seven-kappa.vercel.app/)

## Overview

Aether OS combines a terminal-style command parser, an in-memory file system, a local text editor, generated telemetry, multiple visual themes, and responsive canvas effects. It is intentionally sandboxed in the browser: it does not access a visitor's device, files, shell, or network.

## Tech Stack

- React 18 and JavaScript
- Vite 5
- Tailwind CSS 4
- HTML Canvas API
- Web Audio API
- ESLint

## Key Features

- Command history, tab completion, and familiar file commands
- In-memory navigation and editing with no device access
- Four persistent visual themes and an optional matrix mode
- Responsive, device-pixel-ratio-aware canvas rendering
- Keyboard-accessible controls, live regions, and reduced-motion support
- Explicit trust boundaries and no analytics, accounts, or data upload

## Setup

```bash
git clone https://github.com/azizkza99/aether-os.git
cd aether-os
npm ci
npm run dev
```

## Quality Checks

```bash
npm run check
npm audit --omit=dev
```

## License

[MIT](./LICENSE)
