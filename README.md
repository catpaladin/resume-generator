# Resume Generator

An opinionated, modern resume builder built with Astro 5, Svelte 5, Tailwind CSS 4,
and Svelte Runes. Edit your resume on the left, see a live, print-ready preview on
the right, and export to PDF using your browser’s print dialog.

## Features

- **AI-Enhanced Import** — Upload PDF or DOCX resumes; our AI automatically parses
  and structures the content for you.
- **Standalone API Server** — Integrated Bun-powered server for AI proxying and static hosting.
- **Skills by Category** — Each skill can have a category; the preview groups
  them automatically. Unassigned skills show under "General Skills".
- **Modern Preview Sheet** — Bordered, print-safe, ATS-friendly.
- **Quick Section Navigation** — Simple sidebar for fast jumping.
- **Theme Support** — Full light/dark mode support.
- **Local Persistence** — Auto-save to `localStorage` via Svelte Runes.

## Tech Stack

- **Astro 5** — Static Site Generation & API Routes
- **Svelte 5** — UI Layer using Runes for reactive state
- **Tailwind CSS 4** — Zero-runtime CSS with the new engine
- **Bun** — Fast runtime, package manager, and bundler
- **Lucide Svelte** — Icon system
- **bits-ui** — Accessible UI primitives

## Quick Start (Development)

```bash
# 1) Install dependencies
bun install

# 2) Start in development (http://localhost:4321)
bun run dev
```

## Production Build

The production build generates both the Astro static site and a standalone, optimized API server bundle.

```bash
# Build both frontend and API server
bun run build

# Start the production server
bun run start

# By default: http://localhost:3000
```

## Docker

This repository produces a highly secure, minimal container image using **Bun Distroless**.

- **Small Footprint**: ~40MB compressed.
- **Secure**: No shell, no package manager, no root user.
- **Performance**: Powered by Bun's high-performance runtime.

### Build and Run

```bash
# Build the image
docker buildx build -t resume-generator:latest .

# Run the container
docker run --rm -p 3000:3000 resume-generator:latest
```

## Desktop App (Electron)

The app is fully compatible with Electron for a native desktop experience. We've optimized the build to remove `ts-node` in production, resulting in a much leaner installer.

- `electron:dev` — Build and run in Electron
- `electron:pack` — Create unpacked Electron build
- `dist:win` / `dist:mac` / `dist:linux` — Build platform-specific installers

## Project Structure

- `src/components/` — Svelte components grouped by domain (form, preview, ui)
- `src/lib/ai/` — AI service abstraction and provider implementations
- `src/store/` — Reactive state management using Svelte Runes
- `api-server.ts` — Standalone server implementation for production/Docker
- `electron/` — Main process logic and protocol handlers

## Testing

```bash
bun run test
```

The project uses Vitest with `@testing-library/svelte` for unit and component testing.
