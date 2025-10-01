import type { BoardData } from "../types";

export function loadBoard(fallback: BoardData): BoardData {
  try {
    const raw = localStorage.getItem("taskflow_board");
    if (!raw) return fallback;
    return JSON.parse(raw) as BoardData;
  } catch {
    return fallback;
  }
}

export function saveBoard(data: BoardData) {
  try {
    localStorage.setItem("taskflow_board", JSON.stringify(data));
  } catch {
    console.error("Failed to save board");
  }
}

export function loadTheme(): "light" | "dark" | null {
  return (localStorage.getItem("theme") as "light" | "dark") ?? null;
}
export function saveTheme(mode: "light" | "dark") {
  localStorage.setItem("theme", mode);
}
