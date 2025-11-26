import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Linking,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import * as SystemUI from "expo-system-ui";

let NavigationBar = null;
try {
  NavigationBar = require("expo-navigation-bar");
} catch (e) {
  NavigationBar = null;
}

const PRIMARY = "#3478F6";

export default function SettingsScreen() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const applyNavigationColors = async () => {
      const navBg = theme === "light" ? "#000000" : "#FFFFFF";
      try {
        await SystemUI.setBackgroundColorAsync(theme === "light" ? "#FFFFFF" : "#0F172A");
      } catch (_) {
        // no-op if unavailable
      }
      if (NavigationBar?.setBackgroundColorAsync) {
        try {
          await NavigationBar.setBackgroundColorAsync(navBg);
          if (NavigationBar.setButtonStyleAsync) {
            await NavigationBar.setButtonStyleAsync(theme === "light" ? "light" : "dark");
          }
        } catch (_) {
          // ignore if not supported
        }
      }
    };
    applyNavigationColors();
  }, [theme]);

  const handleShare = async () => {
    try {
      await Share.share({ message: "Check out this calendar app!" });
    } catch (_) {
      // ignore errors
    }
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
              style={[
                styles.toggleButton,
                theme === "light" && styles.toggleButtonActive,
              ]}
              onPress={() => setTheme("light")}
            >
              <Text
                style={[
                  styles.toggleText,
                  theme === "light" && styles.toggleTextActive,
                ]}
              >
                Light Mode
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                theme === "dark" && styles.toggleButtonActive,
              ]}
              onPress={() => setTheme("dark")}
            >
              <Text
                style={[
                  styles.toggleText,
                  theme === "dark" && styles.toggleTextActive,
                ]}
              >
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: PRIMARY,
    marginBottom: 16,
  },
  row: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#F8FAFC",
    marginBottom: 12,
  },
  rowText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  rowHint: {
    color: "#6B7280",
    marginTop: 4,
  },
  card: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#F8FAFC",
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
    fontSize: 16,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  toggleButtonActive: {
    borderColor: PRIMARY,
    backgroundColor: "#E8F1FF",
  },
  toggleText: {
    fontWeight: "700",
    color: "#4B5563",
  },
  toggleTextActive: {
    color: PRIMARY,
  },
  cardHint: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 13,
  },
  logoutRow: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  logoutText: {
    color: "#DC2626",
  },
});
