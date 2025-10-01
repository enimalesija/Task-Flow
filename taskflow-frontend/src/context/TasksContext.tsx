import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  listTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
} from "../utils/api";
import type { Task, Status, Priority } from "../types";
import { useProjects } from "./ProjectsContext";

type Board = Record<Status, Task[]>;

type Ctx = {
  board: Board;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  createTask: (
    t: Partial<Task> & { title: string; status?: Status }
  ) => Promise<void>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  moveTask: (id: string, to: Status, toIndex: number) => Promise<void>;
  reorderWithin: (col: Status, fromIndex: number, toIndex: number) => void;
};

const TasksCtx = createContext<Ctx | null>(null);

/* ------------------------------
   Helpers
------------------------------ */
function normalizeTask(t: any): Task {
  const created =
    typeof t?.createdAt === "string"
      ? Date.parse(t.createdAt)
      : typeof t?.createdAt === "number"
      ? t.createdAt
      : Date.now();

  const updated =
    typeof t?.updatedAt === "string"
      ? Date.parse(t.updatedAt)
      : typeof t?.updatedAt === "number"
      ? t.updatedAt
      : Date.now();

  let assignee: Task["assignee"] = undefined;
  if (typeof t.assignee === "string") {
    assignee = { name: t.assignee };
  } else if (t.assignee && typeof t.assignee === "object") {
    assignee = { id: t.assignee.id, name: t.assignee.name ?? "" };
  }

  const dueDate =
    t.dueDate != null
      ? typeof t.dueDate === "string"
        ? Date.parse(t.dueDate)
        : Number(t.dueDate)
      : undefined;

  return {
    id: t.id || t._id,
    projectId: t.projectId || t.project,
    title: t.title,
    description: t.description ?? "",
    status: t.status,
    priority: (t.priority ?? "medium") as Priority,
    dueDate,
    assignee,
    tags: Array.isArray(t.tags) ? t.tags : [],
    createdAt: created,
    updatedAt: updated,
  };
}

function prepareTaskForApi(
  input: Partial<Task> & { title: string; status?: Status }
) {
  let assignee: any = undefined;
  if (typeof input.assignee === "string" && input.assignee.trim()) {
    assignee = { name: input.assignee.trim() };
  } else if (input.assignee && typeof input.assignee === "object") {
    assignee = { id: input.assignee.id, name: input.assignee.name };
  }

  let dueDate: number | undefined = undefined;
  if (input.dueDate) {
    dueDate =
      typeof input.dueDate === "string"
        ? Date.parse(input.dueDate)
        : input.dueDate;
  }

  return {
    title: input.title,
    description: input.description ?? "",
    status: input.status ?? "todo",
    priority: (input.priority ?? "medium") as Priority,
    dueDate,
    assignee,
    tags: input.tags ?? [],
  };
}

/* ------------------------------
   Provider
------------------------------ */
export function TasksProvider({ children }: { children: React.ReactNode }) {
  const { current } = useProjects();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!current?.id) {
        if (!mounted.current || cancelled) return;
        setTasks([]);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await listTasks(current.id);
        if (!mounted.current || cancelled) return;
        setTasks((data || []).map(normalizeTask));
      } catch (e: any) {
        if (!mounted.current || cancelled) return;
        setError(e?.message || "Failed to load tasks");
        setTasks([]);
      } finally {
        if (!mounted.current || cancelled) return;
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [current?.id]);

  const board = useMemo<Board>(
    () => ({
      todo: (tasks || []).filter((t) => t.status === "todo"),
      inprogress: (tasks || []).filter((t) => t.status === "inprogress"),
      done: (tasks || []).filter((t) => t.status === "done"),
    }),
    [tasks]
  );

  async function reload() {
    if (!current?.id) {
      setTasks([]);
      return;
    }
    const data = await listTasks(current.id);
    setTasks((data || []).map(normalizeTask));
  }

  async function createTask(
    input: Partial<Task> & { title: string; status?: Status }
  ) {
    if (!current?.id) throw new Error("No project selected");

    const body = { projectId: current.id, ...prepareTaskForApi(input) };
    const created = await apiCreateTask(body);
    setTasks((prev) => [normalizeTask(created), ...prev]);
  }

  async function updateTask(id: string, patch: Partial<Task>) {
    const existing = tasks.find((t) => t.id === id);
    if (!existing) return;

    const merged: Partial<Task> & { title: string } = {
      ...existing,
      ...patch,
      title: patch.title ?? existing.title,
    };

    const body = prepareTaskForApi(merged);
    const updated = await apiUpdateTask(id, body);

    const nt = normalizeTask(updated);
    setTasks((prev) => prev.map((t) => (t.id === id ? nt : t)));
  }

  async function removeTask(id: string) {
    await apiDeleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function moveTask(id: string, to: Status, toIndex: number) {
    setTasks((prev) => {
      const copy = [...prev];
      const i = copy.findIndex((t) => t.id === id);
      if (i === -1) return prev;
      const [item] = copy.splice(i, 1);
      item.status = to;

      const same = copy.filter((t) => t.status === to);
      const idx = Math.min(Math.max(0, toIndex), same.length);

      const others = copy.filter((t) => t.status !== to);
      const before: Task[] = [];
      const after: Task[] = [];
      let count = 0;
      for (const t of copy) {
        if (t.status === to) {
          (count < idx ? before : after).push(t);
          count++;
        }
      }
      return [...others, ...before, item, ...after];
    });
    await updateTask(id, { status: to });
  }

  function reorderWithin(col: Status, fromIndex: number, toIndex: number) {
    setTasks((prev) => {
      const colTasks = prev.filter((t) => t.status === col);
      const others = prev.filter((t) => t.status !== col);
      if (fromIndex < 0 || fromIndex >= colTasks.length) return prev;
      const reordered = [...colTasks];
      const [item] = reordered.splice(fromIndex, 1);
      const idx = Math.min(Math.max(0, toIndex), reordered.length);
      reordered.splice(idx, 0, item);
      return [...others, ...reordered];
    });
  }

  return (
    <TasksCtx.Provider
      value={{
        board,
        loading,
        error,
        reload,
        createTask,
        updateTask,
        removeTask,
        moveTask,
        reorderWithin,
      }}
    >
      {children}
    </TasksCtx.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksCtx);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
}
