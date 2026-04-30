export type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "servnow.theme";

export function getStoredTheme(): ThemeMode {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function getNextTheme(theme: ThemeMode): ThemeMode {
  return theme === "dark" ? "light" : "dark";
}
