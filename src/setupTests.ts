import "@testing-library/jest-dom";
import React from "react";
import { vi } from "vitest";

// Mock MUI icon library globally to avoid loading many icon files during tests
vi.mock("@mui/icons-material", () => {
  const handler = {
    get: (_target: any, prop: string) => {
      if (prop === "__esModule") return true;
      // Return a simple SVG stub component for any icon
      return (props: any) =>
        React.createElement("svg", {
          "data-testid": `icon-${String(prop)}`,
          ...props,
        });
    },
  };
  return new Proxy({}, handler as any);
});
