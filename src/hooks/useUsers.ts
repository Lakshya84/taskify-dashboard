import { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";

export interface User {
  id: string;
  name: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isUserLoading, setIsUserLoading] = useState<boolean>(true);

  useEffect(() => {
    axiosInstance
      .get("/Task/users")
      .then((res) => {
        setUsers(res.data.result);
      })
      .catch((err) => {
        console.error("Failed to fetch users", err);
         setUsers([]); 
      })
      .finally(() => {
        setIsUserLoading(false);
      });
  }, []);

  return { users, isUserLoading };
};
