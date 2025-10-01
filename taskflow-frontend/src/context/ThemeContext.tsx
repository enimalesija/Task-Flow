import { createContext, useContext, useEffect, useState } from "react";

type Ctx = { mode: "light" | "dark"; toggle: () => void };
const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">(
    (localStorage.getItem("theme") as any) || "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    localStorage.setItem("theme", mode);
  }, [mode]);

  const toggle = () => setMode((m) => (m === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ mode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const v = useContext(ThemeContext);
  if (!v) throw new Error("ThemeContext missing");
  return v;
};
