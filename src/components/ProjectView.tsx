import { useState, useEffect } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { api } from "../services/api";
import { Project, Task, TaskStatus } from "../types";
import { TaskCard } from "./TaskCard";
import { CalendarView } from "./CalendarView";
import { ConfirmModal } from "./ConfirmModal";
import { TimeTracker } from "./TimeTracker";

interface ProjectViewProps {
  project: Project;
  onBack: () => void;
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: "pending", title: "Pending", color: "#3b82f6" },
  { id: "in_progress", title: "In Progress", color: "#f59e0b" },
  { id: "completed", title: "Completed", color: "#22c55e" },
];

function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

export function ProjectView({ project, onBack }: ProjectViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<"board" | "calendar">("board");
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState(getTodayISO());
  const [dueTime, setDueTime] = useState("");
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [project.id]);

  async function loadTasks() {
    const data = await api.getTasks(project.id);
    setTasks(data);
  }

  function openCreateModal(
    status: TaskStatus | null = null,
    dateOverride?: string,
  ) {
    setEditingTask(null);
    setSelectedStatus(status);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate(dateOverride || getTodayISO());
    setDueTime("");
    setShowModal(true);
  }

  function handleCreateFromCalendar(date: string) {
    openCreateModal(null, date);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setSelectedStatus(null);
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setDueDate(task.due_date);
    setDueTime(task.due_time || "");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingTask(null);
    setSelectedStatus(null);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate(getTodayISO());
    setDueTime("");
  }

  async function handleSubmitTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      await api.updateTask(
        editingTask.id,
        title,
        description,
        priority,
        dueDate,
        dueTime || null,
      );
    } else {
      const status = selectedStatus || "pending";
      await api.createTask(
        project.id,
        title,
        description,
        priority,
        dueDate,
        dueTime || null,
      );
      const allTasks = await api.getTasks(project.id);
      const created = allTasks[allTasks.length - 1];
      if (created && status !== "pending") {
        await api.moveTask(created.id, status);
      }
    }

    closeModal();
    loadTasks();
  }

  async function handleDeleteTask(id: string) {
    setDeleteTaskId(id);
  }

  async function confirmDeleteTask() {
    if (!deleteTaskId) return;
    await api.deleteTask(deleteTaskId);
    setDeleteTaskId(null);
    loadTasks();
  }

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as TaskStatus;

    await api.moveTask(taskId, newStatus);
    loadTasks();
  }

  function getTasksByStatus(status: TaskStatus): Task[] {
    return tasks.filter((t) => t.status === status);
  }

  return (
    <div className="project-view">
      <div className="project-header">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <div className="project-info">
          <h1>{project.name}</h1>
          <div
            className={`project-description${descExpanded ? " expanded" : ""}`}
          >
            <p>{project.description}</p>
          </div>
          {project.description && project.description.length > 80 && (
            <button
              className="btn-toggle-desc"
              onClick={() => setDescExpanded(!descExpanded)}
            >
              {descExpanded ? "Ver menos" : "Ver más"}
            </button>
          )}
        </div>
        <div className="view-toggle">
          <button
            className={`toggle-btn${viewMode === "board" ? " active" : ""}`}
            onClick={() => setViewMode("board")}
          >
            Board
          </button>
          <button
            className={`toggle-btn${viewMode === "calendar" ? " active" : ""}`}
            onClick={() => setViewMode("calendar")}
          >
            Calendar
          </button>
        </div>
        {viewMode === "board" && (
          <button className="btn-primary" onClick={() => openCreateModal()}>
            + New Task
          </button>
        )}
      </div>

      <TimeTracker />

      {viewMode === "board" ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="kanban-board">
            {columns.map((col) => (
              <div
                key={col.id}
                className="kanban-column"
                style={{ borderLeft: `3px solid ${col.color}` }}
              >
                <div
                  className="kanban-column-header"
                  style={{ backgroundColor: `${col.color}15` }}
                >
                  <h2>{col.title}</h2>
                  <span className="task-count">
                    {getTasksByStatus(col.id).length}
                  </span>
                  <button
                    className="add-task-btn"
                    style={{ borderColor: `${col.color}40`, color: col.color }}
                    onClick={() => openCreateModal(col.id)}
                  >
                    +
                  </button>
                </div>
                <Droppable droppableId={col.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="task-list"
                    >
                      {getTasksByStatus(col.id).map((task, index) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          index={index}
                          onDelete={handleDeleteTask}
                          onEdit={openEditModal}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      ) : (
        <CalendarView
          tasks={tasks}
          onEditTask={openEditModal}
          onCreateTask={handleCreateFromCalendar}
        />
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>
              {editingTask
                ? "Edit Task"
                : `Create Task${selectedStatus ? ` → ${columns.find((c) => c.id === selectedStatus)?.title}` : ""}`}
            </h2>
            <form onSubmit={handleSubmitTask}>
              <input
                type="text"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "low" | "medium" | "high")
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <div className="datetime-row">
                <div className="datetime-field">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="datetime-field">
                  <label>Time (optional)</label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTask ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTaskId && (
        <ConfirmModal
          message="Delete this task?"
          onConfirm={confirmDeleteTask}
          onCancel={() => setDeleteTaskId(null)}
        />
      )}
    </div>
  );
}
