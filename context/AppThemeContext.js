import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DefaultTheme, DarkTheme } from "@react-navigation/native";
import * as SystemUI from "expo-system-ui";

let NavigationBar = null;
try {
  NavigationBar = require("expo-navigation-bar");
} catch (e) {
  NavigationBar = null;
}

const themes = {
  light: {
    background: "#FFFFFF",
    text: "#111827",
    primary: "#3478F6",
    card: "#F8FAFC",
    border: "#E5E7EB",
    muted: "#6B7280",
    headerBackground: "#3478F6",
    headerText: "#FFFFFF",
  },
  dark: {
    background: "#0F172A",
    text: "#F3F4F6",
    primary: "#4C8BFF",
    card: "#111827",
    border: "#1F2937",
    muted: "#9CA3AF",
    headerBackground: "#0F172A",
    headerText: "#FFFFFF",
  },
};

const AppThemeContext = createContext({
  theme: "light",
  colors: themes.light,
  setTheme: () => {},
  navigationTheme: {},
});

export function AppThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const colors = themes[theme];

  useEffect(() => {
    const applyNavigationColors = async () => {
      try {
        await SystemUI.setBackgroundColorAsync(colors.background);
      } catch (_) {
        // ignore if unavailable
      }
      if (NavigationBar?.setBackgroundColorAsync) {
        const navBg = theme === "light" ? "#000000" : "#FFFFFF";
        try {
          await NavigationBar.setBackgroundColorAsync(navBg);
          if (NavigationBar.setButtonStyleAsync) {
            await NavigationBar.setButtonStyleAsync(
              theme === "light" ? "light" : "dark"
            );
          }
        } catch (_) {
          // ignore if not supported
        }
      }
    };
    applyNavigationColors();
  }, [theme, colors.background]);

  const navigationTheme = useMemo(() => {
    const base = theme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.background,
        border: colors.border,
        card: colors.headerBackground,
        notification: colors.primary,
        primary: colors.primary,
        text: colors.headerText,
      },
    };
  }, [colors, theme]);

  const value = useMemo(
    () => ({ theme, setTheme, colors, navigationTheme }),
    [theme, colors, navigationTheme]
  );

  return (
    <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(AppThemeContext);
}
