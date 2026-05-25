# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## IMPORTANT: Docs-First Rule

**Before writing any code, always check the `/docs` directory first.** If a relevant docs file exists for the technology or feature you are working on, read it before generating any code. The docs in `/docs` are the authoritative reference for this project and take precedence over training data.

- /docs/ui.md

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run lint     # run ESLint
```

No test runner is configured yet.

## Stack

- **Next.js 16** (App Router) with **React 19** — read `node_modules/next/dist/docs/` before writing code; APIs may differ from training data
- **Tailwind CSS v4** — configured via `postcss.config.mjs`; v4 uses a CSS-first config (no `tailwind.config.js`)
- **TypeScript**

## Architecture

App Router structure under `src/app/`:

- `layout.tsx` — root layout with Geist font variables and full-height flex body
- `page.tsx` — home route
- `globals.css` — global styles including Tailwind base

All routing follows Next.js App Router conventions (file-based, nested layouts, Server Components by default).
