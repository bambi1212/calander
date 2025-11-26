import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";

const PRIMARY = "#3478F6";

const toDegrees = (radians) => (radians * 180) / Math.PI;

const formatTime = (hour, minute) => {
  const pad = (val) => String(val || 0).padStart(2, "0");
  return `${pad(hour)}:${pad(minute)}`;
};

const getHourAngle = (value) => {
  // Spread 1-24 evenly with 24/0 at top, 6 at right, 12 at bottom, 18 at left.
  const positionIndex = value % 24;
  return -Math.PI / 2 + (2 * Math.PI * positionIndex) / 24;
};

const getMinuteAngle = (value) => {
  const minuteValue = value % 60; // 60 acts like 0
  return -Math.PI / 2 + (2 * Math.PI * minuteValue) / 60;
};

const NumberDot = ({
  value,
  angle,
  radius,
  size,
  selected,
  onPress,
  testID,
}) => {
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);

  return (
    <TouchableOpacity
      testID={testID}
      onPress={() => onPress(value)}
      activeOpacity={0.8}
      style={[
        styles.numberWrapper,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: "50%",
          top: "50%",
          marginLeft: x - size / 2,
          marginTop: y - size / 2,
          backgroundColor: selected ? PRIMARY : "#FFFFFF",
          borderColor: selected ? PRIMARY : "#E5E7EB",
        },
      ]}
    >
      <Text
        style={[
          styles.numberText,
          { color: selected ? "#FFFFFF" : "#111827", fontSize: size * 0.4 },
        ]}
      >
        {value}
      </Text>
    </TouchableOpacity>
  );
};

export default function TimePickerDial({
  hour = 12,
  minute = 1,
  onHourChange,
  onMinuteChange,
  activeTarget = "hour",
  onActiveChange,
}) {
  const size = 320;
  const outerRadius = 120;
  const innerRadius = 80;
  const hourSize = 38;
  const minuteSize = 26;

  const pointerLength =
    activeTarget === "minute" ? innerRadius : outerRadius;

  const pointerAngle = useRef(new Animated.Value(0)).current;

  const targetAngle =
    activeTarget === "minute"
      ? toDegrees(getMinuteAngle(minute || 1))
      : toDegrees(getHourAngle(hour || 12));

  useEffect(() => {
    Animated.timing(pointerAngle, {
      toValue: targetAngle,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [targetAngle, pointerAngle]);

  const rotate = pointerAngle.interpolate({
    inputRange: [-360, 360],
    outputRange: ["-360deg", "360deg"],
  });

  const hours = useMemo(
    () => Array.from({ length: 24 }, (_, i) => i + 1),
    []
  );
  const minutes = useMemo(
    () => Array.from({ length: 60 }, (_, i) => i + 1),
    []
  );

  const currentTime = formatTime(hour, minute);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.dial, { width: size, height: size }]}>
        <Text style={styles.currentTime}>{currentTime}</Text>

        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Animated.View
            style={[
              styles.pointer,
              {
                height: pointerLength,
                transform: [
                  { rotate },
                  { translateY: -pointerLength / 2 },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pointerKnob,
              {
                transform: [
                  { rotate },
                  { translateY: -pointerLength },
                ],
              },
            ]}
          />
        </View>

        {hours.map((value) => {
          const angle = getHourAngle(value);
          return (
            <NumberDot
              key={`h-${value}`}
              value={value}
              angle={angle}
              radius={outerRadius}
              size={hourSize}
              selected={hour === value}
              onPress={(v) => {
                onActiveChange?.("hour");
                onHourChange?.(v);
              }}
              testID={`hour-${value}`}
            />
          );
        })}

        {minutes.map((value) => {
          const angle = getMinuteAngle(value);
          return (
            <NumberDot
              key={`m-${value}`}
              value={value}
              angle={angle}
              radius={innerRadius}
              size={minuteSize}
              selected={minute === value}
              onPress={(v) => {
                onActiveChange?.("minute");
                onMinuteChange?.(v);
              }}
              testID={`minute-${value}`}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  dial: {
    borderRadius: 999,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  currentTime: {
    position: "absolute",
    top: 18,
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  numberWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  numberText: {
    fontWeight: "700",
  },
  pointer: {
    position: "absolute",
    width: 2,
    backgroundColor: PRIMARY,
    left: "50%",
    marginLeft: -1,
    borderRadius: 2,
    top: "50%",
  },
  pointerKnob: {
    position: "absolute",
    width: 18,
    height: 18,
    backgroundColor: PRIMARY,
    borderRadius: 9,
    left: "50%",
    marginLeft: -9,
    top: "50%",
  },
});
