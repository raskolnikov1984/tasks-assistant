import { useState, useEffect } from "react";
import "./TasksTimer.css";

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hoursStr = hours.toString().padStart(2, "0");
  const minutesStr = minutes.toString().padStart(2, "0");
  const secondsStr = seconds.toString().padStart(2, "0");

  return `${hoursStr}:${minutesStr}:${secondsStr}`;
};

export const TasksTimer = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const handleReset = () => {
    setTime(0);
    setIsRunning(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (isRunning) {
        setTime((prevTime) => prevTime + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  return (
    <div className="tasks-timer">
      <span className="tasks-timer-label">Timer</span>
      <div className="tasks-timer-display">
        <span
          className={`tasks-timer-time ${isRunning ? "running" : ""}`}
        >
          {formatTime(time)}
        </span>
        <span
          className={`tasks-timer-indicator ${isRunning ? "running" : ""}`}
        />
      </div>
      <div className="timer-controls">
        <button
          className={isRunning ? "timer-btn-pause" : "timer-btn-start"}
          onClick={() => setIsRunning(!isRunning)}
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
