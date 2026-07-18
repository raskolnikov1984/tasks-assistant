import { useTimeTracker } from "../../hooks/useTimeTracker.ts";
import "./TasksTimer.css";

export const TimeTracker = () => {
  const { time, isRunning, toggleTimer, handleReset } = useTimeTracker();

  return (
    <div className="tasks-timer">
      <span className="tasks-timer-label">Timer</span>
      <div className="tasks-timer-display">
        <span className={`tasks-timer-time ${isRunning ? "running" : ""}`}>
          {time}
        </span>
        <span
          className={`tasks-timer-indicator ${isRunning ? "running" : ""}`}
        />
      </div>
      <div className="timer-controls">
        <button
          className={isRunning ? "timer-btn-pause" : "timer-btn-start"}
          onClick={toggleTimer}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button className="timer-btn-reset" onClick={handleReset}>
          Reset
        </button>
      </div>
    </div>
  );
};
