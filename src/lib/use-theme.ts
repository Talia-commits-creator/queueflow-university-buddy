import { useEffect, useState } from "react";

const STORAGE_KEY = "queuesmart-theme";

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let initial: "light" | "dark" = "light";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light") initial = stored;
      else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) initial = "dark";
    } catch {}
    applyTheme(initial);
    setTheme(initial);
    setReady(true);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
    setTheme(next);
  };

  return { theme, toggle, ready };
}
