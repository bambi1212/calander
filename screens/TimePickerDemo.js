import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";

const PRIMARY = "#3478F6";

const formatTime = (hour, minute) => {
  const pad = (val) => String(val || 0).padStart(2, "0");
  return `${pad(hour)}:${pad(minute)}`;
};

export default function TimePickerDemo({ navigation }) {
  const [startHour, setStartHour] = useState(12);
  const [startMinute, setStartMinute] = useState(1);
  const [endHour, setEndHour] = useState(12);
  const [endMinute, setEndMinute] = useState(1);

  const startTime = formatTime(startHour, startMinute);
  const endTime = formatTime(endHour, endMinute);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Custom Clock Dial Picker</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Start</Text>
          <Text style={styles.value}>{startTime}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate("SelectStartTime", {
                hour: startHour,
                minute: startMinute,
                onConfirm: ({ hour, minute }) => {
                  setStartHour(hour);
                  setStartMinute(minute);
                },
              })
            }
          >
            <Text style={styles.buttonText}>Choose Start Time</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>End</Text>
          <Text style={styles.value}>{endTime}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate("SelectEndTime", {
                hour: endHour,
                minute: endMinute,
                onConfirm: ({ hour, minute }) => {
                  setEndHour(hour);
                  setEndMinute(minute);
                },
              })
            }
          >
            <Text style={styles.buttonText}>Choose End Time</Text>
          </TouchableOpacity>
        </View>
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
    textAlign: "center",
  },
  card: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  label: {
    color: "#6B7280",
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  button: {
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
