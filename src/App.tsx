import { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  Alert,
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
  IconButton,
  InputAdornment,
  Skeleton,
  Snackbar,
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
  NotificationImportantRounded,
  VisibilityRounded,
  EditRounded,
  DeleteRounded,
} from "@mui/icons-material";
import {
  DataGrid,
  GridToolbar,
  type GridColumnVisibilityModel,
  type GridColDef,
  type GridPaginationModel,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import type Task from "./models/task";
import { fetchTasks } from "./api/api";
import { demoTasks } from "./models/demoTasks";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "kanban">("list");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);

  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>({
      title: true,
      description: true,
      status: true,
      dueDate: true,
      createdAt: false,
      modifiedAt: false,
      actions: true,
    });

  const pageSizeStorageKey = "dts.tasksGrid.pageSize";
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(
    () => {
      const stored = sessionStorage.getItem(pageSizeStorageKey);
      const pageSize = stored ? Number.parseInt(stored, 10) : 10;
      return {
        page: 0,
        pageSize: Number.isFinite(pageSize) ? pageSize : 10,
      };
    },
  );

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

  const toDate = (raw: unknown): Date | null => {
    if (raw instanceof Date) return raw;
    if (typeof raw === "string" || typeof raw === "number")
      return new Date(raw);
    return null;
  };

  const formatRelativeDue = (due: Date, status: Task["status"]): string => {
    const diffMs = due.getTime() - Date.now();
    const absSeconds = Math.abs(diffMs) / 1000;

    if (absSeconds < 45) {
      return status === "completed" ? "due just now" : "due now";
    }

    let unit: "minute" | "hour" | "day" = "day";
    let count = 0;

    if (absSeconds < 60 * 60) {
      unit = "minute";
      count = Math.max(1, Math.round(absSeconds / 60));
    } else if (absSeconds < 60 * 60 * 24) {
      unit = "hour";
      count = Math.max(1, Math.round(absSeconds / (60 * 60)));
    } else {
      unit = "day";
      count = Math.max(1, Math.round(absSeconds / (60 * 60 * 24)));
    }

    const plural = count === 1 ? "" : "s";

    if (diffMs >= 0) {
      return `in ${count} ${unit}${plural}`;
    }

    // Only show "late" when the task isn't completed.
    if (status !== "completed") {
      return `${count} ${unit}${plural} late`;
    }

    return `${count} ${unit}${plural} ago`;
  };

  const columns: GridColDef<Task>[] = useMemo(
    () => [
      {
        field: "title",
        headerName: "Title",
        flex: 1,
        renderCell: (params: GridRenderCellParams<Task, string>) => {
          const due = toDate(params.row.dueDate);
          const isLate =
            !!due &&
            due.getTime() < Date.now() &&
            params.row.status !== "completed";

          return (
            <Stack direction="row" spacing={1} alignItems="center">
              {isLate ? (
                <Tooltip title="Overdue" placement="top" arrow>
                  <NotificationImportantRounded
                    fontSize="small"
                    color="error"
                    className="overdueVibrate"
                  />
                </Tooltip>
              ) : null}
              <span>{params.value ?? params.row.title}</span>
            </Stack>
          );
        },
      },
      {
        field: "description",
        headerName: "Description",
        flex: 2,
        sortable: false,
      },
      {
        field: "status",
        headerName: "Status",
        width: 140,
        renderCell: (params: GridRenderCellParams<Task, Task["status"]>) => {
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
      {
        field: "dueDate",
        headerName: "Due",
        type: "dateTime",
        width: 180,
        valueGetter: (value: unknown, row: Task): Date | null => {
          return toDate(row?.dueDate ?? value);
        },
        renderCell: (params: GridRenderCellParams<Task, Date | null>) => {
          const due = toDate(params.row.dueDate);
          if (!due) return "";

          const relative = formatRelativeDue(due, params.row.status);
          const absolute = due.toLocaleString();

          return (
            <Tooltip title={absolute} placement="top" arrow>
              <span>{relative}</span>
            </Tooltip>
          );
        },
      },
      {
        field: "createdAt",
        headerName: "Created",
        type: "dateTime",
        width: 180,
        valueGetter: (value: unknown, row: Task): Date | null => {
          return toDate(row?.createdAt ?? value);
        },
      },
      {
        field: "modifiedAt",
        headerName: "Modified",
        type: "dateTime",
        width: 180,
        valueGetter: (value: unknown, row: Task): Date | null => {
          return toDate(row?.modifiedAt ?? value);
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 140,
        maxWidth: 140,
        minWidth: 140,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        hideable: false,
        align: "center",
        headerAlign: "center",
        renderCell: (params: GridRenderCellParams<Task>) => (
          <Stack
            direction="row"
            spacing={0.5}
            justifyContent="center"
            alignItems="center"
            height={"100%"}
          >
            <Tooltip title="View" placement="top" arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTask(params.row);
                  setIsReadOnly(true);
                  setIsDialogOpen(true);
                }}
              >
                <VisibilityRounded fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Edit" placement="top" arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTask(params.row);
                  setIsReadOnly(false);
                  setIsDialogOpen(true);
                }}
              >
                <EditRounded fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete" placement="top" arrow>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  const idToDelete = params.row._id;
                  setTasks((prev) => prev.filter((t) => t._id !== idToDelete));
                  setSelectedTask((prev) => {
                    if (prev?._id !== idToDelete) return prev;
                    setIsReadOnly(true);
                    setIsDialogOpen(false);
                    return null;
                  });
                }}
              >
                <DeleteRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [columnVisibilityModel],
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
        setIsUsingDemoData(false);
      } catch (error) {
        // console.error("Error fetching tasks:", error);
        // Demo fallback when the API is unavailable.
        setIsUsingDemoData(true);
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
        mb={2}
      >
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
          }}
        >
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
          }}
        >
          <Tooltip
            title="List view with sorting and pagination"
            placement="top"
          >
            <ToggleButton value="list" sx={{ width: 56 }}>
              <ViewListRounded />
            </ToggleButton>
          </Tooltip>
          <Tooltip
            title="Kanban-style board for drag-and-drop task management"
            placement="top"
          >
            <ToggleButton value="kanban" sx={{ width: 56 }}>
              <ViewKanbanRounded />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      </Stack>
      <Box flexGrow={1} sx={{ mt: 2, height: 560, width: "100%" }}>
        {view === "list" && filteredTasks.length ? (
          <DataGrid
            rows={filteredTasks}
            columns={columns}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={setColumnVisibilityModel}
            getRowId={(row) =>
              row._id ? row._id : Math.random().toString(36).substr(2, 9)
            }
            onRowClick={(params) => {
              setSelectedTask(params.row);
              setIsReadOnly(true);
              setIsDialogOpen(true);
            }}
            paginationModel={paginationModel}
            onPaginationModelChange={(model) => {
              setPaginationModel(model);
              if (model.pageSize !== paginationModel.pageSize) {
                sessionStorage.setItem(
                  pageSizeStorageKey,
                  String(model.pageSize),
                );
              }
            }}
            pageSizeOptions={[5, 10, 25]}
            slots={{ toolbar: GridToolbar }}
          />
        ) : view === "kanban" ? (
          <Stack
            direction="row"
            spacing={2}
            justifyContent={"space-between"}
            sx={{ height: "100%", overflow: "hidden" }}
          >
            {statuses.map((status) => (
              <Box
                key={status}
                sx={{
                  flex: 1,
                  border: "1px solid",
                  borderColor:
                    status === "completed"
                      ? "success.main"
                      : status === "in progress"
                      ? "info.main"
                      : "warning.main",
                  borderRadius: 1,
                  pl: 1,
                  pr: 0.5,
                  py: 1,
                  display: "flex",
                  flexDirection: "column",
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
                }}
              >
                <Typography variant="h6" component="h6" mb={1}>
                  {status.toUpperCase()}
                </Typography>
                <Stack
                  spacing={1}
                  sx={{
                    height: "calc(100% - 48px)",
                    overflowY: "auto",
                    pl: "2px",
                    pt: "2px",
                    pr: 0.75,
                    pb: 1,
                  }}
                >
                  {filteredTasks
                    .filter((t) => t.status === status)
                    .map((task) => (
                      <Card
                        key={task._id}
                        variant="outlined"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "text/task-id",
                            task._id ?? "",
                          );
                          e.dataTransfer.setData("text/plain", task._id ?? "");
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        sx={{
                          opacity: task.status === status ? 1 : 0.5,
                          cursor: "move",
                          minHeight: 111,
                          borderColor:
                            new Date(task.dueDate).getTime() < Date.now() &&
                            task.status !== "completed"
                              ? "error.main"
                              : "#aaa",
                        }}
                      >
                        <CardContent sx={{ p: 1 }}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            justifyContent="center"
                          >
                            {new Date(task.dueDate).getTime() < Date.now() &&
                            task.status !== "completed" ? (
                              <Tooltip title="Overdue" placement="top" arrow>
                                <NotificationImportantRounded
                                  fontSize="small"
                                  color="error"
                                  className="overdueVibrate"
                                />
                              </Tooltip>
                            ) : null}
                            <Typography variant="subtitle1" component="h3">
                              {task.title}
                            </Typography>
                          </Stack>
                          <Tooltip
                            title={new Date(task.dueDate).toLocaleString()}
                            placement="bottom"
                            arrow
                          >
                            <Typography
                              variant="body2"
                              color={
                                new Date(task.dueDate).getTime() < Date.now() &&
                                task.status !== "completed"
                                  ? "error"
                                  : "text.secondary"
                              }
                              fontWeight={
                                new Date(task.dueDate).getTime() < Date.now() &&
                                task.status !== "completed"
                                  ? "bold"
                                  : "normal"
                              }
                            >
                              {status !== "completed" ? `Due: ` : `Completed: `}
                              <span>
                                {formatRelativeDue(
                                  new Date(task.dueDate),
                                  task.status,
                                )}
                              </span>
                            </Typography>
                          </Tooltip>
                        </CardContent>
                        <CardActions>
                          <Stack direction="row" spacing={1} flexGrow={1}>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => {
                                setSelectedTask(task);
                                setIsReadOnly(true);
                                setIsDialogOpen(true);
                              }}
                            >
                              View
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setSelectedTask(task);
                                setIsReadOnly(false);
                                setIsDialogOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                          </Stack>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => {
                              const idToDelete = task._id;
                              setTasks((prev) =>
                                prev.filter((t) => t._id !== idToDelete),
                              );
                              setSelectedTask((prev) => {
                                if (prev?._id !== idToDelete) return prev;
                                setIsReadOnly(true);
                                setIsDialogOpen(false);
                                return null;
                              });
                            }}
                          >
                            Delete
                          </Button>
                        </CardActions>
                      </Card>
                    ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : (
          <Stack spacing={1}>
            <Skeleton variant="rounded" width="100%" height={100} />
            <Skeleton variant="rounded" width="100%" height={60} />
            <Skeleton variant="rounded" width="100%" height={30} />
          </Stack>
        )}
      </Box>
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
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
                }}
              >
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
                variant="outlined"
              >
                Edit
              </Button>
              <Button
                onClick={() => setIsDialogOpen(false)}
                color="inherit"
                variant="outlined"
              >
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
      <Snackbar
        open={isUsingDemoData}
        onClose={() => setIsUsingDemoData(false)}
        slotProps={{
          clickAwayListener: {
            onClickAway: (event: any) => {
              (
                event as Event & { defaultMuiPrevented?: boolean }
              ).defaultMuiPrevented = true;
            },
          },
        }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert
          severity="warning"
          sx={{ borderRadius: 3 }}
          onClose={() => setIsUsingDemoData(false)}
        >
          Unable to fetch tasks from the API. Displaying demo data instead.
        </Alert>
      </Snackbar>
    </Stack>
  );
}

export default App;
