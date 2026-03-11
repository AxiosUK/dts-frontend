/// <reference types="vitest" />
import { render, screen, waitFor } from "@testing-library/react";
import { vi, test, expect } from "vitest";

// import App from "./App"; // Removed static import for dynamic import

// Mock the API module to return demo tasks synchronously for tests
vi.mock("./api/api", async () => {
  const mod = await vi.importActual("./models/demoTasks");
  return {
    fetchTasks: async () => ({ tasks: mod.demoTasks }),
  };
});

test("renders app header and a demo task", async () => {
  // Dynamically import the real App component. Tests run fastest in WSL/CI;
  // running locally on Windows/OneDrive may be slow or hit file-handle limits.
  const { default: App } = await import("./App");
  render(<App />);
  expect(screen.getByText(/DTS Case Worker Tasks/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(
      screen.getByText(/Validate new online submission/i),
    ).toBeInTheDocument();
  });
});
