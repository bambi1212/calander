import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Appearance } from "react-native";
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

const ThemeContext = createContext({
  theme: "light",
  colors: themes.light,
  setTheme: () => {},
  navigationTheme: {},
});

export function ThemeProvider({ children }) {
  const system = Appearance.getColorScheme() || "light";
  const [theme, setTheme] = useState(system);
  const colors = themes[theme] || themes.light;

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme || "light");
    });
    return () => sub?.remove();
  }, []);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
    if (NavigationBar?.setBackgroundColorAsync) {
      NavigationBar.setBackgroundColorAsync(theme === "light" ? "#000000" : "#FFFFFF").catch(() => {});
      if (NavigationBar.setButtonStyleAsync) {
        NavigationBar.setButtonStyleAsync(theme === "light" ? "light" : "dark").catch(() => {});
      }
    }
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

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
