import '../global.css';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useConnectionStore } from '@/store/connectionStore';
import { getApiService } from '@/services';

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { token, isLoading, restoreSession } = useAuthStore();
  const { hasChecked, setOnline, setHasChecked } = useConnectionStore();

  // Restaurar sesión al montar
  useEffect(() => {
    restoreSession();
  }, []);

  // Comprobar conexión al montar
  useEffect(() => {
    if (!hasChecked) {
      const checkConn = async () => {
        const api = getApiService();
        const online = await api.checkConnection();
        setOnline(online);
        if (!online) {
          // Mostrar modal de conexión
          router.push('/connection-modal');
        } else {
          setHasChecked();
        }
      };
      // Pequeño delay para que el router esté listo
      const timer = setTimeout(checkConn, 500);
      return () => clearTimeout(timer);
    }
  }, [hasChecked]);

  // Auth guard: redirigir según estado de autenticación
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inModal = segments[0] === 'connection-modal';

    if (!token && !inAuthGroup && !inModal) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)/productos');
    }
  }, [token, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="connection-modal"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootLayoutNav />
    </SafeAreaProvider>
  );
}
