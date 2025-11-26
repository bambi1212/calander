import React, { useEffect, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Linking,
} from "react-native";
import * as SystemUI from "expo-system-ui";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAppTheme } from "../context/AppThemeContext";

let NavigationBar = null;
try {
  NavigationBar = require("expo-navigation-bar");
} catch (e) {
  NavigationBar = null;
}

export default function SettingsScreen() {
  const { theme, setTheme, colors } = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
    if (NavigationBar?.setBackgroundColorAsync) {
      NavigationBar.setBackgroundColorAsync(theme === "light" ? "#000000" : "#FFFFFF").catch(() => {});
      if (NavigationBar.setButtonStyleAsync) {
        NavigationBar.setButtonStyleAsync(theme === "light" ? "light" : "dark").catch(() => {});
      }
    }
  }, [theme, colors.background]);

  const handleShare = async () => {
    try {
      await Share.share({ message: "Check out this calendar app!" });
    } catch (_) {}
  };

  const handleReview = () => {
    Linking.openURL("mailto:reznik.associates@gmail.com?subject=App%20Review").catch(() => {});
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <TouchableOpacity style={styles.row} onPress={handleShare}>
          <Text style={styles.rowText}>Share</Text>
          <Text style={styles.rowHint}>Invite a friend</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Appearance</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleButton, theme === "light" && styles.toggleButtonActive]}
              onPress={() => setTheme("light")}
            >
              <Text style={[styles.toggleText, theme === "light" && styles.toggleTextActive]}>
                Light Mode
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, theme === "dark" && styles.toggleButtonActive]}
              onPress={() => setTheme("dark")}
            >
              <Text style={[styles.toggleText, theme === "dark" && styles.toggleTextActive]}>
                Dark Mode
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardHint}>
            Light mode sets Android navigation bar to black; Dark mode sets it to white (when supported).
          </Text>
        </View>

        <TouchableOpacity style={styles.row} onPress={handleReview}>
          <Text style={styles.rowText}>Review Us</Text>
          <Text style={styles.rowHint}>Send feedback to our team</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.row, styles.logoutRow]} onPress={handleLogout}>
          <Text style={[styles.rowText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, padding: 16 },
    title: { fontSize: 22, fontWeight: "700", color: colors.primary, marginBottom: 16 },
    row: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      backgroundColor: colors.card,
      marginBottom: 12,
    },
    rowText: { fontSize: 16, fontWeight: "700", color: colors.text },
    rowHint: { color: colors.muted, marginTop: 4 },
    card: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      backgroundColor: colors.card,
      marginBottom: 12,
    },
    cardTitle: { fontWeight: "700", color: colors.text, marginBottom: 10, fontSize: 16 },
    toggleRow: { flexDirection: "row", gap: 10 },
    toggleButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    toggleButtonActive: { borderColor: colors.primary, backgroundColor: "#E8F1FF" },
    toggleText: { fontWeight: "700", color: colors.muted },
    toggleTextActive: { color: colors.primary },
    cardHint: { marginTop: 8, color: colors.muted, fontSize: 13 },
    logoutRow: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
    logoutText: { color: "#DC2626" },
  });
