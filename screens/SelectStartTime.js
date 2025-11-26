import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import TimePickerDial from "../components/TimePickerDial";

const PRIMARY = "#3478F6";

const pad = (val) => String(val || 0).padStart(2, "0");

export default function SelectStartTime({ navigation, route }) {
  const initialHour = route.params?.hour ?? 12;
  const initialMinute = route.params?.minute ?? 1;
  const onConfirm = route.params?.onConfirm;

  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);
  const [active, setActive] = useState("hour");

  const formatted = `${pad(hour)}:${pad(minute)}`;

  const handleSave = () => {
    onConfirm?.({ hour, minute, formatted });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Select Start Time</Text>
        <TimePickerDial
          hour={hour}
          minute={minute}
          onHourChange={(h) => {
            setHour(h);
            setActive("minute");
          }}
          onMinuteChange={(m) => {
            setMinute(m);
            setActive("minute");
          }}
          activeTarget={active}
          onActiveChange={setActive}
        />
        <View style={styles.actions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
            <Text style={styles.primaryButtonText}>Save {formatted}</Text>
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
    fontSize: 20,
    fontWeight: "700",
    color: PRIMARY,
    marginBottom: 12,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    marginRight: 12,
  },
  secondaryButtonText: {
    color: "#111827",
    fontWeight: "700",
  },
});
