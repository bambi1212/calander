import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Linking,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAppTheme } from "../context/AppThemeContext";

const BUG_EMAIL = "reznik.associates@gmail.com";

export default function MenuScreen({ navigation }) {
  const { theme, setTheme, colors } = useAppTheme();

  const styles = getStyles(colors, theme);

  const handleShare = async () => {
    try {
      await Share.share({ message: "Check out this calendar app!" });
    } catch (_) {
      // ignore
    }
  };

  const handleMode = (mode) => {
    setTheme(mode);
  };

  const handleAbout = () => {
    navigation.navigate("About");
  };

  const handleBug = () => {
    Linking.openURL(`mailto:${BUG_EMAIL}?subject=Bug%20Report`).catch(() => {});
  };

  const handleLogout = () => {
    signOut(auth);
    navigation.popToTop();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <MenuItem label="Share App" onPress={handleShare} styles={styles} />
        <View style={styles.modeRow}>
          <Text style={styles.modeLabel}>Appearance</Text>
          <View style={styles.modeButtons}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                theme === "light" && styles.modeButtonActive,
              ]}
              onPress={() => handleMode("light")}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  theme === "light" && styles.modeButtonTextActive,
                ]}
              >
                Light Mode
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                theme === "dark" && styles.modeButtonActive,
              ]}
              onPress={() => handleMode("dark")}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  theme === "dark" && styles.modeButtonTextActive,
                ]}
              >
                Dark Mode
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <MenuItem label="About Us" onPress={handleAbout} styles={styles} />
        <MenuItem label="Report a Bug" onPress={handleBug} styles={styles} />
        <MenuItem label="Logout" onPress={handleLogout} styles={styles} destructive />
      </View>
    </SafeAreaView>
  );
}

function MenuItem({ label, onPress, styles, destructive }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Text style={[styles.rowText, destructive && styles.destructive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function getStyles(colors, theme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background,
      gap: 12,
    },
    row: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      backgroundColor: colors.card,
    },
    rowText: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    destructive: {
      color: "#DC2626",
    },
    modeRow: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      backgroundColor: colors.card,
      gap: 10,
    },
    modeLabel: {
      fontWeight: "700",
      color: colors.text,
      fontSize: 16,
    },
    modeButtons: {
      flexDirection: "row",
      gap: 10,
    },
    modeButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    modeButtonActive: {
      borderColor: colors.primary,
      backgroundColor: theme === "light" ? "#E8F1FF" : "#1F2937",
    },
    modeButtonText: {
      fontWeight: "700",
      color: colors.muted,
    },
    modeButtonTextActive: {
      color: colors.primary,
    },
  });
}
