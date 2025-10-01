import { useEffect, useState } from "react";
import type { Task } from "../types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setTasks([
        { id: "a1", title: "Sample task", priority: "medium" },
      ]);
      setLoading(false);
    }, 300);
  }, []);

  return { tasks, loading, setTasks };
}
