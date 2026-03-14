# DTS Frontend — Case Worker Tasks

This repository contains a small React + TypeScript frontend (Vite) for managing case-worker tasks used in demonstrations and local development.

## This package should be accompanied with the backend package.

Whole Package

- https://github.com/AxiosUK/hmcts-dts-demo

Backend Package

- https://github.com/AxiosUK/dts-backend

Frontend

- CURRENT

Overview

- Lightweight task management UI with a List view (DataGrid) and a Kanban-style board.
- Built with Material UI and MUI X Data Grid; `dayjs` provides date handling and relative formatting.
- Includes in-memory demo data and an API client with safe fallbacks to make local development resilient when backend services are unavailable.

Key features

- List view: sorting, pagination, column visibility and quick search.
- Kanban board: drag-and-drop status updates and compact cards.
- Create / view / edit tasks in a modal dialog with date-time selection.
- Status chips and human-friendly relative due dates.

Tech stack

- React + TypeScript, built with Vite
- Material UI (`@mui/material`, `@mui/icons-material`)
- MUI X Data Grid (`@mui/x-data-grid`) and Date Pickers (`@mui/x-date-pickers`)
- Axios for HTTP, Dayjs for date utilities

Quick start

```bash
npm install
npm run dev
```

Deploy to docker

```yaml
services:
  web:
    image: ghcr.io/axiosuk/dts-frontend:1.1.1
    labels:
      - "org.opencontainers.image.version=1.1.1"
    container_name: dts-frontend
    environment:
      - API_BASE_URL=https://api.example.com
    restart: unless-stopped
    ports:
      - "5173:80"
```

Important internal files

- App entry: [src/main.tsx](src/main.tsx#L1)
- Main UI: [src/App.tsx](src/App.tsx#L1)
- API client: [src/api/api.ts](src/api/api.ts#L1)
- Demo data: [src/models/demoTasks.ts](src/models/demoTasks.ts#L1)

API client and fallback behavior

- The API client is implemented in [src/api/api.ts](src/api/api.ts#L1). It uses `axios` and includes a short request timeout to avoid long hangs during development and tests.
- In development (Vite dev mode) the client short-circuits and returns the in-memory `demoTasks` set immediately to speed UI startup. When an API request fails (404 or network error) the client also falls back to `demoTasks` so the UI can function offline.

Axios timeout

- The client config sets a conservative default timeout (see [src/api/api.ts](src/api/api.ts#L1)). You can increase this for CI/tests by editing that file or wiring an environment-specific value.

Developer tips (performance & testing)

- Cold dev startup: to reduce first-run cold start time, `vite.config.ts` pre-bundles heavy dependencies via `optimizeDeps.include` (see [vite.config.ts](vite.config.ts#L1)). This improves the initial import cost for MUI and related packages.
- Tests on Windows/OneDrive: the Windows filesystem + OneDrive can hit OS limits (EMFILE) when the test runner imports many files (MUI, icons). Recommended approaches:
  - Run tests inside WSL or Linux CI for reliable results.
  - Use the quick smoke test locally: `npx vitest run src/smoke.test.ts` to validate basic app wiring.
  - The integration test `src/App.test.tsx` is configured to mock heavy MUI components (icons, DataGrid, date pickers) to keep local test startup fast; CI runs the real `App` on Linux.

Running tests

```bash
# Run the full test suite (default)
npm test

# Run a single test file (fast smoke test)
npx vitest run src/smoke.test.ts

# Run tests in watch mode
npm run test:watch
```

Continuous Integration & release

- Tests are executed in GitHub Actions (`.github/workflows/test.yml`) on Linux runners; this avoids Windows-specific file-handle issues.
- The release workflow was adjusted to update `docker-compose.yaml` via Node (not shell `sed`) to avoid YAML quoting issues and now publishes container images to GitHub Container Registry (GHCR). See [.github/workflows/release.yml](.github/workflows/release.yml) for details.

Troubleshooting

- If Vitest hangs or reports EMFILE on Windows, try:
  1.  Running tests in WSL or CI (recommended).

2.  Running only the smoke test locally: `npx vitest run src/smoke.test.ts`.
3.  Increasing OS file descriptors (advanced) or disabling OneDrive sync for the repo directory.
