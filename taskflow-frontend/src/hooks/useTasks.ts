import { useEffect, useState } from "react";
import type { Task } from "../types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setTasks([
        {
          id: "a1",
          projectId: "demo",
          title: "Sample task",
          description: "This is a placeholder task",
          status: "todo",
          priority: "medium",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]);
      setLoading(false);
    }, 300);
  }, []);

  return { tasks, loading, setTasks };
}
