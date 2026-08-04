"use client";
import * as React from "react";

type ThemeMode = "light" | "dark" | "system";
type ThemeContextValue = {
  theme: Exclude<ThemeMode, "system">;
  mode: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}

function systemTheme(): Exclude<ThemeMode, "system"> {
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

function resolve(mode: ThemeMode): Exclude<ThemeMode, "system"> {
  return mode === "system" ? systemTheme() : mode;
}

function apply(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<ThemeMode>(() => {
    if (typeof document === "undefined") return "system";
    return (localStorage.getItem("theme") as ThemeMode | null) ?? "system";
  });
  const [theme, setTheme] = React.useState<Exclude<ThemeMode, "system">>(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  React.useEffect(() => {
    apply(resolve(mode));
    setTheme(resolve(mode));
  }, [mode]);

  React.useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      apply(systemTheme());
      setTheme(systemTheme());
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [mode]);

  const setThemeMode = React.useCallback((t: ThemeMode) => {
    localStorage.setItem("theme", t);
    setMode(t);
  }, []);

  const toggle = React.useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    setMode(next);
    apply(next);
    setTheme(next);
  }, [theme]);

  const value = React.useMemo(
    () => ({ theme, mode, setTheme: setThemeMode, toggle }),
    [theme, mode, setThemeMode, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}