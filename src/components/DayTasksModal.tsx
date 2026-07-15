import { Task } from '../types';

interface DayTasksModalProps {
  date: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onCreateTask: (date: string) => void;
  onClose: () => void;
}

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

const statusColors: Record<string, string> = {
  pending: '#3b82f6',
  in_progress: '#f59e0b',
  completed: '#22c55e',
};

export function DayTasksModal({ date, tasks, onEditTask, onCreateTask, onClose }: DayTasksModalProps) {
  function handleCreate() {
    onClose();
    onCreateTask(date);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Tasks for {formatDisplayDate(date)}</h2>

        {tasks.length === 0 ? (
          <p className="day-no-tasks">No tasks scheduled for this day.</p>
        ) : (
          <div className="day-tasks-list">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="day-task-item"
                onClick={() => { onClose(); onEditTask(task); }}
              >
                <div className="day-task-info">
                  <span className="day-task-status" style={{ backgroundColor: statusColors[task.status] }} />
                  <div>
                    <h4>{task.title}</h4>
                    {task.description && <p>{task.description}</p>}
                  </div>
                </div>
                <div className="day-task-meta">
                  {task.due_time && <span className="day-task-time">🕐 {task.due_time}</span>}
                  <span className="priority-badge" style={{ backgroundColor: `${task.priority === 'low' ? 'rgba(34,197,94,0.15)' : task.priority === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'}`, color: task.priority === 'low' ? '#4ade80' : task.priority === 'medium' ? '#fbbf24' : '#f87171' }}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn-create-calendar" onClick={handleCreate}>+ Add Task</button>
          <button type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
