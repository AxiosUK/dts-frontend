/// <reference types="vitest" />
import { render, screen, waitFor } from "@testing-library/react";
import { vi, test, expect } from "vitest";
import React from "react";

// Mock heavy UI modules before importing App so module graph stays light.
vi.mock("@mui/icons-material", async () => {
  const ReactAny = React as any;
  const makeIcon = (name: string) => (props: any) =>
    ReactAny.createElement("span", { "data-mock-icon": name, ...props }, name);
  return {
    ClearRounded: makeIcon("ClearRounded"),
    ViewListRounded: makeIcon("ViewListRounded"),
    ViewKanbanRounded: makeIcon("ViewKanbanRounded"),
    Add: makeIcon("Add"),
    NotificationImportantRounded: makeIcon("NotificationImportantRounded"),
    VisibilityRounded: makeIcon("VisibilityRounded"),
    EditRounded: makeIcon("EditRounded"),
    DeleteRounded: makeIcon("DeleteRounded"),
  };
});

vi.mock("@mui/x-data-grid", async () => {
  const ReactAny = React as any;
  const DataGrid = (props: any) => {
    const rows = props.rows || [];
    const children = rows.map((r: any) => ReactAny.createElement("div", { key: r._id }, r.title));
    return ReactAny.createElement("div", { "data-mock": "DataGrid" }, children);
  };
  const GridToolbar = () => ReactAny.createElement("div", null, "toolbar");
  return { DataGrid, GridToolbar };
});

vi.mock("@mui/x-date-pickers/LocalizationProvider", async () => {
  const ReactAny = React as any;
  const LocalizationProvider = ({ children }: any) => ReactAny.createElement(ReactAny.Fragment, null, children);
  return { LocalizationProvider };
});

vi.mock("@mui/x-date-pickers/AdapterDayjs", async () => ({ AdapterDayjs: {} }));

vi.mock("@mui/x-date-pickers/DateTimePicker", async () => {
  const ReactAny = React as any;
  const DateTimePicker = ({ value, onChange }: any) =>
    ReactAny.createElement("input", {
      "data-mock": "DateTimePicker",
      value: value ? String(value) : "",
      onChange: (e: any) => onChange && onChange(e.target.value),
    });
  return { DateTimePicker };
});

// Provide lightweight stubs for @mui/material components to avoid heavy internals.
vi.mock("@mui/material", async () => {
  const ReactAny = React as any;

  const Stub = ({ children, ...props }: any) => ReactAny.createElement("div", props, children);

  const Input = ({ value, onChange, ...props }: any) =>
    ReactAny.createElement("input", { value, onChange, "data-mock": "TextField", ...props });

  const ToggleGroup = ({ children, ...props }: any) => ReactAny.createElement("div", props, children);
  const Toggle = ({ children, ...props }: any) => ReactAny.createElement("button", props, children);

  return {
    Alert: Stub,
    Box: Stub,
    Button: ({ children, ...p }: any) => ReactAny.createElement("button", p, children),
    Card: Stub,
    CardActions: Stub,
    CardContent: Stub,
    Chip: ({ label }: any) => ReactAny.createElement("span", null, label),
    Dialog: ({ children, open }: any) => (open ? ReactAny.createElement("div", null, children) : null),
    DialogActions: Stub,
    DialogContent: Stub,
    DialogTitle: ({ children }: any) => ReactAny.createElement("h3", null, children),
    IconButton: ({ children, ...p }: any) => ReactAny.createElement("button", p, children),
    InputAdornment: Stub,
    Skeleton: Stub,
    Snackbar: Stub,
    Stack: Stub,
    TextField: Input,
    ToggleButton: Toggle,
    ToggleButtonGroup: ToggleGroup,
    Tooltip: ({ children }: any) => ReactAny.createElement(ReactAny.Fragment, null, children),
    Typography: ({ children, ...p }: any) => ReactAny.createElement("span", p, children),
  };
});

// Mock the API module to return demo tasks synchronously for tests
vi.mock("./api/api", async () => {
  const mod = await vi.importActual("./models/demoTasks");
  return {
    fetchTasks: async () => ({ tasks: mod.demoTasks }),
    createTask: async () => ({}),
    updateTask: async () => ({}),
    deleteTask: async () => ({}),
  };
});

test("renders app header and a demo task", async () => {
  // Dynamically import the (now mocked) App component to keep test startup fast.
  const { default: App } = await import("./App");
  render(<App />);
  expect(screen.getByText(/DTS Case Worker Tasks/i)).toBeInTheDocument();

  await waitFor(
    () => {
      expect(screen.getByText(/Validate new online submission/i)).toBeInTheDocument();
    },
    { timeout: 60000 },
  );
}, 60000);
