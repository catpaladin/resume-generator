# Resume Generator

An opinionated, modern resume builder built with Next.js 15, Tailwind CSS,
and Zustand. Edit your resume on the left, see a live, print‑ready preview on
the right, and export to PDF using your browser’s print dialog.

## Features

- **Skills by Category** — Each skill can have a category; the preview groups
  them automatically. Unassigned skills show under "General Skills".
- **Accessible Skill Pills** — Light: black pill with white text/border.
  Dark: white pill with black text/border.
- **Modern Preview Sheet** — Bordered, print‑safe, ATS‑friendly.
- **Quick Section Navigation** — Simple sidebar for fast jumping.
- **Theme Support** — Light/dark via `next-themes`.
- **Local Persistence** — Auto‑save to `localStorage` via Zustand.
- **Drag & Drop Ordering** — Powered by `@dnd-kit`.

## Tech Stack

- Next.js (App Router)
- React 19
- Tailwind CSS
- Zustand
- `@dnd-kit`

## 📦 Download Desktop App

**Get the portable desktop app - no installation required!**

**[📥 Download Resume Generator](https://catpaladin.github.io/resume-generator)**

- **Windows**: Portable .exe
- **macOS**: Universal .dmg (Intel + Apple Silicon)  
- **Linux**: AppImage

## Quick Start (Development)

```bash
# 1) Install dependencies
npm install

# 2) Start in development (http://localhost:3000)
npm run dev
```

## Requirements

- Node.js 22+
- npm (or pnpm/yarn/bun)

## Local Development

```bash
npm install
npm run dev
```

Hot‑reload is enabled. Your data persists in `localStorage`.

## Production Build

```bash
# Build
npm run build

# Start the production server
npm run start

# By default: http://localhost:3000
```

## Docker

This repo includes a multi‑stage Dockerfile that produces a small, non‑root
runtime image.

Build the image:

```bash
docker build -t resume-generator:latest .
```

Run the container:

```bash
docker run --rm -p 3000:3000 resume-generator:latest
# App is available at http://localhost:3000
```

Notes:

- Image runs as a non‑root user and exposes port `3000`.
- `NEXT_TELEMETRY_DISABLED` and `NODE_ENV=production` are set in the image.

## Scripts

### Web Development
- `dev` — Start the dev server
- `build` — Build for production
- `start` — Run the production build
- `lint` — Run ESLint
- `lint-format` — ESLint fix + Prettier (run before committing)
- `test` — Run unit tests
- `test:watch` — Watch mode
- `test:coverage` — Coverage report

### Desktop App (Electron)
- `electron:dev` — Build and run in Electron
- `electron:pack` — Create unpacked Electron build
- `dist:win` — Build Windows portable executable
- `dist:mac` — Build macOS DMG (unsigned)
- `dist:linux` — Build Linux AppImage

## Project Structure

- `src/components/resume/form/` — Form components for editing
- `src/components/resume/preview/` — Live preview components
- `src/components/ui/` — Reusable UI (shadcn/ui)
- `src/types/` — TypeScript interfaces
- `src/store/` — Zustand stores (e.g., `resumeStore.ts`)
- `src/lib/` — Utility functions
- `src/hooks/` — Custom hooks
- `src/app/page.tsx` — Main page composing builder + preview

## Theming and PDF Export

- Preview defaults to light theme for print clarity.
- Use your browser’s Print dialog to export to PDF.
- Enable background graphics for best results.

## Testing

The project is set up with Jest + React Testing Library.

```bash
npm run test
npm run test:watch
npm run test:coverage
```

When adding utilities or store actions, include unit tests.
