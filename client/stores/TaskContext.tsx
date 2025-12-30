// import React, { createContext, useContext, useState } from "react";
// import { type TaskData } from "../src/types/taskType";

// interface TaskContextType {
//   tasks: TaskData[];
//   setTasks: React.Dispatch<React.SetStateAction<TaskData[]>>;
//   addTask: (task: TaskData) => void;
//   cleanAllTasks: () => void;
// }

// const TaskContext = createContext<TaskContextType | undefined>(undefined);

// export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [tasks, setTasks] = useState<TaskData[]>([]);

//   const addTask = (task: TaskData) => {
//     setTasks((prev) => [task, ...prev.filter((t) => t.id !== task.id)]);
//   };

//   const cleanAllTasks = () => {
//     setTasks([]);
//   };

//   return (
//     <TaskContext.Provider value={{ tasks, setTasks, addTask, cleanAllTasks }}>
//       {children}
//     </TaskContext.Provider>
//   );
// };

// export const useTaskContext = (): TaskContextType => {
//   const context = useContext(TaskContext);
//   if (!context)
//     throw new Error("useTaskContext must be used within a TaskProvider");
//   return context;
// };
