import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useTasks } from "../context/TasksContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { mode, toggle } = useTheme();
  const { logout, user } = useAuth();

  // Make Navbar resilient if TasksContext isn’t mounted in some routes
  let search = "";
  let setSearch = (_v: string) => {};
  try {
    const t = useTasks();
    search = t.search;
    setSearch = t.setSearch;
  } catch {}

  return (
    <header className="navbar">
      {/* Brand */}
      <div className="brand">
        <div className="logo-dot" />
        <span>TaskFlow</span>
      </div>

      {/* Navigation + Search */}
     

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
