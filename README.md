# Aether OS

Aether OS is an interactive, browser-only operating-system simulation built as a frontend case study. It combines a command parser, an in-memory file tree, a local buffer editor, generated telemetry, multiple visual themes, Web Audio feedback, and a responsive canvas mesh.

**Live demo:** [aether-os-seven-kappa.vercel.app](https://aether-os-seven-kappa.vercel.app/)

## Trust boundary

Aether is a simulation. It does not open a real shell, inspect the visitor's device, read local files, access a network, or report real CPU, memory, encryption, or latency values. File edits live only in React state for the current browser session; the selected color theme is the only value saved in `localStorage`.

## Highlights

- Terminal-style command parser with history and tab completion.
- In-memory file navigation and editing (`ls`, `cd`, `cat`, `edit`, `mkdir`, `touch`, `rm`).
- Four persistent visual themes.
- Responsive, device-pixel-ratio-aware canvas rendering.
- Matrix mode, generated telemetry, and optional Web Audio feedback.
- Keyboard-accessible tabs, explicit labels, live regions, focus states, and reduced-motion support.
- No analytics, accounts, backend, or data upload.

## Commands

Run `help` inside the demo to see every command. Useful starting points:

```text
status
ls
cat user_profile.txt
edit user_profile.txt
theme green
matrix
pulse
```

## Tech

- React 18
- Vite 5
- Tailwind CSS 4
- HTML Canvas API
- Web Audio API

## Local setup

```bash
git clone https://github.com/azizkza99/aether-os.git
cd aether-os
npm install
npm run dev
```

## Quality checks

```bash
npm run check
npm audit --omit=dev
```

## License

[MIT](./LICENSE)
