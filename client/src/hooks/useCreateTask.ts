import { message } from "antd";
import axiosInstance from "../services/axiosInstance";
import { type TaskData } from "../types/taskType";

export const useCreateTask = () => {
  const createTask = async (
    payload: Partial<TaskData>
  ): Promise<TaskData | null> => {
    try {
      const response = await axiosInstance.post<{ result: TaskData }>(
        "Task/save",
        payload
      );
      message.success("Task created successfully!");
      return response.data.result;
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Failed to create task");
      return null;
    }
  };

  return { createTask };
};
