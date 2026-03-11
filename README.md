# DTS Frontend — Case Worker Tasks

This is a small React + TypeScript application (Vite) for managing case worker tasks.

Summary

- Provides a lightweight task management UI for DTS case workers with both list and Kanban views.
- Uses Material UI (`@mui/material` and `@mui/x-data-grid`) for a responsive, accessible interface.
- Includes demo data and a simple API client with a fallback (non-persistent) when the backend is unavailable.

Key features

- List view with sorting, pagination and quick search.
- Kanban-style board with drag-and-drop status updates.
- Create, view and edit tasks via a modal dialog with `DateTimePicker`.
- Status chips and readable date formatting (powered by `dayjs`).
- Column visibility toggles (show/hide Title, Description, Due, Created, Modified).
- Graceful fallback to demo tasks when the API cannot be reached.

Tech stack

- React, TypeScript, Vite
- Material UI (`@mui/material`, `@mui/icons-material`, `@mui/x-data-grid`)
- Dayjs for date handling

Quick start

```bash
npm install
npm run dev
```

Where to look

- App entry: [src/main.tsx](src/main.tsx#L1)
- Main UI: [src/App.tsx](src/App.tsx#L1)
- API client: [src/api/api.ts](src/api/api.ts#L1)
- Models / demo data: [src/models/task.ts](src/models/task.ts#L1), [src/models/demoTasks.ts](src/models/demoTasks.ts#L1)

License
This project is provided as-is for development and demonstration purposes.

**Testing**

- Recommended: run tests inside WSL (or CI) to avoid Windows/OneDrive file-handle limits that can cause Vitest to hang or error (EMFILE).
- Quick WSL steps:

```bash
# in WSL
cd ~
git clone https://github.com/axiosuk/dts-frontend.git
cd dts-frontend
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential
npm ci
npm test -- --run --reporter=verbose
```

- CI: GitHub Actions (`.github/workflows/test.yml`) runs Vitest on Linux and will exercise the real `App` component.
- Local Windows: if you prefer quick checks, run the `src/smoke.test.ts` test which doesn't import the full UI:

```bash
npx vitest run src/smoke.test.ts
```
