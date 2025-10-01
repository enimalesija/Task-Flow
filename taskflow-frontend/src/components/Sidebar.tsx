// src/components/Sidebar.tsx
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useTasks } from "../context/TasksContext";
import { useProjects } from "../context/ProjectsContext";

export default function Sidebar() {
  const { filterPriority, setFilterPriority } = useTasks();
  const {
    projects,
    current,
    setCurrent,
    createProject,
    deleteProject,
    loading,
  } = useProjects();

  const [projOpen, setProjOpen] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  // Persist selected project
  useEffect(() => {
    if (current?.id) localStorage.setItem("tf_current_project", current.id);
  }, [current?.id]);

  // Restore selected project
  useEffect(() => {
    if (!projects.length) return;
    if (current) return;
    const saved = localStorage.getItem("tf_current_project");
    const match = saved ? projects.find((p) => p.id === saved) : null;
    setCurrent(match ?? projects[0]);
  }, [projects, current, setCurrent]);

  // handle project creation
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      await createProject({ name: newProjectName.trim() });
      setNewProjectName("");
      setModalOpen(false);
    } catch (e) {
      console.error(e);
      alert("Failed to create project");
    }
  };

  return (
    <aside className="sidebar">
      <nav className="side-nav">
        {/* Dashboard */}
        <NavLink to="/app/dashboard" className="side-link">
          <i className="fas fa-th-large icon" style={{ color: "#3b82f6" }} />{" "}
          Dashboard
        </NavLink>

        {/* Projects */}
        <div className="side-group">
          <button
            className="side-subtitle"
            onClick={() => setProjOpen((v) => !v)}
          >
            <i
              className="fas fa-folder-open icon"
              style={{ color: "#f8b73eff" }}
            />{" "}
            Projects
            <span className="muted" style={{ marginLeft: "auto" }}>
              {projOpen ? "▾" : "▸"}
            </span>
          </button>

          {projOpen && (
            <div className="side-list">
              {loading && <div className="muted">Loading…</div>}
              {!loading && projects.length === 0 && (
                <div className="muted small">No projects yet.</div>
              )}

              {!loading &&
                projects.map((p) => (
                  <div
                    key={p.id}
                    className={`side-link ${
                      current?.id === p.id ? "active" : ""
                    }`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <button
                      onClick={() => setCurrent(p)}
                      style={{
                        flex: 1,
                        textAlign: "left",
                        background: "none",
                        border: "none",
                      }}
                    >
                      <i
                        className="fas fa-folder icon"
                        style={{ color: "#0b90e9ff" }}
                      />{" "}
                      <span className="project-name">{p.name}</span>
                    </button>
                    <button
                      className="ghost small"
                      title="Delete project"
                      onClick={() => {
                        if (
                          confirm(
                            `Delete project "${p.name}"? This cannot be undone.`
                          )
                        ) {
                          deleteProject(p.id);
                        }
                      }}
                    >
                      <i
                        className="fas fa-trash icon"
                        style={{ color: "#f83d3dff" }}
                      />
                    </button>
                  </div>
                ))}

              {/* New Project Button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "auto", // 👈 pushes it down
                    padding: "22px",
                  }}
                >
                  <button
                    className="ghost small"
                    onClick={() => setModalOpen(true)}
                  >
                    <i
                      className="fas fa-plus icon"
                      style={{ color: "#22c55e", marginRight: "8px" }}
                    />{" "}
                    New Project
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar footer */}
      <div className="side-footer">TaskFlow • v2.0</div>

      {/* New Project Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="title">Create Project</h2>
            <input
              type="text"
              className="input"
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              autoFocus
            />
            <div className="actions">
              <button className="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="primary" onClick={handleCreateProject}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
