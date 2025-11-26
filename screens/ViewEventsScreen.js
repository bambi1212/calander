import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { doc, getDoc, setDoc } from "firebase/firestore";
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

export default function ViewEventsScreen({ route, navigation, user }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const routeDate = route?.params?.date;
  const selectedDate = routeDate || new Date().toISOString().split("T")[0];
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = async () => {
    setError("");
    setLoading(true);
    try {
      const ref = doc(db, "events", user.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data().events || [] : [];
      const safeEvents = Array.isArray(data) ? data : [];
      setEvents(safeEvents.filter((item) => item.date === selectedDate));
    } catch (err) {
      setError("Unable to load events for this day.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [selectedDate, user.uid])
  );

  const confirmDelete = (event) => {
    Alert.alert("Delete event", "Are you sure you want to delete this?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDelete(event),
      },
    ]);
  };

  const handleDelete = async (target) => {
    setLoading(true);
    try {
      const ref = doc(db, "events", user.uid);
      const snap = await getDoc(ref);
      const allEvents = snap.exists() ? snap.data().events || [] : [];
      const safeEvents = Array.isArray(allEvents) ? allEvents : [];
      const updatedAll = safeEvents.filter(
        (item) => item.createdAt !== target.createdAt
      );
      await setDoc(ref, { events: updatedAll }, { merge: true });
      setEvents(updatedAll.filter((item) => item.date === selectedDate));
    } catch (err) {
      Alert.alert("Error", "Could not delete the event.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardTime}>{formatEventTime(item)}</Text>
      </View>
      {item.description ? (
        <Text style={styles.cardDescription}>{item.description}</Text>
      ) : null}
      <View style={styles.cardActions}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("AddEvent", { event: item, date: selectedDate })
          }
        >
          <Text style={styles.actionEdit}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDelete(item)}>
          <Text style={styles.actionDelete}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{selectedDate}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => String(item.createdAt)}
          renderItem={renderItem}
          contentContainerStyle={
            events.length === 0 && { flex: 1, justifyContent: "center" }
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No events yet for this date.</Text>
          }
        />
      )}
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
    heading: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 12,
    },
    error: {
      color: "#DC2626",
      marginBottom: 8,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    cardTime: {
      fontSize: 13,
      color: colors.muted,
    },
    cardDescription: {
      fontSize: 14,
      color: colors.muted,
    },
    cardActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 10,
      gap: 16,
    },
    actionEdit: {
      color: colors.primary,
      fontWeight: "700",
    },
    actionDelete: {
      color: "#DC2626",
      fontWeight: "700",
    },
    emptyText: {
      textAlign: "center",
      color: colors.muted,
    },
  });
