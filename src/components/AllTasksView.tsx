import { useState } from "react";
import { TaskWithProject } from "../types";

interface AllTasksViewProps {
  tasks: TaskWithProject[];
  onEditTask: (task: TaskWithProject) => void;
  onBack: () => void;
  onRefresh: () => void;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

const statusColors: Record<string, string> = {
  pending: "#3b82f6",
  in_progress: "#f59e0b",
  completed: "#22c55e",
};

const priorityColors: Record<string, { bg: string; text: string }> = {
  low: { bg: "rgba(34, 197, 94, 0.15)", text: "#4ade80" },
  medium: { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24" },
  high: { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171" },
};

const projectColors = [
  { bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa" },
  { bg: "rgba(168, 85, 247, 0.15)", text: "#c084fc" },
  { bg: "rgba(236, 72, 153, 0.15)", text: "#f472b6" },
  { bg: "rgba(20, 184, 166, 0.15)", text: "#2dd4bf" },
  { bg: "rgba(249, 115, 22, 0.15)", text: "#fb923c" },
  { bg: "rgba(132, 204, 22, 0.15)", text: "#a3e635" },
];

function getProjectColor(index: number) {
  return projectColors[index % projectColors.length];
}

export function AllTasksView({
  tasks,
  onEditTask,
  onBack,
  onRefresh,
}: AllTasksViewProps) {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "in_progress" | "completed"
  >("all");

  const filteredTasks =
    statusFilter === "pending"
      ? tasks
      : tasks.filter((t) => t.status === statusFilter);

  const projectNames = [...new Set(tasks.map((t) => t.project_name))];
  const projectNameToIndex = new Map(projectNames.map((name, i) => [name, i]));

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <button className="btn-back" onClick={onBack}>
          ← Projects
        </button>
        <h1>All Tasks</h1>
        <button className="btn-primary" onClick={onRefresh}>
          ↻ Refresh
        </button>
      </div>

      <div className="all-tasks-filters">
        <button
          className={`toggle-btn${statusFilter === "all" ? " active" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          All
        </button>
        <button
          className={`toggle-btn${statusFilter === "pending" ? " active" : ""}`}
          onClick={() => setStatusFilter("pending")}
        >
          Pending
        </button>
        <button
          className={`toggle-btn${statusFilter === "in_progress" ? " active" : ""}`}
          onClick={() => setStatusFilter("in_progress")}
        >
          In Progress
        </button>
        <button
          className={`toggle-btn${statusFilter === "completed" ? " active" : ""}`}
          onClick={() => setStatusFilter("completed")}
        >
          Completed
        </button>
      </div>

      {filteredTasks.length === 0 ? (
        <p className="day-no-tasks">No tasks found.</p>
      ) : (
        <div className="all-tasks-list">
          {filteredTasks.map((task) => {
            const colorIdx = projectNameToIndex.get(task.project_name) ?? 0;
            const pColor = getProjectColor(colorIdx);
            const prColor = priorityColors[task.priority];
            return (
              <div
                key={task.id}
                className="all-task-item"
                onClick={() => onEditTask(task)}
              >
                <div className="all-task-left">
                  <span
                    className="all-task-status"
                    style={{ backgroundColor: statusColors[task.status] }}
                  />
                  <div className="all-task-info">
                    <h4>{task.title}</h4>
                    {task.description && <p>{task.description}</p>}
                  </div>
                </div>
                <div className="all-task-right">
                  <span
                    className="task-project-badge"
                    style={{ backgroundColor: pColor.bg, color: pColor.text }}
                  >
                    {task.project_name}
                  </span>
                  {task.due_time && (
                    <span className="all-task-time">🕐 {task.due_time}</span>
                  )}
                  <span className="all-task-date">
                    📅 {formatDate(task.due_date)}
                  </span>
                  <span
                    className="priority-badge"
                    style={{ backgroundColor: prColor.bg, color: prColor.text }}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
