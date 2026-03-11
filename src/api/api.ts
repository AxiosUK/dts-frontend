import axios from "axios";
import type Task from "../models/task";
import { demoTasks } from "../models/demoTasks";

declare global {
  interface Window {
    __ENV__?: { API_BASE_URL?: string };
  }
}

const runtimeApi = window.__ENV__?.API_BASE_URL;

export const api = axios.create({
  baseURL: `${runtimeApi || "http://localhost:5000"}/main/v1`,
  // Fail fast on unreachable backends to avoid hanging tests and UI initialization
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchTasks = async () => {
  // In dev mode return demo tasks immediately to speed local dev startup.
  // Use Vite's `import.meta.env.DEV` which is true when running `vite`.
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.DEV) {
    return { tasks: demoTasks };
  }

  try {
    const response = await api.get("/tasks");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn("API endpoint not found (404). Falling back to demo data.");
      return { tasks: demoTasks };
    } else {
      console.error("Error fetching tasks:", error);
      return { tasks: demoTasks };
    }
  }
};

export const createTask = async (
  taskData: Omit<Task, "_id" | "createdAt" | "modifiedAt">,
) => {
  try {
    const response = await api.post("/tasks", taskData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn("API endpoint not found (404). Falling back to demo data.");
    } else {
      console.error("Error creating task:", error);
    }
  }
};

export const updateTask = async (taskId: string, taskData: Task) => {
  try {
    const response = await api.patch(`/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn("API endpoint not found (404). Falling back to demo data.");
    } else {
      console.error("Error updating task:", error);
    }
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    await api.delete(`/tasks/${taskId}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn("API endpoint not found (404). Falling back to demo data.");
    } else {
      console.error("Error deleting task:", error);
    }
  }
};
