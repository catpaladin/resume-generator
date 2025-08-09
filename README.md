# Resume Generator

An opinionated, modern resume builder built with Next.js 15, Tailwind CSS,
and Zustand. Edit your resume on the left, see a live, print‑ready preview on
the right, and export to PDF using your browser’s print dialog.

## Features

- **Skills by Category** — Enter a category per skill in the form. The preview
  groups skills under their categories. Skills without a category appear under
  "General Skills".
- **Accessible Skill Pills** — In light mode, pills are black background with
  white text and white border; in dark mode, white background with black text
  and black border.
- **Modern Preview Sheet** — Bordered, print‑safe, ATS‑friendly layout.
- **Quick Section Navigation** — Simple sidebar to jump between sections.
- **Theme Support** — Light/dark via `next-themes` with a consistent color
  system.
- **Local Persistence** — Your progress auto‑saves to `localStorage` using
  Zustand. Refresh without losing edits.
- **Drag & Drop Ordering** — Reorder list sections via `@dnd-kit`.

## Tech Stack

- Next.js (App Router)
- React 19
- Tailwind CSS + Prettier Tailwind sorting
- Zustand for state
- `@dnd-kit` for drag & drop
- Lucide icons

## Requirements

- Node.js 22+
- npm (or pnpm/yarn/bun)

## Setup

```bash
npm install
```

## Scripts

- `npm run dev` — Start the dev server
- `npm run build` — Build for production
- `npm run start` — Run the production build
- `npm run lint` — Run ESLint
- `npm run lint-format` — Fix lint and format with Prettier (mandatory before
  commits)

## Project Structure

Key paths you’ll work with:

- `src/components/resume/form/` — Form components for editing
- `src/components/resume/preview/` — Components for the live preview
- `src/components/ui/` — Reusable UI (shadcn/ui)
- `src/types/` — TypeScript interfaces
- `src/store/` — Zustand stores (`resumeStore.ts`)
- `src/lib/` — Utility functions
- `src/hooks/` — Custom hooks
- `src/app/page.tsx` — Main page composing the builder and preview

## Theming and PDF Export

- Preview defaults to light theme for print clarity.
- Use your browser’s Print dialog to export to PDF.
- Ensure margins are default and background graphics are enabled for best
  results.

## Notes on Testing

Unit and integration tests are planned. When adding utilities or store
actions, include tests with Jest + React Testing Library per our project
standards.
