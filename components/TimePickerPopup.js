import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";

const PRIMARY = "#3478F6";
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2);

const createLoopedData = (values, loopCount = 50) => {
  const looped = [];
  for (let i = 0; i < loopCount; i += 1) {
    looped.push(...values);
  }
  return looped;
};

const pad = (value) => String(value).padStart(2, "0");

const LoopWheel = ({ data, value, onChange, labelFormatter }) => {
  const listRef = useRef(null);
  const baseLength = data.length;
  const looped = useMemo(() => createLoopedData(data), [data]);
  const middleIndex = Math.floor(looped.length / 2);

  const initialIndex = useMemo(() => {
    const idx = looped.findIndex((item, i) => {
      return item === value && i >= middleIndex - baseLength && i <= middleIndex + baseLength;
    });
    return idx >= 0 ? idx : middleIndex;
  }, [looped, value, middleIndex, baseLength]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToOffset({
        offset: initialIndex * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [initialIndex]);

  const handleScrollEnd = (e) => {
    const offset = e.nativeEvent.contentOffset.y;
    const index = Math.round(offset / ITEM_HEIGHT);
    const wrappedIndex = ((index % looped.length) + looped.length) % looped.length;
    const picked = looped[wrappedIndex];
    if (picked !== undefined && listRef.current) {
      const targetOffset = index * ITEM_HEIGHT;
      listRef.current.scrollToOffset({ offset: targetOffset, animated: true });
      onChange(picked);
    }
  };

  return (
    <View style={styles.wheel}>
      <View style={styles.wheelHighlight} pointerEvents="none" />
      <FlatList
        ref={listRef}
        data={looped}
        keyExtractor={(_, idx) => String(idx)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * CENTER_INDEX,
        }}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item }) => {
          const isSelected = item === value;
          return (
            <View
              style={[
                styles.wheelItem,
                { backgroundColor: isSelected ? "#E8F1FF" : "#FFFFFF" },
              ]}
            >
              <Text
                style={[
                  styles.wheelText,
                  {
                    color: isSelected ? "#0F172A" : "#6B7280",
                    opacity: isSelected ? 1 : 0.6,
                  },
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

export default function TimePickerPopup({
  visible,
  onClose,
  initialHour = 12,
  initialMinute = 0,
  onConfirm,
}) {
  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);

  const hours = useMemo(
    () => Array.from({ length: 24 }, (_, i) => i + 1),
    []
  );
  const minutes = useMemo(
    () => Array.from({ length: 60 }, (_, i) => i),
    []
  );

  useEffect(() => {
    if (visible) {
      setHour(initialHour);
      setMinute(initialMinute);
    }
  }, [visible, initialHour, initialMinute]);

  const handleConfirm = () => {
    onConfirm?.({ hour, minute });
    onClose?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Select Time</Text>
          <View style={styles.wheelsRow}>
            <LoopWheel
              data={hours}
              value={hour}
              onChange={setHour}
              labelFormatter={(v) => pad(v)}
            />
            <LoopWheel
              data={minutes}
              value={minute}
              onChange={setMinute}
              labelFormatter={(v) => pad(v)}
            />
          </View>
          <Text style={styles.preview}>{`${pad(hour)}:${pad(minute)}`}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleConfirm}>
              <Text style={styles.primaryText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  wheelsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  wheel: {
    width: 90,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginHorizontal: 6,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  wheelText: {
    fontSize: 18,
    fontWeight: "700",
  },
  wheelHighlight: {
    position: "absolute",
    top: ITEM_HEIGHT * CENTER_INDEX,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: "#E4EDFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(52,120,246,0.25)",
    zIndex: 0,
  },
  preview: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 16,
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    marginRight: 8,
  },
  secondaryText: {
    color: "#4B5563",
    fontWeight: "700",
  },
  primaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
