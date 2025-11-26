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
const PADDING = ((VISIBLE_ROWS - 1) / 2) * ITEM_HEIGHT; // centers the selected row
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
const LOOP_MULTIPLIER = 120;

const pad = (val) => String(val).padStart(2, "0");

const buildLooped = (values) =>
  Array.from({ length: values.length * LOOP_MULTIPLIER }, (_, idx) => {
    return values[idx % values.length];
  });

const normalizeIndex = (index, length) => {
  const mod = index % length;
  return mod < 0 ? mod + length : mod;
};

const Wheel = ({ values, initialValue, resetKey, formatter, onValueChange }) => {
  const listRef = useRef(null);
  const baseLength = values.length;
  const data = useMemo(() => buildLooped(values), [values]);
  const middleAnchor = useMemo(() => {
    const mid = Math.floor(data.length / 2);
    return mid - (mid % baseLength);
  }, [data, baseLength]);

  const [activeIndex, setActiveIndex] = useState(middleAnchor);
  const activeRef = useRef(middleAnchor);

  const scrollToValue = (value) => {
    const valueIndex = Math.max(0, values.findIndex((v) => v === value));
    const targetIndex = middleAnchor + valueIndex;
    activeRef.current = targetIndex;
    setActiveIndex(targetIndex);
    listRef.current?.scrollToOffset({
      offset: targetIndex * ITEM_HEIGHT + PADDING,
      animated: false,
    });
  };

  useEffect(() => {
    scrollToValue(initialValue ?? values[0]);
  }, [resetKey, initialValue, values]);

  const computeIndex = (offsetY) => {
    const effectiveOffset = offsetY - PADDING;
    return Math.round(effectiveOffset / ITEM_HEIGHT);
  };

  const updateFromIndex = (idx) => {
    const normalized = normalizeIndex(idx, baseLength);
    const nextValue = values[normalized];
    onValueChange?.(nextValue);
  };

  const snapToNearest = (offsetY) => {
    const idx = computeIndex(offsetY);
    const targetOffset = idx * ITEM_HEIGHT + PADDING;
    listRef.current?.scrollToOffset({
      offset: targetOffset,
      animated: false,
    });
    activeRef.current = idx;
    setActiveIndex(idx);
    updateFromIndex(idx);
  };

  const handleScroll = (e) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const idx = computeIndex(offsetY);
    if (idx !== activeRef.current) {
      activeRef.current = idx;
      setActiveIndex(idx);
      updateFromIndex(idx);
    }
  };

  return (
    <View style={styles.wheel}>
      <View style={styles.selectionBar} pointerEvents="none" />
      <View style={[styles.fadeOverlay, styles.topFade]} pointerEvents="none">
        <View style={[styles.fadeStrip, { opacity: 0.9 }]} />
        <View style={[styles.fadeStrip, { opacity: 0.65 }]} />
        <View style={[styles.fadeStrip, { opacity: 0.35 }]} />
        <View style={[styles.fadeStrip, { opacity: 0.15 }]} />
      </View>
      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(_, idx) => String(idx)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        snapToAlignment="center"
        initialNumToRender={VISIBLE_ROWS + 4}
        windowSize={9}
        maxToRenderPerBatch={32}
        removeClippedSubviews
        contentContainerStyle={{ paddingVertical: PADDING }}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onMomentumScrollEnd={(e) => snapToNearest(e.nativeEvent.contentOffset.y)}
        onScrollEndDrag={(e) => snapToNearest(e.nativeEvent.contentOffset.y)}
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
      <View
        style={[styles.fadeOverlay, styles.bottomFade]}
        pointerEvents="none"
      >
        <View style={[styles.fadeStrip, { opacity: 0.9 }]} />
        <View style={[styles.fadeStrip, { opacity: 0.65 }]} />
        <View style={[styles.fadeStrip, { opacity: 0.35 }]} />
        <View style={[styles.fadeStrip, { opacity: 0.15 }]} />
      </View>
    </View>
  );
};

export default function TimeWheelPicker({
  visible,
  initialHour = 12,
  initialMinute = 0,
  onConfirm,
  onCancel,
  title = "Select Time",
}) {
  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);
  const [resetKey, setResetKey] = useState(0);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i + 1), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  useEffect(() => {
    if (visible) {
      setHour(initialHour);
      setMinute(initialMinute);
      setResetKey((k) => k + 1);
    }
  }, [visible, initialHour, initialMinute]);

  const handleConfirm = () => {
    onConfirm?.(hour, minute);
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
            <Wheel
              values={hours}
              initialValue={hour}
              resetKey={resetKey}
              formatter={pad}
              onValueChange={setHour}
            />
            <Wheel
              values={minutes}
              initialValue={minute}
              resetKey={resetKey}
              formatter={pad}
              onValueChange={setMinute}
            />
          </View>

          <Text style={styles.preview}>{`${pad(hour)}:${pad(minute)}`}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
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
    width: 104,
    height: WHEEL_HEIGHT,
    overflow: "hidden",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginHorizontal: 10,
    backgroundColor: "#FFFFFF",
    position: "relative",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  selectionBar: {
    position: "absolute",
    left: 8,
    right: 8,
    top: PADDING,
    height: ITEM_HEIGHT,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    zIndex: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  wheelText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  wheelTextActive: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "700",
  },
  wheelTextInactive: {
    color: "#111827",
    opacity: 0.4,
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
  fadeOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    height: PADDING,
    zIndex: 3,
    backgroundColor: "transparent",
    pointerEvents: "none",
  },
  topFade: {
    top: 0,
    flexDirection: "column",
  },
  bottomFade: {
    bottom: 0,
    flexDirection: "column-reverse",
  },
  fadeStrip: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
