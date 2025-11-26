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
const VISIBLE_ROWS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
const SELECTION_TOP = ITEM_HEIGHT * Math.floor(VISIBLE_ROWS / 2);
const LOOP_MULTIPLIER = 80;

const pad = (value) => String(value).padStart(2, "0");

const buildLoopedData = (values) => {
  const looped = [];
  for (let i = 0; i < LOOP_MULTIPLIER; i += 1) {
    looped.push(...values);
  }
  return looped;
};

const normalizeIndex = (index, length) => {
  const mod = index % length;
  return mod < 0 ? mod + length : mod;
};

const InfiniteWheel = ({ data, value, onChange, formatter }) => {
  const listRef = useRef(null);
  const baseLength = data.length;
  const loopedData = useMemo(() => buildLoopedData(data), [data]);
  const middleAnchor =
    Math.floor(loopedData.length / 2) -
    (Math.floor(loopedData.length / 2) % baseLength);

  const initialIndex = useMemo(() => {
    const valueIndex = Math.max(0, data.findIndex((item) => item === value));
    return middleAnchor + valueIndex;
  }, [data, value, middleAnchor]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeRef = useRef(initialIndex);

  useEffect(() => {
    activeRef.current = initialIndex;
    setActiveIndex(initialIndex);
    if (listRef.current) {
      listRef.current.scrollToOffset({
        offset: initialIndex * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [initialIndex]);

  const updateValueFromIndex = (index) => {
    const normalized = normalizeIndex(index, baseLength);
    const nextValue = data[normalized];
    if (nextValue !== undefined) {
      onChange?.(nextValue);
    }
  };

  const handleScroll = (e) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index !== activeRef.current) {
      activeRef.current = index;
      setActiveIndex(index);
      updateValueFromIndex(index);
    }
  };

  const handleMomentumScrollEnd = (e) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const normalized = normalizeIndex(index, baseLength);
    const anchoredIndex = middleAnchor + normalized;

    // Re-center the wheel when the user nears the edges so the loop feels endless.
    if (Math.abs(anchoredIndex - index) > baseLength && listRef.current) {
      listRef.current.scrollToOffset({
        offset: anchoredIndex * ITEM_HEIGHT,
        animated: false,
      });
      activeRef.current = anchoredIndex;
      setActiveIndex(anchoredIndex);
    }

    updateValueFromIndex(index);
  };

  return (
    <View style={styles.wheel}>
      <View style={styles.selectionBar} pointerEvents="none" />
      <FlatList
        ref={listRef}
        data={loopedData}
        keyExtractor={(_, idx) => String(idx)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: SELECTION_TOP }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_, idx) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * idx,
          index: idx,
        })}
        renderItem={({ item, index }) => {
          const isActive = index === activeIndex;
          return (
            <View style={styles.wheelItem}>
              <Text
                style={[
                  styles.wheelText,
                  isActive ? styles.wheelTextActive : styles.wheelTextInactive,
                ]}
              >
                {formatter ? formatter(item) : item}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
};

function TimePickerModal({
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Select Time</Text>
          <View style={styles.wheelsRow}>
            <InfiniteWheel
              data={hours}
              value={hour}
              onChange={setHour}
              formatter={(v) => pad(v)}
            />
            <InfiniteWheel
              data={minutes}
              value={minute}
              onChange={setMinute}
              formatter={(v) => pad(v)}
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

export default TimePickerModal;

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
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
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
    marginTop: 4,
  },
  wheel: {
    width: 96,
    height: WHEEL_HEIGHT,
    overflow: "hidden",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginHorizontal: 8,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  selectionBar: {
    position: "absolute",
    left: 8,
    right: 8,
    top: SELECTION_TOP,
    height: ITEM_HEIGHT,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: PRIMARY,
    backgroundColor: "rgba(52,120,246,0.08)",
    zIndex: 1,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  wheelText: {
    fontSize: 18,
    fontWeight: "700",
  },
  wheelTextActive: {
    color: "#0F172A",
  },
  wheelTextInactive: {
    color: "#6B7280",
  },
  preview: {
    textAlign: "center",
    marginTop: 14,
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 18,
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
