import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";

const PRIMARY = "#3478F6";

const StepPill = ({ label, active, complete, onPress, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.stepPill,
      active && styles.stepPillActive,
      disabled && styles.stepPillDisabled,
    ]}
  >
    <Text
      style={[
        styles.stepPillText,
        active && styles.stepPillTextActive,
        complete && styles.stepPillTextComplete,
        disabled && styles.stepPillTextDisabled,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const Dial = ({ numbers, selected, onSelect }) => {
  const size = 300;
  const radius = 120;
  const itemSize = numbers.length > 40 ? 30 : 40;
  return (
    <View style={[styles.dialContainer, { width: size, height: size }]}>
      <View style={[styles.dialCircle, { width: size, height: size }]} />
      {numbers.map((num, index) => {
        const angle = (2 * Math.PI * index) / numbers.length - Math.PI / 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        const left = size / 2 + x - itemSize / 2;
        const top = size / 2 + y - itemSize / 2;
        const isSelected = selected === num;
        return (
          <TouchableOpacity
            key={num}
            style={[
              styles.dialItem,
              {
                width: itemSize,
                height: itemSize,
                left,
                top,
                borderRadius: itemSize / 2,
              },
              isSelected && styles.dialItemSelected,
            ]}
            onPress={() => onSelect(num)}
          >
            <Text
              style={[
                styles.dialItemText,
                isSelected && styles.dialItemTextSelected,
              ]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const HourDial = ({ selected, onSelect }) => {
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i + 1), []);
  return <Dial numbers={hours} selected={selected} onSelect={onSelect} />;
};

const MinuteDial = ({ selected, onSelect }) => {
  const minutes = useMemo(
    () => Array.from({ length: 60 }, (_, i) => i + 1),
    []
  );
  return <Dial numbers={minutes} selected={selected} onSelect={onSelect} />;
};

export default function TimePickerScreen({ navigation, route }) {
  const {
    startHour: initialStartHour,
    startMinute: initialStartMinute,
    endHour: initialEndHour,
    endMinute: initialEndMinute,
    hasEndTime: initialHasEndTime,
  } = route.params || {};

  const [startHour, setStartHour] = useState(initialStartHour ?? null);
  const [startMinute, setStartMinute] = useState(initialStartMinute ?? null);
  const [endHour, setEndHour] = useState(initialEndHour ?? null);
  const [endMinute, setEndMinute] = useState(initialEndMinute ?? null);
  const [hasEndTime, setHasEndTime] = useState(Boolean(initialHasEndTime));

  const initialPhase = useMemo(() => {
    if (startHour == null) return "startHour";
    if (startMinute == null) return "startMinute";
    if (hasEndTime && endHour == null) return "endHour";
    if (hasEndTime && endMinute == null) return "endMinute";
    return "startHour";
  }, [startHour, startMinute, hasEndTime, endHour, endMinute]);

  const [phase, setPhase] = useState(initialPhase);

  useEffect(() => {
    setPhase(initialPhase);
  }, [initialPhase]);

  useEffect(() => {
    if (!hasEndTime) {
      setEndHour(null);
      setEndMinute(null);
      if (phase === "endHour" || phase === "endMinute") {
        setPhase("startHour");
      }
    }
  }, [hasEndTime]);

  const pad = (value) => String(value).padStart(2, "0");

  const summary = useMemo(() => {
    if (startHour == null || startMinute == null) return "Start time not set";
    const start = `${pad(startHour)}:${pad(startMinute)}`;
    if (hasEndTime && endHour != null && endMinute != null) {
      return `${start} - ${pad(endHour)}:${pad(endMinute)}`;
    }
    return start;
  }, [startHour, startMinute, hasEndTime, endHour, endMinute]);

  const readyToSave =
    startHour != null &&
    startMinute != null &&
    (!hasEndTime || (endHour != null && endMinute != null));

  const onHourSelect = (value) => {
    if (phase === "startHour") {
      setStartHour(value);
      setPhase("startMinute");
    } else if (phase === "endHour") {
      setEndHour(value);
      setPhase("endMinute");
    }
  };

  const onMinuteSelect = (value) => {
    if (phase === "startMinute") {
      setStartMinute(value);
      if (hasEndTime) {
        setPhase("endHour");
      }
    } else if (phase === "endMinute") {
      setEndMinute(value);
    }
  };

  const handleStepPress = (target) => {
    if (target === "startMinute" && startHour == null) return;
    if (target === "endHour" && !hasEndTime) return;
    if (target === "endMinute" && (endHour == null || !hasEndTime)) return;
    setPhase(target);
  };

  const handleSave = () => {
    if (!readyToSave) return;
    navigation.navigate({
      name: "AddEvent",
      params: {
        selectedTime: {
          startHour,
          startMinute,
          hasEndTime,
          endHour: hasEndTime ? endHour : null,
          endMinute: hasEndTime ? endMinute : null,
        },
      },
      merge: true,
    });
    navigation.goBack();
  };

  const infoText =
    phase === "startHour"
      ? "Tap an hour (1-24) for the start time."
      : phase === "startMinute"
      ? "Tap a minute (1-60) for the start time."
      : phase === "endHour"
      ? "Tap an hour (1-24) for the end time."
      : "Tap a minute (1-60) for the end time.";

  const renderDial = () => {
    if (phase === "startHour" || phase === "endHour") {
      return (
        <HourDial
          selected={phase === "startHour" ? startHour : endHour}
          onSelect={onHourSelect}
        />
      );
    }
    return (
      <MinuteDial
        selected={phase === "startMinute" ? startMinute : endMinute}
        onSelect={onMinuteSelect}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Pick a time</Text>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Add End Time?</Text>
          <Switch
            value={hasEndTime}
            onValueChange={setHasEndTime}
            trackColor={{ true: "#5E9CFF", false: "#CBD5E1" }}
            thumbColor={hasEndTime ? "#3478F6" : "#FFFFFF"}
          />
        </View>

        <View style={styles.stepRow}>
          <StepPill
            label="Start Hour"
            active={phase === "startHour"}
            complete={startHour != null}
            onPress={() => handleStepPress("startHour")}
          />
          <StepPill
            label="Start Minute"
            active={phase === "startMinute"}
            complete={startMinute != null}
            onPress={() => handleStepPress("startMinute")}
            disabled={startHour == null}
          />
          <StepPill
            label="End Hour"
            active={phase === "endHour"}
            complete={endHour != null}
            onPress={() => handleStepPress("endHour")}
            disabled={!hasEndTime || startMinute == null}
          />
          <StepPill
            label="End Minute"
            active={phase === "endMinute"}
            complete={endMinute != null}
            onPress={() => handleStepPress("endMinute")}
            disabled={!hasEndTime || endHour == null}
          />
        </View>

        <Text style={styles.info}>{infoText}</Text>

        <View style={styles.dialWrapper}>{renderDial()}</View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Selected</Text>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.secondaryButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !readyToSave && styles.buttonDisabled,
            ]}
            onPress={handleSave}
            disabled={!readyToSave}
          >
            <Text style={styles.primaryButtonText}>Save Time</Text>
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
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    color: "#111827",
    fontWeight: "600",
  },
  stepRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 14,
  },
  stepPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
    marginBottom: 8,
  },
  stepPillActive: {
    borderColor: PRIMARY,
    backgroundColor: "#E8F1FF",
  },
  stepPillDisabled: {
    opacity: 0.5,
  },
  stepPillText: {
    color: "#4B5563",
    fontWeight: "600",
  },
  stepPillTextActive: {
    color: PRIMARY,
  },
  stepPillTextComplete: {
    color: "#0F172A",
  },
  stepPillTextDisabled: {
    color: "#9CA3AF",
  },
  info: {
    color: "#4B5563",
    marginBottom: 12,
  },
  dialWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  dialContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  dialCircle: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  dialItem: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dialItemSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  dialItemText: {
    color: "#111827",
    fontWeight: "700",
  },
  dialItemTextSelected: {
    color: "#FFFFFF",
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#F8FAFC",
  },
  summaryLabel: {
    color: "#6B7280",
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
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
  buttonDisabled: {
    opacity: 0.7,
  },
});
