import React, { useEffect, useMemo, useState } from "react";
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
  Switch,
  ScrollView,
} from "react-native";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import TimePicker from "../components/TimePicker";

const PRIMARY = "#3478F6";

export default function AddEventScreen({ navigation, route, user }) {
  const { date: initialDate, event } = route.params || {};
  const today = new Date().toISOString().split("T")[0];

  const parseLegacyTime = (timeValue) => {
    if (!timeValue) return {};
    const rangeMatch = timeValue.match(
      /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/
    );
    if (rangeMatch) {
      return {
        startHour: Number(rangeMatch[1]),
        startMinute: Number(rangeMatch[2]),
        endHour: Number(rangeMatch[3]),
        endMinute: Number(rangeMatch[4]),
      };
    }

    const singleMatch = timeValue.match(/(\d{1,2}):(\d{2})/);
    if (singleMatch) {
      return {
        startHour: Number(singleMatch[1]),
        startMinute: Number(singleMatch[2]),
      };
    }
    return {};
  };

  const legacyTime = parseLegacyTime(event?.time);

  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [date] = useState(initialDate || today);
  const [startHour, setStartHour] = useState(
    event?.startHour ?? legacyTime.startHour ?? 12
  );
  const [startMinute, setStartMinute] = useState(
    event?.startMinute ?? legacyTime.startMinute ?? 0
  );
  const [endHour, setEndHour] = useState(
    event?.endHour ?? legacyTime.endHour ?? null
  );
  const [endMinute, setEndMinute] = useState(
    event?.endMinute ?? legacyTime.endMinute ?? 0
  );
  const [hasEndTime, setHasEndTime] = useState(
    event?.endHour != null || legacyTime.endHour != null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    if (!hasEndTime) {
      setEndHour(null);
      setEndMinute(0);
    }
  }, [hasEndTime]);

  useEffect(() => {
    if (hasEndTime && endHour == null) {
      setEndHour(startHour);
      setEndMinute(startMinute);
    }
  }, [hasEndTime, endHour, startHour, startMinute]);

  const formattedTime = useMemo(() => {
    const pad = (value) => String(value).padStart(2, "0");
    const start = `${pad(startHour)}:${pad(startMinute)}`;
    if (hasEndTime && endHour != null && endMinute != null) {
      return `${start} - ${pad(endHour)}:${pad(endMinute)}`;
    }
    return start;
  }, [startHour, startMinute, hasEndTime, endHour, endMinute]);

  const saveEvent = async () => {
    setError("");
    if (!title || !date) {
      setError("Title and date are required.");
      return;
    }
    const startTotal = (startHour || 0) * 60 + (startMinute || 0);
    let endTotal = null;
    if (hasEndTime) {
      if (endHour == null) {
        setError("Please select an end time.");
        return;
      }
      endTotal = endHour * 60 + (endMinute || 0);
      if (endTotal < startTotal) {
        setError("End time cannot be earlier than start time.");
        return;
      }
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
        startHour,
        startMinute,
        endHour: hasEndTime ? endHour : null,
        endMinute: hasEndTime ? endMinute : null,
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
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

            <Text style={styles.label}>Start Time</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.timeButtonText}>
                {`${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`}
              </Text>
              <Text style={styles.timeButtonHint}>Tap to pick time</Text>
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Add End Time?</Text>
              <Switch
                value={hasEndTime}
                onValueChange={setHasEndTime}
                trackColor={{ true: "#5E9CFF", false: "#CBD5E1" }}
                thumbColor={hasEndTime ? "#3478F6" : "#FFFFFF"}
              />
            </View>
            {hasEndTime && (
              <View style={{ marginTop: 4 }}>
                <Text style={styles.label}>End Time</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Text style={styles.timeButtonText}>
                    {`${String(endHour || startHour).padStart(2, "0")}:${String(
                      endMinute
                    ).padStart(2, "0")}`}
                  </Text>
                  <Text style={styles.timeButtonHint}>Tap to pick time</Text>
                </TouchableOpacity>
                <Text style={styles.timeHint}>{formattedTime}</Text>
              </View>
            )}

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
        </ScrollView>
      </KeyboardAvoidingView>
      <TimePicker
        visible={showStartPicker}
        initialHour={startHour}
        initialMinute={startMinute}
        onCancel={() => setShowStartPicker(false)}
        onConfirm={(hour, minute) => {
          setStartHour(hour);
          setStartMinute(minute);
          if (hasEndTime && endHour == null) {
            setEndHour(hour);
            setEndMinute(minute);
          }
          setShowStartPicker(false);
        }}
        title="Select Start Time"
      />
      <TimePicker
        visible={showEndPicker}
        initialHour={endHour || startHour}
        initialMinute={endMinute}
        onCancel={() => setShowEndPicker(false)}
        onConfirm={(hour, minute) => {
          setEndHour(hour);
          setEndMinute(minute);
          setShowEndPicker(false);
        }}
        title="Select End Time"
      />
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
  },
  form: {
    gap: 14,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
  timeButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    backgroundColor: "#F8FAFC",
  },
  timeButtonText: {
    fontWeight: "700",
    color: "#111827",
    fontSize: 16,
  },
  timeButtonHint: {
    color: "#6B7280",
    marginTop: 4,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeHint: {
    color: "#6B7280",
    marginTop: 6,
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
