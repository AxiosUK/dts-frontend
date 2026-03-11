/// <reference types="vitest" />
import { expect, test } from "vitest";
import { demoTasks } from "./models/demoTasks";

test("demoTasks provides sample data", () => {
  expect(Array.isArray(demoTasks)).toBe(true);
  expect(demoTasks.length).toBeGreaterThan(0);
  const t = demoTasks[0];
  expect(t).toHaveProperty("title");
  expect(t).toHaveProperty("status");
});
