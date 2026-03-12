// ============================================================
// app/_layout.tsx
// ============================================================
// Layout raíz: configura providers (Paper, SafeArea) y
// redirige según estado de autenticación
// ============================================================

import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme, ActivityIndicator, View } from "react-native";
import { useAuthStore } from "../store/authStore";
import "../global.css";

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#0d9488",
    primaryContainer: "#ccfbf1",
    secondary: "#14b8a6",
    secondaryContainer: "#99f6e4",
    surface: "#f8fafc",
    surfaceVariant: "#f1f5f9",
    background: "#f8fafc",
    error: "#ef4444",
    onPrimary: "#ffffff",
    onSurface: "#0f172a",
    onSurfaceVariant: "#475569",
    outline: "#cbd5e1",
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#2dd4bf",
    primaryContainer: "#115e59",
    secondary: "#5eead4",
    secondaryContainer: "#0f766e",
    surface: "#0f172a",
    surfaceVariant: "#1e293b",
    background: "#0f172a",
    error: "#f87171",
    onPrimary: "#0f172a",
    onSurface: "#f1f5f9",
    onSurfaceVariant: "#94a3b8",
    outline: "#334155",
  },
};

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, loadStoredAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-50 dark:bg-surface-900">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthGate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </AuthGate>
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
