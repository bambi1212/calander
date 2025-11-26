import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./firebase";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import AddEventScreen from "./screens/AddEventScreen";
import ViewEventsScreen from "./screens/ViewEventsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import MenuScreen from "./screens/MenuScreen";
import AboutScreen from "./screens/AboutScreen";
import { ThemeProvider, useAppTheme } from "./context/AppThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

const Stack = createNativeStackNavigator();

function Navigator({ user }) {
  const { navigationTheme, colors } = useAppTheme();
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerText,
          headerTitleStyle: { fontWeight: "600" },
          contentStyle: { backgroundColor: colors.background },
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
              name="ViewEvents"
              options={({ route }) => ({
                title: route.params?.date
                  ? `Events (${route.params.date})`
                  : "Events",
              })}
            >
              {(props) => <ViewEventsScreen {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: "Settings" }}
            />
            <Stack.Screen
              name="Menu"
              component={MenuScreen}
              options={{ title: "Menu" }}
            />
            <Stack.Screen
              name="About"
              component={AboutScreen}
              options={{ title: "About Us" }}
            />
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
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <AuthGate />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function AuthGate() {
  const { user, loading } = useAuth();
  const { colors } = useAppTheme();
  if (loading) {
    return (
      <GestureHandlerRootView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </GestureHandlerRootView>
    );
  }
  return <Navigator user={user} />;
}
