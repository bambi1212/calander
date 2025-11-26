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
import { useAppTheme } from "../context/AppThemeContext";

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
  const { colors } = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
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
          onPress={() => navigation.navigate("Menu")}
          accessibilityLabel="Open menu"
        >
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, styles.menuButton, styles.menuLine]);

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
          dotColor: colors.primary,
        };
      }
      return acc;
    }, {});

    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || {}),
        selected: true,
        selectedColor: colors.primary,
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
          todayTextColor: colors.primary,
          arrowColor: colors.primary,
          calendarBackground: colors.card,
          dayTextColor: colors.text,
          textDisabledColor: colors.muted,
          monthTextColor: colors.text,
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
        <ActivityIndicator color={colors.primary} />
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

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.text,
    },
    link: {
      color: colors.primary,
      fontWeight: "600",
    },
    eventCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.text,
    },
    eventTime: {
      fontSize: 14,
      color: colors.muted,
    },
    eventDescription: {
      fontSize: 14,
      color: colors.muted,
    },
    emptyText: {
      color: colors.muted,
      textAlign: "center",
      marginTop: 20,
    },
    fab: {
      position: "absolute",
      right: 20,
      bottom: 30,
      backgroundColor: colors.primary,
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
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
      backgroundColor: colors.headerText,
      borderRadius: 2,
      marginVertical: 2,
    },
  });
