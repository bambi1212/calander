import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const PRIMARY = "#3478F6";

export default function AddEventScreen({ navigation, route, user }) {
  const { date: initialDate, event } = route.params || {};
  const today = new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [time, setTime] = useState(event?.time || "");
  const [date, setDate] = useState(initialDate || today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const saveEvent = async () => {
    setError("");
    if (!title || !date) {
      setError("Title and date are required.");
      return;
    }

    setLoading(true);
    try {
      const ref = doc(db, "events", user.uid);
      const snap = await getDoc(ref);
      const existingEvents = snap.exists() ? snap.data().events || [] : [];
      const safeEvents = Array.isArray(existingEvents) ? existingEvents : [];

      const createdAt = event?.createdAt || Date.now();
      const newEvent = {
        date,
        title,
        description,
        time,
        createdAt,
      };

      const updatedEvents = event
        ? safeEvents.map((e) =>
            e.createdAt === event.createdAt ? newEvent : e
          )
        : [...safeEvents, newEvent];

      await setDoc(ref, { events: updatedEvents }, { merge: true });
      navigation.goBack();
    } catch (err) {
      setError("Could not save the event right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.form}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Event title"
            placeholderTextColor="#9AA3AF"
            style={styles.input}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Optional notes"
            placeholderTextColor="#9AA3AF"
            style={[styles.input, styles.multiline]}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Time</Text>
          <TextInput
            value={time}
            onChangeText={setTime}
            placeholder="e.g. 14:00"
            placeholderTextColor="#9AA3AF"
            style={styles.input}
          />

          <Text style={styles.label}>Date</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9AA3AF"
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={saveEvent}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {event ? "Update Event" : "Add Event"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    padding: 20,
  },
  form: {
    gap: 14,
  },
  label: {
    fontWeight: "600",
    color: "#111827",
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    backgroundColor: "#F8FAFC",
    color: "#111827",
  },
  multiline: {
    height: 90,
    paddingTop: 12,
  },
  error: {
    color: "#DC2626",
    fontSize: 14,
  },
  button: {
    backgroundColor: PRIMARY,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    shadowColor: PRIMARY,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.85,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
