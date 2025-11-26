import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { AntDesign } from "@expo/vector-icons";
import Constants from "expo-constants";
import { auth } from "../firebase";
import { useAppTheme } from "../context/AppThemeContext";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const androidClientId =
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_ID ||
    Constants?.expoConfig?.extra?.googleAndroidClientId ||
    undefined;

  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      androidClientId,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_ID,
      expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_ID,
      responseType: "id_token",
    },
    { useProxy: true }
  );

  useEffect(() => {
    const finishGoogleSignIn = async () => {
      if (response?.type === "success") {
        try {
          const { id_token } = response.params || {};
          if (!id_token) {
            throw new Error("Missing Google ID token");
          }
          const credential = GoogleAuthProvider.credential(id_token);
          await signInWithCredential(auth, credential);
          navigation.replace("Home");
        } catch (err) {
          Alert.alert(
            "Google Sign-In failed",
            err?.message || "Please try again."
          );
        } finally {
          setGoogleLoading(false);
        }
      } else if (response?.type === "error" || response?.type === "dismiss") {
        setGoogleLoading(false);
      }
    };
    finishGoogleSignIn();
  }, [response, navigation]);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      if (!androidClientId) {
        throw new Error("Google Sign-In is not configured. Add EXPO_PUBLIC_GOOGLE_ANDROID_ID.");
      }
      await promptAsync();
    } catch (err) {
      setGoogleLoading(false);
      Alert.alert("Google Sign-In failed", err?.message || "Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>CalendarApp</Text>
          <Text style={styles.subtitle}>Sign in to manage your events</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={styles.input}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[
              styles.googleButton,
              googleLoading && styles.buttonDisabled,
            ]}
            onPress={handleGoogleLogin}
            disabled={googleLoading}
            accessibilityLabel="Continue with Google"
          >
            {googleLoading ? (
              <ActivityIndicator color="#111827" />
            ) : (
              <AntDesign name="google" size={22} color="#DB4437" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>
              New here? <Text style={styles.linkBold}>Create an account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: 24,
      backgroundColor: colors.background,
    },
    header: {
      marginTop: 32,
      marginBottom: 32,
    },
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.primary,
    },
    subtitle: {
      marginTop: 8,
      fontSize: 16,
      color: colors.muted,
    },
    form: {
      marginTop: 8,
      gap: 16,
    },
    input: {
      height: 52,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
      color: colors.text,
    },
    error: {
      color: "#DC2626",
      fontSize: 14,
      marginTop: -8,
    },
    button: {
      backgroundColor: colors.primary,
      height: 52,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
      shadowColor: colors.primary,
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 3,
    },
    buttonDisabled: {
      opacity: 0.8,
    },
    buttonText: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 16,
    },
    linkButton: {
      marginTop: 12,
      alignItems: "center",
    },
    googleButton: {
      backgroundColor: colors.card,
      height: 52,
      width: 52,
      borderRadius: 26,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      shadowColor: colors.text,
      shadowOpacity: 0.06,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 1,
    },
    googleButtonText: {
      color: colors.text,
      fontWeight: "600",
      fontSize: 16,
    },
    linkText: {
      color: colors.muted,
      fontSize: 14,
    },
    linkBold: {
      color: colors.primary,
      fontWeight: "600",
    },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      color: colors.muted,
      fontWeight: "600",
    },
  });
