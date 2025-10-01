// src/components/TaskCard.tsx
import type { Task } from "../types";

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
  due?: "none" | "overdue" | "soon";
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  selected = false,
  onSelect,
  due = "none",
}: TaskCardProps) {
  // Resolve assignee name
  const assigneeName =
    typeof task.assignee === "string"
      ? task.assignee
      : task.assignee?.name || "";

  // Format date if exists
  const dueDateStr = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString()
    : "";

  return (
    <div
      className={`card ${
        due === "overdue" ? "due-overdue" : due === "soon" ? "due-soon" : ""
      }`}
    >
      {/* Top bar */}
      <div className="card-head">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Selection checkbox */}
          {onSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(e.target.checked)}
            />
          )}

          <i className="fa-solid fa-grip-vertical icon muted" aria-hidden />

          {/* Priority Badge */}
          <span
            className={`tag priority-${task.priority}`}
            title={`Priority: ${task.priority}`}
          >
            {task.priority === "high" && (
              <i className="fa-solid fa-fire icon sm" aria-hidden />
            )}
            {task.priority === "medium" && (
              <i className="fa-solid fa-gauge icon sm" aria-hidden />
            )}
            {task.priority === "low" && (
              <i className="fa-solid fa-leaf icon sm" aria-hidden />
            )}
            {task.priority}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="ghost small" onClick={onEdit} title="Edit">
            <i className="fa-solid fa-pen-to-square icon" aria-hidden /> Edit
          </button>
          <button className="ghost small" onClick={onDelete} title="Delete">
            <i className="fa-solid fa-trash icon" aria-hidden /> Delete
          </button>
        </div>
      </div>

      {/* Title + description */}
      <div className="card-title">{task.title}</div>
      {task.description && <div className="card-desc">{task.description}</div>}

      {/* Assignee + Due Date */}
      {(assigneeName || dueDateStr) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "10px",
            fontSize: "0.85rem",
          }}
        >
          {assigneeName && (
            <span className="muted">
              <i className="fa-solid fa-user icon sm" aria-hidden />{" "}
              {assigneeName}
            </span>
          )}
          {dueDateStr && (
            <span className="muted">
              <i className="fa-solid fa-calendar-day icon sm" aria-hidden />{" "}
              {dueDateStr}
            </span>
          )}
        </div>
      )}

      {/* Tags */}
      {!!task.tags?.length && (
        <div className="tags">
          {task.tags.map((t) => (
            <span key={t} className="tag">
              <i className="fa-solid fa-tag icon sm" aria-hidden /> {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
