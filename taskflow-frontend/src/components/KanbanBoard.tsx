import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useMemo, useState } from "react";
import { useTasks } from "../context/TasksContext";
import { useProjects } from "../context/ProjectsContext";
import type { Task, Status, Priority } from "../types";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import Toast from "./Toast";

const sections: {
  id: Status;
  title: string;
  icon: string;
  colorClass: string;
}[] = [
  {
    id: "todo",
    title: "To Do",
    icon: "fa-regular fa-rectangle-list",
    colorClass: "icon--todo",
  },
  {
    id: "inprogress",
    title: "In Progress",
    icon: "fa-solid fa-spinner",
    colorClass: "icon--inprogress",
  },
  {
    id: "done",
    title: "Done",
    icon: "fa-solid fa-circle-check",
    colorClass: "icon--done",
  },
];

type SortBy = "updated" | "created" | "due" | "priority";
const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

function sortTasks(list: Task[], by: SortBy): Task[] {
  const copy = [...list];
  switch (by) {
    case "updated":
      return copy.sort((a, b) => b.updatedAt - a.updatedAt);
    case "created":
      return copy.sort((a, b) => b.createdAt - a.createdAt);
    case "due":
      return copy.sort(
        (a, b) => (a.dueDate ?? Infinity) - (b.dueDate ?? Infinity)
      );
    case "priority":
      return copy.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );
    default:
      return copy;
  }
}

function dueState(task: Task): "overdue" | "soon" | "none" {
  if (!task.dueDate) return "none";
  const now = Date.now();
  if (task.dueDate < now) return "overdue";
  if (task.dueDate - now < 86400000) return "soon";
  return "none";
}

export default function KanbanBoard() {
  const {
    board,
    moveTask,
    reorderWithin,
    createTask,
    updateTask,
    removeTask,
    loading,
    error,
  } = useTasks();
  const { current } = useProjects();

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [filterTag, setFilterTag] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("updated");

  const [quickTitle, setQuickTitle] = useState<Record<Status, string>>({
    todo: "",
    inprogress: "",
    done: "",
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const selectionCount = selected.size;

  // --- Filtering + Sorting ---
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const tag = filterTag.trim().toLowerCase();
    const who = filterAssignee.trim().toLowerCase();

    const apply = (tasks: Task[]) =>
      sortTasks(
        tasks.filter((t) => {
          if (filterPriority !== "all" && t.priority !== filterPriority)
            return false;

          if (q) {
            const inTitle = t.title.toLowerCase().includes(q);
            const inDesc = t.description?.toLowerCase().includes(q);
            const inTags = (t.tags ?? []).some((x) =>
              x.toLowerCase().includes(q)
            );
            if (!inTitle && !inDesc && !inTags) return false;
          }

          if (tag && !t.tags?.some((x) => x.toLowerCase().includes(tag)))
            return false;

          if (who) {
            const name =
              typeof t.assignee === "string"
                ? t.assignee
                : t.assignee?.name ?? "";
            if (!name.toLowerCase().includes(who)) return false;
          }

          return true;
        }),
        sortBy
      );

    return {
      todo: apply(board.todo ?? []),
      inprogress: apply(board.inprogress ?? []),
      done: apply(board.done ?? []),
    };
  }, [board, query, filterPriority, filterTag, filterAssignee, sortBy]);

  const totalTasks =
    (board.todo?.length ?? 0) +
    (board.inprogress?.length ?? 0) +
    (board.done?.length ?? 0);
  const doneCount = board.done?.length ?? 0;
  const progress = totalTasks ? Math.round((doneCount / totalTasks) * 100) : 0;

  // --- Drag ---
  function onDragEnd(res: DropResult) {
    const { source, destination, draggableId } = res;
    if (!destination) return;
    const srcCol = source.droppableId as Status;
    const dstCol = destination.droppableId as Status;
    if (srcCol === dstCol && source.index !== destination.index) {
      reorderWithin(srcCol, source.index, destination.index);
    } else if (srcCol !== dstCol) {
      moveTask(draggableId, dstCol, destination.index);
    }
  }

  // --- Quick add ---
  function quickAdd(status: Status) {
    const title = quickTitle[status].trim();
    if (!title) return;
    createTask({
      title,
      description: "",
      priority: "medium",
      status,
      tags: [],
    });
    setQuickTitle((prev) => ({ ...prev, [status]: "" }));
    ping("Task created");
  }

  // --- Selection + Bulk ---
  function toggleSelect(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  }
  function selectColumn(status: Status, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const t of board[status] ?? [])
        checked ? next.add(t.id) : next.delete(t.id);
      return next;
    });
  }
  function clearSelection() {
    setSelected(new Set());
  }

  function bulkDelete() {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} selected task(s)?`)) return;
    for (const id of Array.from(selected)) removeTask(id);
    clearSelection();
    ping("Tasks deleted");
  }
  function bulkMove(to: Status) {
    if (!selected.size) return;
    for (const id of Array.from(selected)) moveTask(id, to, 0);
    clearSelection();
    ping(`Moved to ${to}`);
  }
  function bulkSetPriority(p: Priority) {
    if (!selected.size) return;
    for (const id of Array.from(selected)) updateTask(id, { priority: p });
    clearSelection();
    ping(`Priority set to ${p}`);
  }

  // --- Toast helper ---
  function ping(msg: string) {
    setToast(msg);
    window.clearTimeout((ping as any)._t);
    (ping as any)._t = window.setTimeout(() => setToast(null), 4500);
  }

  // --- Guards ---
  if (error) {
    return (
      <div className="glass error">Error loading tasks: {String(error)}</div>
    );
  }
  if (!current) {
    return <div className="glass">Select a project to view its board.</div>;
  }
  if (loading) {
    return (
      <div className="glass">
        <i className="fa-solid fa-spinner fa-spin" /> Loading {current.name}…
      </div>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="glass toolbar">
        <div className="filters">
          <div className="input-icon">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              className="input"
              placeholder="Search tasks…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="input-icon">
            <i className="fa-solid fa-signal" />
            <select
              className="select"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
            >
              <option value="all">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="input-icon">
            <i className="fa-solid fa-tags" />
            <input
              className="input"
              placeholder="Tag filter"
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
            />
          </div>
          <div className="input-icon">
            <i className="fa-solid fa-user" />
            <input
              className="input"
              placeholder="Assignee"
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
            />
          </div>
          <div className="input-icon">
            <i className="fa-solid fa-sort" />
            <select
              className="select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <option value="updated">Updated</option>
              <option value="created">Created</option>
              <option value="due">Due date</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>

        <div className="progress-wrap">
          <i className="fa-solid fa-chart-simple" />
          <div className="progress">
            <div className="bar" style={{ width: `${progress}%` }} />
          </div>
          <span>{progress}%</span>
          <button
            className="primary"
            onClick={() => {
              setEditing(null);
              setOpenModal(true);
            }}
          >
            <i className="fa-solid fa-plus" /> New Task
          </button>
        </div>
      </div>

      {/* Bulk bar */}
      {selectionCount > 0 && (
        <div className="glass bulk-bar">
          <strong>{selectionCount}</strong> selected
          <button className="ghost" onClick={() => bulkMove("todo")}>
            <i className="fa-regular fa-rectangle-list" /> To Do
          </button>
          <button className="ghost" onClick={() => bulkMove("inprogress")}>
            <i className="fa-solid fa-spinner" /> In Progress
          </button>
          <button className="ghost" onClick={() => bulkMove("done")}>
            <i className="fa-solid fa-circle-check" /> Done
          </button>
          <button className="ghost" onClick={() => bulkSetPriority("high")}>
            <i className="fa-solid fa-fire" /> High
          </button>
          <button className="ghost" onClick={() => bulkSetPriority("medium")}>
            <i className="fa-solid fa-gauge" /> Medium
          </button>
          <button className="ghost" onClick={() => bulkSetPriority("low")}>
            <i className="fa-solid fa-leaf" /> Low
          </button>
          <button className="danger" onClick={bulkDelete}>
            <i className="fa-solid fa-trash" /> Delete
          </button>
          <button className="ghost" onClick={clearSelection}>
            <i className="fa-solid fa-broom" /> Clear
          </button>
        </div>
      )}

      {/* Kanban columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-grid">
          {sections.map((sec) => {
            const list = filtered[sec.id] ?? [];
            const columnTotal = board[sec.id]?.length ?? 0;
            return (
              <Droppable droppableId={sec.id} key={sec.id}>
                {(provided) => (
                  <section
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="kanban-col"
                  >
                    <header className="col-head">
                      <i className={`${sec.icon} ${sec.colorClass}`} />
                      <h3>{sec.title}</h3>
                      <span className="muted">({columnTotal})</span>
                      <div className="quick-add">
                        <i className="fa-solid fa-plus" />
                        <input
                          className="input"
                          placeholder={`Quick add…`}
                          value={quickTitle[sec.id]}
                          onChange={(e) =>
                            setQuickTitle((p) => ({
                              ...p,
                              [sec.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") quickAdd(sec.id);
                          }}
                        />
                      </div>
                    </header>
                    <div className="kanban-list scrollable">
                      {list.map((task, idx) => {
                        const due = dueState(task);
                        return (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={idx}
                          >
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                className={`drag-wrap ${
                                  snap.isDragging ? "dragging" : ""
                                }`}
                              >
                                <TaskCard
                                  task={task}
                                  onEdit={() => {
                                    setEditing(task);
                                    setOpenModal(true);
                                  }}
                                  onDelete={() => {
                                    removeTask(task.id);
                                    ping("Task deleted");
                                  }}
                                  selected={selected.has(task.id)}
                                  onSelect={(checked) =>
                                    toggleSelect(task.id, checked)
                                  }
                                  due={due}
                                />
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                      {!list.length && <div className="empty">No tasks</div>}
                    </div>
                  </section>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      {/* Task modal (create/update) */}
      {openModal && (
        <TaskModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onCreate={(data) => {
            createTask(data);
            ping("Task created");
          }}
          onUpdate={(id, patch) => {
            updateTask(id, patch);
            ping("Task updated");
          }}
          task={editing ?? undefined}
        />
      )}

      {/* Toast */}
      {toast && <Toast text={toast} />}
    </>
  );
}
