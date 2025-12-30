import React, { createContext, useContext, useEffect, useState } from "react";
import { type TaskData } from "../types/taskType";
import axiosInstance from "../services/axiosInstance";

interface TaskContextType {
  tasks: TaskData[];
  setTasks: React.Dispatch<React.SetStateAction<TaskData[]>>;
  addTask: (task: TaskData) => void;
  cleanAllTasks: () => void;
  fetchTasks: () => Promise<void>;
  loading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(false);

  const addTask = (task: TaskData) => {
    setTasks((prev) => [task, ...prev.filter((t) => t.id !== task.id)]);
  };

  const cleanAllTasks = () => {
    setTasks([]);
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("Task/allTasks");
      setTasks(res.data.result);
    } catch (err) {
      console.error("Failed to fetch task in due task comp", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <TaskContext.Provider
      value={{ tasks, setTasks, addTask, cleanAllTasks, fetchTasks, loading }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context)
    throw new Error("useTaskContext must be used within a TaskProvider");
  return context;
};
