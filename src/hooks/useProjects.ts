import { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("Task/projects") 
      .then((response) => {
        setProjects(response.data.result || []);
      })
      .catch((error) => {
        console.error("Failed to fetch projects:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { projects, isLoading };
};
