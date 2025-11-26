import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
const WHEEL_PADDING = WHEEL_HEIGHT / 2; // required padding so the centered value is correct
const WHEEL_CONTAINER_HEIGHT = WHEEL_HEIGHT;
const LOOP_MULTIPLIER = 50;
const PRIMARY = "#3478F6";

const HOURS = Array.from({ length: 24 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const pad = (value) => String(value).padStart(2, "0");

const buildLoop = (base) => {
  const out = [];
  for (let i = 0; i < LOOP_MULTIPLIER; i += 1) {
    out.push(...base);
  }
  return out;
};

function TimeWheel({ values, initialValue, visible, onValueChange, testID }) {
  const loopedValues = useMemo(() => buildLoop(values), [values]);
  const baseLength = values.length;
  const listRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { startIndex, safeValue } = useMemo(() => {
    const safe = values.includes(initialValue) ? initialValue : values[0];
    const baseIndex = values.indexOf(safe);
    const middleBlock = Math.floor(LOOP_MULTIPLIER / 2) * baseLength;
    return { startIndex: middleBlock + baseIndex, safeValue: safe };
  }, [baseLength, initialValue, values]);

  const scrollToIndex = useCallback(
    (index, animated = false) => {
      const offset = Math.max(0, index * ITEM_HEIGHT - WHEEL_PADDING);
      listRef.current?.scrollToOffset({ offset, animated });
    },
    []
  );

  const updateSelection = useCallback(
    (offsetY) => {
      const effectiveOffset = offsetY + WHEEL_PADDING;
      let nextIndex = Math.round(effectiveOffset / ITEM_HEIGHT);
      if (nextIndex < 0) nextIndex = 0;
      if (nextIndex >= loopedValues.length) nextIndex = loopedValues.length - 1;
      if (nextIndex !== selectedIndex) {
        setSelectedIndex(nextIndex);
        onValueChange(loopedValues[nextIndex]);
      }
    },
    [loopedValues, onValueChange, selectedIndex]
  );

  useEffect(() => {
    if (!visible) return;
    setSelectedIndex(startIndex);
    onValueChange(safeValue);
    requestAnimationFrame(() => {
      scrollToIndex(startIndex, false);
    });
  }, [visible, startIndex, safeValue, scrollToIndex, onValueChange]);

  const renderItem = ({ item, index }) => {
    const isSelected = index === selectedIndex;
    return (
      <View style={styles.itemContainer}>
        <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
          {pad(item)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.wheel}>
      <FlatList
        ref={listRef}
        data={loopedValues}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item}-${index}`}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        bounces
        testID={testID}
        initialScrollIndex={Math.max(0, startIndex - 1)}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        contentContainerStyle={{ paddingVertical: WHEEL_PADDING }}
        onScroll={(event) =>
          updateSelection(event.nativeEvent.contentOffset.y)
        }
        onMomentumScrollEnd={(event) =>
          updateSelection(event.nativeEvent.contentOffset.y)
        }
        scrollEventThrottle={16}
        onScrollToIndexFailed={(info) => {
          requestAnimationFrame(() => scrollToIndex(info.index, false));
        }}
      />
      <View style={styles.highlight} pointerEvents="none" />
    </View>
  );
}

export default function TimePicker({
  visible,
  initialHour = 12,
  initialMinute = 0,
  onConfirm,
  onCancel,
  title = "Select Time",
}) {
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);

  const sanitizeHour = (value) => {
    const n = Number(value);
    if (Number.isFinite(n) && n >= 1 && n <= 24) return n;
    return 12;
  };

  const sanitizeMinute = (value) => {
    const n = Number(value);
    if (Number.isFinite(n) && n >= 0 && n <= 59) return n;
    return 0;
  };

  useEffect(() => {
    if (!visible) return;
    setSelectedHour(sanitizeHour(initialHour));
    setSelectedMinute(sanitizeMinute(initialMinute));
  }, [visible, initialHour, initialMinute]);

  const handleConfirm = () => {
    onConfirm?.(selectedHour, selectedMinute);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.wheelsRow}>
            <TimeWheel
              values={HOURS}
              initialValue={selectedHour}
              visible={visible}
              onValueChange={setSelectedHour}
              testID="hours-wheel"
            />
            <View style={styles.colonWrapper}>
              <Text style={styles.colon}>:</Text>
            </View>
            <TimeWheel
              values={MINUTES}
              initialValue={selectedMinute}
              visible={visible}
              onValueChange={setSelectedMinute}
              testID="minutes-wheel"
            />
          </View>

          <Text style={styles.previewText}>{`${pad(
            selectedHour
          )}:${pad(selectedMinute)}`}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Confirm</Text>
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
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    textAlign: "center",
    fontWeight: "700",
    fontSize: 18,
    color: "#111827",
    marginBottom: 10,
  },
  wheelsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  wheel: {
    width: 104,
    height: WHEEL_CONTAINER_HEIGHT,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    fontSize: 20,
    color: "#6B7280",
    fontWeight: "500",
  },
  itemTextSelected: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 20,
  },
  highlight: {
    position: "absolute",
    top: (WHEEL_CONTAINER_HEIGHT - ITEM_HEIGHT) / 2,
    left: 8,
    right: 8,
    height: ITEM_HEIGHT,
    borderRadius: 12,
    backgroundColor: "rgba(52,120,246,0.08)",
    borderWidth: 2,
    borderColor: PRIMARY,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 6,
  },
  colonWrapper: {
    paddingHorizontal: 4,
    height: WHEEL_CONTAINER_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  colon: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  previewText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#EEF2F7",
  },
  confirmButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  cancelText: {
    color: "#111827",
    fontWeight: "600",
  },
  confirmText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
