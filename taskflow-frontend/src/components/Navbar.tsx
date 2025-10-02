import { useTheme } from "../context/ThemeContext";
import { useTasks } from "../context/TasksContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { mode, toggle } = useTheme();
  const { logout, user } = useAuth();
  const { search, setSearch } = useTasks();

  return (
    <header className="navbar">
      {/* Brand */}
      <div className="brand">
        <div className="logo-dot" />
        <span>TaskFlow</span>
      </div>

      {/* User + Actions */}
      <div className="nav-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span className="muted" style={{ marginRight: 6 }}>{user?.name}</span>
        <button className="ghost" onClick={toggle}>
          {mode === "dark" ? "🌙 Dark" : "☀️ Light"}
        </button>
        <button className="ghost" onClick={logout}>⎋ Logout</button>
      </div>
    </header>
  );
}
