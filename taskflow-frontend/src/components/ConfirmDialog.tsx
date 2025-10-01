export default function ConfirmDialog({
  open,
  title,
  message,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onMouseDown={onCancel}>
      <div className="modal glass" onMouseDown={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p className="muted">{message}</p>
        <div className="actions">
          <button className="ghost" onClick={onCancel}>Cancel</button>
          <button className="danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
