import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Project } from "../types";
import {
  listProjects,
  createProject as apiCreateProject,
  deleteProject as apiDeleteProject,
} from "../utils/api";
import { useAuth } from "./AuthContext";

type Ctx = {
  projects: Project[];
  current: Project | null;
  setCurrent: (p: Project | null) => void;
  createProject: (data: {
    name: string;
    description?: string;
  }) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
};

const ProjectsCtx = createContext<Ctx | null>(null);

function normalize(p: any): Project {
  return {
    id: p.id || p._id,
    name: p.name,
    description: p.description ?? "",
    owner: p.owner,
    members: p.members ?? [],
    createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
  };
}

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [current, setCurrent] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects when user/token changes
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) {
        setProjects([]);
        setCurrent(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await listProjects();
        const list = (data || []).map(normalize);
        if (!cancelled) {
          setProjects(list);

          const remembered = localStorage.getItem("tf_current_project");
          const found =
            list.find((p) => p.id === remembered) || list[0] || null;
          setCurrent(found || null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load projects");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function createProject(data: { name: string; description?: string }) {
    const payload = {
      name: data.name?.trim(),
      description: data.description?.trim(),
    };
    if (!payload.name) throw new Error("Project name is required");
    const created = await apiCreateProject(payload);
    const proj = normalize(created);
    setProjects((prev) => [proj, ...prev]);
    setCurrent(proj);
    localStorage.setItem("tf_current_project", proj.id);
  }

  async function deleteProject(id: string) {
    await apiDeleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));

    if (current?.id === id) {
      const next = projects.find((p) => p.id !== id) || null;
      setCurrent(next);
      localStorage.setItem("tf_current_project", next?.id || "");
    }
  }

  const value = useMemo(
    () => ({
      projects,
      current,
      setCurrent,
      createProject,
      deleteProject,
      loading,
      error,
    }),
    [projects, current, loading, error]
  );

  return <ProjectsCtx.Provider value={value}>{children}</ProjectsCtx.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsCtx);
  if (!ctx) throw new Error("useProjects must be used within ProjectsProvider");
  return ctx;
}
