import { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import type Task from "./models/task";
import { fetchTasks } from "./api/api";
import { demoTasks } from "./models/demoTasks";
import {
  ClearRounded,
  ViewListRounded,
  ViewKanbanRounded,
  Add,
} from "@mui/icons-material";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "kanban">("list");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);

  const statuses = useMemo(() => {
    return ["pending", "in progress", "completed"] as const;
  }, []);

  const moveTaskToStatus = (taskId: string, nextStatus: Task["status"]) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: nextStatus } : t)),
    );
  };

  const columns: GridColDef<Task>[] = useMemo(
    () => [
      {
        field: "title",
        headerName: "Title",
        flex: 1,
        minWidth: 260,
      },
      {
        field: "description",
        headerName: "Description",
        flex: 2,
        minWidth: 200,
        valueGetter: (_value, row) =>
          String(row.description ?? "").substring(0, 60) + "...",
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
        valueGetter: (_value, row) =>
          row.dueDate instanceof Date ? row.dueDate : new Date(row.dueDate),
      },
      {
        field: "createdAt",
        headerName: "Created",
        type: "dateTime",
        width: 180,
        valueGetter: (_value, row) =>
          row.createdAt instanceof Date
            ? row.createdAt
            : row.createdAt
            ? new Date(row.createdAt)
            : new Date(),
      },
      {
        field: "modifiedAt",
        headerName: "Modified",
        type: "dateTime",
        width: 180,
        valueGetter: (_value, row) =>
          row.modifiedAt instanceof Date
            ? row.modifiedAt
            : row.modifiedAt
            ? new Date(row.modifiedAt)
            : new Date(),
      },
    ],
    [],
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
                }}
              >
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
                        sx={{ p: 1 }}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "text/task-id",
                            task._id ?? "",
                          );
                          e.dataTransfer.setData("text/plain", task._id ?? "");
                          e.dataTransfer.effectAllowed = "move";
                        }}
                      >
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
                <ToggleButton value="pending">Pending</ToggleButton>
                <ToggleButton value="in progress">In progress</ToggleButton>
                <ToggleButton value="completed">Completed</ToggleButton>
              </ToggleButtonGroup>
              <TextField
                label="Due Date"
                value={new Date(selectedTask.dueDate).toLocaleString()}
                fullWidth
                slotProps={{
                  input: { readOnly: isReadOnly },
                }}
              />
            </Stack>
          ) : (
            <Typography variant="body1">No task selected.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          {isReadOnly ? (
            <Button
              onClick={() => setIsReadOnly(false)}
              color="primary"
              variant="outlined"
            >
              Edit
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setIsReadOnly(true)}
                color="inherit"
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setIsReadOnly(true)}
                color="primary"
                variant="contained"
              >
                Save
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default App;
