import { useState } from 'react';
import { Task } from '../types';
import { DayTasksModal } from './DayTasksModal';

interface CalendarViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onCreateTask: (date: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateISO(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function isToday(year: number, month: number, day: number): boolean {
  const today = new Date();
  return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
}

export function CalendarView({ tasks, onEditTask, onCreateTask }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  function getTasksForDate(dateStr: string): Task[] {
    return tasks.filter((t) => t.due_date === dateStr);
  }

  const priorityDots: Record<string, string> = {
    low: '#4ade80',
    medium: '#fbbf24',
    high: '#f87171',
  };

  const calendarDays: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  const prevMonthDays = getDaysInMonth(year, month - 1);
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    calendarDays.push({ day, dateStr: formatDateISO(prevYear, prevMonth, day), isCurrentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({ day, dateStr: formatDateISO(year, month, day), isCurrentMonth: true });
  }

  const remaining = 42 - calendarDays.length;
  for (let day = 1; day <= remaining; day++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    calendarDays.push({ day, dateStr: formatDateISO(nextYear, nextMonth, day), isCurrentMonth: false });
  }

  return (
    <div className="calendar-view">
      <div className="calendar-header-nav">
        <button className="btn-back" onClick={prevMonth}>←</button>
        <h2>{MONTH_NAMES[month]} {year}</h2>
        <button className="btn-back" onClick={nextMonth}>→</button>
      </div>

      <div className="calendar-grid">
        {DAY_NAMES.map((d) => (
          <div key={d} className="calendar-day-name">{d}</div>
        ))}

        {calendarDays.map((cell) => {
          const dayTasks = getTasksForDate(cell.dateStr);
          const today = isToday(year, month, cell.day);
          return (
            <div
              key={cell.dateStr}
              className={`calendar-day${cell.isCurrentMonth ? '' : ' other-month'}${today ? ' today' : ''}`}
              onClick={() => setSelectedDate(cell.dateStr)}
            >
              <span className="calendar-day-number">{cell.day}</span>
              <div className="calendar-day-tasks">
                {dayTasks.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    className="task-dot"
                    style={{ backgroundColor: priorityDots[t.priority] }}
                    title={t.title}
                  />
                ))}
                {dayTasks.length > 3 && (
                  <span className="task-more">+{dayTasks.length - 3}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <DayTasksModal
          date={selectedDate}
          tasks={getTasksForDate(selectedDate)}
          onEditTask={onEditTask}
          onCreateTask={onCreateTask}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
