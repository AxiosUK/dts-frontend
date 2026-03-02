import { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Popover,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ClearRounded,
  ViewListRounded,
  ViewKanbanRounded,
  Add,
  Settings,
} from "@mui/icons-material";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import type Task from "./models/task";
import { fetchTasks } from "./api/api";
import { demoTasks } from "./models/demoTasks";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

const dataColumns = [
  { field: "title", view: true },
  { field: "description", view: true },
  { field: "status", view: true },
  { field: "dueDate", view: true },
  { field: "createdAt", view: false },
  { field: "modifiedAt", view: false },
];

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "kanban">("list");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [viewColumns, setViewColumns] =
    useState<{ field: string; view: boolean }[]>(dataColumns);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const isSettingsOpen = Boolean(settingsAnchorEl);

  const statuses = useMemo(() => {
    return ["pending", "in progress", "completed"] as const;
  }, []);

  const moveTaskToStatus = (taskId: string, nextStatus: Task["status"]) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: nextStatus } : t)),
    );
  };

  const handleCancel = () => {
    // If editing an existing task, revert the selectedTask to the stored task
    if (selectedTask?._id) {
      const original = tasks.find((t) => t._id === selectedTask._id) ?? null;
      setSelectedTask(original);
      setIsReadOnly(true);
      // keep dialog open so user can view (read-only)
    } else {
      // New task creation was cancelled
      setSelectedTask(null);
      setIsReadOnly(true);
      setIsDialogOpen(false);
    }
  };

  const handleSave = () => {
    if (!selectedTask) return;

    const now = new Date();

    if (selectedTask._id) {
      // update existing task
      setTasks((prev) =>
        prev.map((t) =>
          t._id === selectedTask._id ? { ...selectedTask, modifiedAt: now } : t,
        ),
      );
      setSelectedTask({ ...selectedTask, modifiedAt: now });
    } else {
      // create new task
      const id = Math.random().toString(36).substr(2, 9);
      const newTask: Task = {
        ...selectedTask,
        _id: id,
        createdAt: now,
        modifiedAt: now,
      };
      setTasks((prev) => [newTask, ...prev]);
      setSelectedTask(newTask);
    }

    setIsReadOnly(true);
    setIsDialogOpen(false);
  };

  const columns: GridColDef<Task>[] = useMemo(
    () =>
      [
        ...(viewColumns.find((c) => c.field === "title")?.view
          ? [
              {
                field: "title",
                headerName: "Title",
                flex: 1,
              },
            ]
          : []),
        ...(viewColumns.find((c) => c.field === "description")?.view
          ? [
              {
                field: "description",
                headerName: "Description",
                flex: 2,
                // valueGetter: (params: any) => {
                //   const desc = params?.row?.description ?? params?.value ?? "";
                //   return String(desc).substring(0, 60) + "...";
                // },
                sortable: false,
              },
            ]
          : []),
        ...(viewColumns.find((c) => c.field === "status")?.view
          ? [
              {
                field: "status",
                headerName: "Status",
                width: 140,
                renderCell: (
                  params: GridRenderCellParams<Task, Task["status"]>,
                ) => {
                  const value = params.value;
                  const chipColor =
                    value === "completed"
                      ? "success"
                      : value === "in progress"
                      ? "info"
                      : "warning";

                  const label =
                    value === "in progress"
                      ? "In progress"
                      : value === "completed"
                      ? "Completed"
                      : "Pending";

                  return (
                    <Chip
                      size="small"
                      sx={{ justifySelf: "center" }}
                      label={label}
                      color={chipColor}
                    />
                  );
                },
              },
            ]
          : []),
        ...(viewColumns.find((c) => c.field === "dueDate")?.view
          ? [
              {
                field: "dueDate",
                headerName: "Due",
                type: "dateTime",
                width: 180,
                valueGetter: (params: any) => {
                  const raw = params?.row?.dueDate ?? params?.value;
                  return raw instanceof Date ? raw : raw ? new Date(raw) : null;
                },
              },
            ]
          : []),
        ...(viewColumns.find((c) => c.field === "createdAt")?.view
          ? [
              {
                field: "createdAt",
                headerName: "Created",
                type: "dateTime",
                width: 180,
                valueGetter: (params: any) => {
                  const raw = params?.row?.createdAt ?? params?.value;
                  return raw instanceof Date
                    ? raw
                    : raw
                    ? new Date(raw)
                    : new Date();
                },
              },
            ]
          : []),
        ...(viewColumns.find((c) => c.field === "modifiedAt")?.view
          ? [
              {
                field: "modifiedAt",
                headerName: "Modified",
                type: "dateTime",
                width: 180,
                valueGetter: (params: any) => {
                  const raw = params?.row?.modifiedAt ?? params?.value;
                  return raw instanceof Date
                    ? raw
                    : raw
                    ? new Date(raw)
                    : new Date();
                },
              },
            ]
          : []),
      ].filter(Boolean) as GridColDef<Task>[],
    [viewColumns],
  );

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;

    return tasks.filter((t) => {
      const haystack = [t.title, t.description ?? "", t.status]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [search, tasks]);

  useEffect(() => {
    // Fetch tasks from the backend API
    const getTasks = async () => {
      try {
        const response = await fetchTasks();
        setTasks(response.tasks);
      } catch (error) {
        // console.error("Error fetching tasks:", error);
        // Demo fallback when the API is unavailable.
        setTasks(demoTasks);
      }
    };
    getTasks();
  }, []);

  return (
    <Stack sx={{ height: "100%" }}>
      <Stack
        direction="row"
        spacing={2}
        justifyContent={"space-between"}
        mb={2}>
        <Typography variant="h5" component="h5">
          DTS Case Worker Tasks
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => {
            setIsReadOnly(false);
            setSelectedTask({
              title: "",
              description: "",
              status: "pending",
              dueDate: new Date(),
            });
            setIsDialogOpen(true);
          }}>
          New Task
        </Button>
      </Stack>
      <Stack direction="row" spacing={2} justifyContent={"space-between"}>
        <TextField
          id="outlined-basic"
          label="Search"
          variant="outlined"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearch("")}>
                    <ClearRounded />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <ToggleButtonGroup
          color="primary"
          value={view}
          exclusive
          onChange={(_, newView) => {
            if (newView !== null) {
              setView(newView);
            }
          }}>
          <Tooltip
            title="List view with sorting and pagination"
            placement="top">
            <ToggleButton value="list" sx={{ width: 56 }}>
              <ViewListRounded />
            </ToggleButton>
          </Tooltip>
          <Tooltip
            title="Kanban-style board for drag-and-drop task management"
            placement="top">
            <ToggleButton value="kanban" sx={{ width: 56 }}>
              <ViewKanbanRounded />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
        <IconButton
          color="primary"
          sx={{ width: 56 }}
          onClick={(e) => setSettingsAnchorEl(e.currentTarget)}>
          <Settings />
        </IconButton>
      </Stack>
      <Box flexGrow={1} sx={{ mt: 2, height: 560, width: "100%" }}>
        {view === "list" && filteredTasks.length ? (
          <DataGrid
            rows={filteredTasks}
            columns={columns}
            getRowId={(row) =>
              row._id ? row._id : Math.random().toString(36).substr(2, 9)
            }
            onRowClick={(params) => {
              setSelectedTask(params.row);
              setIsReadOnly(true);
              setIsDialogOpen(true);
            }}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
          />
        ) : (
          <Stack direction="row" spacing={2} justifyContent={"space-between"}>
            {statuses.map((status) => (
              <Box
                key={status}
                sx={{
                  flex: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const taskId =
                    e.dataTransfer.getData("text/task-id") ||
                    e.dataTransfer.getData("text/plain");
                  if (!taskId) return;
                  moveTaskToStatus(taskId, status);
                }}>
                <Typography variant="h6" component="h6" mb={1}>
                  {status.toUpperCase()}
                </Typography>
                <Stack spacing={1}>
                  {filteredTasks
                    .filter((t) => t.status === status)
                    .map((task) => (
                      <Card
                        key={task._id}
                        variant="elevation"
                        elevation={2}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "text/task-id",
                            task._id ?? "",
                          );
                          e.dataTransfer.setData("text/plain", task._id ?? "");
                          e.dataTransfer.effectAllowed = "move";
                        }}>
                        <CardContent sx={{ p: 1 }}>
                          <Typography variant="subtitle1" component="h3">
                            {task.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Due:{" "}
                            {new Date(task.dueDate).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            onClick={() => {
                              setSelectedTask(task);
                              setIsReadOnly(true);
                              setIsDialogOpen(true);
                            }}>
                            View
                          </Button>
                          <Button
                            size="small"
                            onClick={() => {
                              setSelectedTask(task);
                              setIsReadOnly(false);
                              setIsDialogOpen(true);
                            }}>
                            Edit
                          </Button>
                        </CardActions>
                      </Card>
                    ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth>
        <DialogTitle>Task Details</DialogTitle>
        <DialogContent>
          {selectedTask ? (
            <Stack spacing={2} sx={{ mt: 1, mb: 2 }}>
              <TextField
                label="Title"
                value={selectedTask.title}
                fullWidth
                slotProps={{
                  input: { readOnly: isReadOnly },
                }}
                onChange={(e) =>
                  setSelectedTask({ ...selectedTask, title: e.target.value })
                }
              />
              <TextField
                label="Description"
                value={selectedTask.description ?? ""}
                fullWidth
                multiline
                rows={4}
                slotProps={{
                  input: { readOnly: isReadOnly },
                }}
                onChange={(e) =>
                  setSelectedTask({
                    ...selectedTask,
                    description: e.target.value,
                  })
                }
              />
              <ToggleButtonGroup
                color="primary"
                value={selectedTask.status}
                sx={{ width: "100%" }}
                exclusive
                disabled={isReadOnly}
                onChange={(_, newStatus) => {
                  if (newStatus) {
                    setSelectedTask({ ...selectedTask, status: newStatus });
                  }
                }}>
                <ToggleButton value="pending" fullWidth>
                  Pending
                </ToggleButton>
                <ToggleButton value="in progress" fullWidth>
                  In progress
                </ToggleButton>
                <ToggleButton value="completed" fullWidth>
                  Completed
                </ToggleButton>
              </ToggleButtonGroup>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Due Date"
                  value={dayjs(selectedTask.dueDate)}
                  readOnly={isReadOnly}
                  onChange={(newValue) =>
                    setSelectedTask({
                      ...selectedTask,
                      dueDate: newValue?.toDate() ?? new Date(),
                    })
                  }
                />
              </LocalizationProvider>
            </Stack>
          ) : (
            <Typography variant="body1">No task selected.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          {isReadOnly ? (
            <>
              <Button
                onClick={() => setIsReadOnly(false)}
                color="primary"
                variant="outlined">
                Edit
              </Button>
              <Button
                onClick={() => setIsDialogOpen(false)}
                color="inherit"
                variant="outlined">
                Close
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleCancel} color="inherit" variant="outlined">
                Cancel
              </Button>
              <Button onClick={handleSave} color="primary" variant="contained">
                Save
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      <Popover
        open={isSettingsOpen}
        anchorEl={settingsAnchorEl}
        onClose={() => setSettingsAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}>
        <Box sx={{ width: 240 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{ p: 2 }}
            textAlign={"center"}>
            Column Visibility
          </Typography>
          <Divider />
          <Stack spacing={1} sx={{ p: 2 }}>
            {viewColumns.map((col) => (
              <Chip
                key={col.field}
                label={col.field}
                color={col.view ? "primary" : "default"}
                onClick={() => {
                  setViewColumns((prev) =>
                    prev.map((c) =>
                      c.field === col.field ? { ...c, view: !c.view } : c,
                    ),
                  );
                }}
              />
            ))}
          </Stack>
        </Box>
      </Popover>
    </Stack>
  );
}

export default App;
