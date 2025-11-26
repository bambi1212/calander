import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./firebase";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import AddEventScreen from "./screens/AddEventScreen";
import ViewEventsScreen from "./screens/ViewEventsScreen";
import TimePickerScreen from "./screens/TimePickerScreen";
import TimePickerDemo from "./screens/TimePickerDemo";
import SelectStartTime from "./screens/SelectStartTime";
import SelectEndTime from "./screens/SelectEndTime";

const Stack = createNativeStackNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#FFFFFF",
  },
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  if (authLoading) {
    return (
      <GestureHandlerRootView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <ActivityIndicator size="large" color="#3478F6" />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: "#3478F6" },
            headerTintColor: "#FFFFFF",
            headerTitleStyle: { fontWeight: "600" },
          }}
        >
          {user ? (
            <>
              <Stack.Screen name="Home" options={{ title: "Calendar" }}>
                {(props) => <HomeScreen {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen
                name="AddEvent"
                options={{ title: "Add / Edit Event", presentation: "modal" }}
              >
                {(props) => <AddEventScreen {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen
                name="TimePicker"
                component={TimePickerScreen}
                options={{ title: "Select Time", presentation: "modal" }}
              />
              <Stack.Screen
                name="TimePickerDemo"
                component={TimePickerDemo}
                options={{ title: "Clock Dial Picker" }}
              />
              <Stack.Screen
                name="SelectStartTime"
                component={SelectStartTime}
                options={{ title: "Start Time", presentation: "modal" }}
              />
              <Stack.Screen
                name="SelectEndTime"
                component={SelectEndTime}
                options={{ title: "End Time", presentation: "modal" }}
              />
              <Stack.Screen
                name="ViewEvents"
                options={({ route }) => ({
                  title: route.params?.date
                    ? `Events (${route.params.date})`
                    : "Events",
                })}
              >
                {(props) => <ViewEventsScreen {...props} user={user} />}
              </Stack.Screen>
            </>
          ) : (
            <>
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ headerShown: false }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
