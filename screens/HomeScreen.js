import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase";

const PRIMARY = "#3478F6";

const formatEventTime = (event) => {
  const pad = (value) => String(value).padStart(2, "0");
  if (event.startHour != null && event.startMinute != null) {
    const start = `${pad(event.startHour)}:${pad(event.startMinute)}`;
    if (event.endHour != null && event.endMinute != null) {
      return `${start} - ${pad(event.endHour)}:${pad(event.endMinute)}`;
    }
    return start;
  }
  return event.time || "All day";
};

export default function HomeScreen({ navigation, user }) {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const ref = doc(db, "events", user.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data().events || [] : [];
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert("Error", "Unable to load events right now.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [user.uid])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate("Settings")}
          accessibilityLabel="Open settings"
        >
          <View style={styles.menuLine} />
          <View style={[styles.menuLine, { width: 18 }]} />
          <View style={[styles.menuLine, { width: 20 }]} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleDayPress = (day) => {
    const dateString = day.dateString;
    if (dateString === selectedDate) {
      navigation.navigate("ViewEvents", { date: dateString });
      return;
    }
    setSelectedDate(dateString);
  };

  const markedDates = useMemo(() => {
    const marks = events.reduce((acc, event) => {
      if (event.date) {
        acc[event.date] = {
          ...(acc[event.date] || {}),
          marked: true,
          dotColor: PRIMARY,
        };
      }
      return acc;
    }, {});

    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || {}),
        selected: true,
        selectedColor: PRIMARY,
        selectedTextColor: "#FFFFFF",
      };
    }

    return marks;
  }, [events, selectedDate]);

  const eventsForSelectedDate = useMemo(
    () => events.filter((event) => event.date === selectedDate),
    [events, selectedDate]
  );

  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate}
        onDayPress={handleDayPress}
        markedDates={markedDates}
        theme={{
          todayTextColor: PRIMARY,
          arrowColor: PRIMARY,
        }}
        style={styles.calendar}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedDate} ({eventsForSelectedDate.length} events)
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("ViewEvents", { date: selectedDate })}
        >
          <Text style={styles.link}>View</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={PRIMARY} />
      ) : (
        <FlatList
          data={eventsForSelectedDate}
          keyExtractor={(item) => String(item.createdAt)}
          contentContainerStyle={
            eventsForSelectedDate.length === 0 && { flex: 1, justifyContent: "center" }
          }
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              <View style={styles.eventMeta}>
                <Text style={styles.eventTime}>{formatEventTime(item)}</Text>
                <Text style={styles.eventTitle}>{item.title}</Text>
              </View>
              {item.description ? (
                <Text style={styles.eventDescription}>{item.description}</Text>
              ) : null}
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No events scheduled for this day.</Text>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddEvent", { date: selectedDate })}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  calendar: {
    borderRadius: 12,
    elevation: 1,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  link: {
    color: PRIMARY,
    fontWeight: "600",
  },
  eventCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  eventMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  eventTime: {
    fontSize: 14,
    color: "#4B5563",
  },
  eventDescription: {
    fontSize: 14,
    color: "#4B5563",
  },
  emptyText: {
    color: "#6B7280",
    textAlign: "center",
    marginTop: 20,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: PRIMARY,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
  },
  menuButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  menuLine: {
    height: 3,
    width: 22,
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
    marginVertical: 2,
  },
});
