import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const PRIMARY = "#3478F6";
const ITEM_HEIGHT = 44;

const pad = (value) => String(value).padStart(2, "0");

const Wheel = ({ data, selectedValue, onValueChange, labelFormatter }) => {
  const listRef = useRef(null);

  const initialIndex = Math.max(
    0,
    data.findIndex((v) => v === selectedValue)
  );

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToOffset({
        offset: initialIndex * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [initialIndex]);

  const onMomentumScrollEnd = (e) => {
    const offset = e.nativeEvent.contentOffset.y;
    const index = Math.round(offset / ITEM_HEIGHT);
    const value = data[index];
    if (value !== undefined) {
      onValueChange(value);
    }
  };

  return (
    <View style={styles.wheelContainer}>
      <View style={styles.highlight} pointerEvents="none" />
      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item) => String(item)}
        style={{ flexGrow: 0 }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        renderItem={({ item }) => {
          const isSelected = item === selectedValue;
          return (
            <View
              style={[
                styles.item,
                { backgroundColor: isSelected ? "#E8F1FF" : "#FFFFFF" },
              ]}
            >
              <Text
                style={[
                  styles.itemText,
                  { color: isSelected ? PRIMARY : "#111827" },
                ]}
              >
                {labelFormatter ? labelFormatter(item) : item}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
};

export default function TimePickerWheel({
  hour = 12,
  minute = 0,
  onHourChange,
  onMinuteChange,
  showAmPm = false,
  amPm = "AM",
  onAmPmChange,
}) {
  const hours = useMemo(() => {
    if (showAmPm) {
      return Array.from({ length: 12 }, (_, i) => i + 1);
    }
    return Array.from({ length: 24 }, (_, i) => i + 1);
  }, [showAmPm]);

  const minutes = useMemo(
    () => Array.from({ length: 60 }, (_, i) => i),
    []
  );

  const amPmValues = ["AM", "PM"];

  return (
    <View style={styles.container}>
      <Wheel
        data={hours}
        selectedValue={hour}
        onValueChange={onHourChange}
        labelFormatter={(v) => pad(v)}
      />
      <Wheel
        data={minutes}
        selectedValue={minute}
        onValueChange={onMinuteChange}
        labelFormatter={(v) => pad(v)}
      />
      {showAmPm && (
        <Wheel
          data={amPmValues}
          selectedValue={amPm}
          onValueChange={onAmPmChange}
          labelFormatter={(v) => v}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  wheelContainer: {
    width: 90,
    height: ITEM_HEIGHT * 5,
    overflow: "hidden",
    marginHorizontal: 4,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    fontSize: 18,
    fontWeight: "700",
  },
  highlight: {
    position: "absolute",
    top: ITEM_HEIGHT * 2,
    height: ITEM_HEIGHT,
    left: 0,
    right: 0,
    backgroundColor: "rgba(52,120,246,0.08)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(52,120,246,0.25)",
    zIndex: 1,
  },
});
