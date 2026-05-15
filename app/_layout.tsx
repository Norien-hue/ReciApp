import '../global.css';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
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
    console.log('[LAYOUT] Restaurando sesion...');
    restoreSession();
  }, []);

  // Comprobar conexión al montar
  useEffect(() => {
    console.log('[LAYOUT] Effect conexion - hasChecked:', hasChecked);
    if (!hasChecked) {
      const checkConn = async () => {
        const api = getApiService();
        console.log('[LAYOUT] Comprobando conexion...');
        const online = await api.checkConnection();
        console.log('[LAYOUT] Resultado conexion:', online);
        setOnline(online);
        if (!online) {
          console.log('[LAYOUT] >>> ABRIENDO connection-modal');
          router.push('/connection-modal');
        } else {
          console.log('[LAYOUT] Conexion OK, setHasChecked()');
          setHasChecked();
        }
      };
      const timer = setTimeout(checkConn, 500);
      return () => clearTimeout(timer);
    }
  }, [hasChecked]);

  // Auth guard: redirigir según estado de autenticación
  // Solo actúa DESPUÉS de que la conexión se haya comprobado (hasChecked)
  useEffect(() => {
    console.log('[LAYOUT] Auth guard - isLoading:', isLoading, 'hasChecked:', hasChecked, 'token:', !!token, 'segments:', segments);
    if (isLoading || !hasChecked) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inModal = segments[0] === 'connection-modal';

    if (!token && !inAuthGroup && !inModal) {
      console.log('[LAYOUT] >>> NAVEGANDO a login');
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      console.log('[LAYOUT] >>> NAVEGANDO a productos (tiene token)');
      router.replace('/(tabs)/productos');
    }
  }, [token, isLoading, segments, hasChecked]);

  if (isLoading) {
    console.log('[LAYOUT] Mostrando spinner de carga (isLoading=true)');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  console.log('[LAYOUT] Renderizando Stack. segments:', segments);

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
      <PaperProvider>
        <RootLayoutNav />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
