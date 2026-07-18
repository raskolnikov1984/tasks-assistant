import { useState, useEffect } from "react";
import { timeFormatter } from "../utils";

export const useTimeTracker = () => {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleReset = () => {
    setTime(0);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (isRunning) {
        setTime((prevTime) => prevTime + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  return {
    time: timeFormatter(time),
    isRunning,
    handleReset,
    toggleTimer,
  };
};
