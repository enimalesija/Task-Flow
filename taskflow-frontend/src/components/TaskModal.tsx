import { useEffect, useState } from "react";
import type { Status, Task, Priority } from "../types";

export default function TaskModal({
  open,
  onClose,
  onCreate,
  onUpdate,
  task,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (t: Partial<Task> & { title: string; status?: Status }) => void;
  onUpdate: (id: string, patch: Partial<Task>) => void;
  task?: Task;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<Status>(task?.status ?? "todo");
  const [priority, setPriority] = useState<Priority>(
    task?.priority ?? "medium"
  );
  const [assignee, setAssignee] = useState(
    typeof task?.assignee === "string"
      ? task.assignee
      : task?.assignee?.name ?? ""
  );
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setStatus(task.status);
      setPriority(task.priority);
      setAssignee(
        typeof task.assignee === "string"
          ? task.assignee
          : task?.assignee?.name ?? ""
      );
      setDueDate(
        task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
      );
    } else {
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setAssignee("");
      setDueDate("");
    }
  }, [task, open]);

  if (!open) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const patch: Partial<Task> = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignee: assignee ? { name: assignee } : null,
      dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
    };

    if (task) onUpdate(task.id, patch);
    else onCreate(patch as any);

    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3
          className="title"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <i className="fa-solid fa-square-pen icon" aria-hidden />
          {task ? "Edit Task" : "New Task"}
        </h3>

        <form className="form" onSubmit={submit} style={{ marginTop: 12 }}>
          {/* Title */}
          <label className="label">
            <i className="fa-solid fa-heading icon sm" aria-hidden /> Title
          </label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          {/* Description */}
          <label className="label" style={{ marginTop: 10 }}>
            <i className="fa-solid fa-align-left icon sm" aria-hidden />{" "}
            Description
          </label>
          <textarea
            className="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Status + Priority */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 10,
            }}
          >
            <div>
              <label className="label">
                <i className="fa-solid fa-layer-group icon sm" aria-hidden />{" "}
                Status
              </label>
              <select
                className="select"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="label">
                <i className="fa-solid fa-signal icon sm" aria-hidden />{" "}
                Priority
              </label>
              <select
                className="select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Assignee + Due Date */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 10,
            }}
          >
            <div>
              <label className="label">
                <i className="fa-solid fa-user icon sm" aria-hidden /> Assignee
              </label>
              <input
                className="input"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Name"
              />
            </div>
            <div>
              <label className="label">
                <i className="fa-solid fa-calendar-day icon sm" aria-hidden />{" "}
                Due Date
              </label>
              <input
                type="date"
                className="input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="actions">
            <button type="button" className="ghost" onClick={onClose}>
              <i className="fa-solid fa-xmark icon" aria-hidden /> Cancel
            </button>
            <button className="btn primary" type="submit">
              <i className="fa-solid fa-floppy-disk icon" aria-hidden /> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
