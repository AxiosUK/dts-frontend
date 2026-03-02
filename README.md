# DTS Frontend — Case Worker Tasks

This is a small React + TypeScript application (Vite) for managing case worker tasks.

Summary

- Provides a lightweight task management UI for DTS case workers with both list and Kanban views.
- Uses Material UI (`@mui/material` and `@mui/x-data-grid`) for a responsive, accessible interface.
- Includes demo data and a simple API client with a fallback when the backend is unavailable.

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
files: ['**/*.{ts,tsx}'],
