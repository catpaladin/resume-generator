# Resume Generator

An opinionated, modern resume builder built with Astro, Svelte 5, Tailwind CSS,
and Svelte Runes. Edit your resume on the left, see a live, print‑ready preview on
the right, and export to PDF using your browser’s print dialog.

## Features

- **AI-Enhanced Import** — Upload PDF or DOCX resumes; our AI automatically parses
  and structures the content for you.
- **Skills by Category** — Each skill can have a category; the preview groups
  them automatically. Unassigned skills show under "General Skills".
- **Accessible Skill Pills** — Light: black pill with white text/border.
  Dark: white pill with black text/border.
- **Modern Preview Sheet** — Bordered, print‑safe, ATS‑friendly.
- **Quick Section Navigation** — Simple sidebar for fast jumping.
- **Theme Support** — Light/dark mode support.
- **Local Persistence** — Auto‑save to `localStorage` via Svelte Runes.

## Tech Stack

- Astro 5
- Svelte 5 (Runes)
- Tailwind CSS 3
- Lucide Svelte
- bits-ui
- Vitest

## Quick Start (Development)

```bash
# 1) Install dependencies
bun install

# 2) Start in development (http://localhost:3000)
bun run dev
```

## Requirements

- Node.js 22+
- Bun

## Local Development

```bash
bun install
bun run dev
```

Hot‑reload is enabled. Your data persists in `localStorage`.

## Production Build

```bash
# Build
bun run build

# Start the production server
bun run start

# By default: http://localhost:3000
```

## Docker

This repo includes a multi‑stage Dockerfile that produces a small, non‑root
runtime image using `sirv-cli` to serve the static Astro build.

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
- `NODE_ENV=production` is set in the image.

## Scripts

### Web Development

- `dev` — Start the dev server (Astro)
- `build` — Build for production
- `preview` — Preview the production build
- `lint` — Run ESLint
- `format` — Format code with Prettier
- `test` — Run unit tests (Vitest)
- `test:run` — Run tests once
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
- `src/components/ui/` — Reusable UI (Radix-like via bits-ui)
- `src/types/` — TypeScript interfaces
- `src/store/` — Svelte stores (e.g., `resume.svelte.ts`)
- `src/lib/` — Utility functions, AI logic, and parsers
- `src/pages/` — Astro pages and API endpoints
- `src/layouts/` — Base Astro layouts

## Theming and PDF Export

- Preview defaults to light theme for print clarity.
- Use the "Export PDF" button to trigger the browser’s Print dialog.
- The app automatically hides UI elements and adjusts layout for printing.

## Testing

The project is set up with Vitest.

```bash
bun run test
```

When adding utilities or store actions, include unit tests in the `__tests__` folder next to the implementation.
