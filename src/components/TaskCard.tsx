import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface TaskCardProps {
  task: Task;
  index: number;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function TaskCard({ task, index, onDelete, onEdit }: TaskCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const priorityColors = {
    low: { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80' },
    medium: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24' },
    high: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171' },
  };

  const colors = priorityColors[task.priority];

  function handleConfirmDelete() {
    setShowConfirm(false);
    onDelete(task.id);
  }

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="task-card"
          onClick={() => onEdit(task)}
        >
          <div className="task-header">
            <h3>{task.title}</h3>
            <button className="btn-delete" onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}>
              ×
            </button>
          </div>
          <p>{task.description}</p>
          <div className="task-footer">
            <span className="task-datetime">
              📅 {formatDate(task.due_date)}
              {task.due_time && <span> 🕐 {task.due_time}</span>}
            </span>
            <span
              className="priority-badge"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {task.priority}
            </span>
          </div>
          {showConfirm && (
            <ConfirmModal
              message="Delete this task?"
              onConfirm={handleConfirmDelete}
              onCancel={() => setShowConfirm(false)}
            />
          )}
        </div>
      )}
    </Draggable>
  );
}
