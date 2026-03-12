import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useConnectionStore } from '@/store/connectionStore';
import { useAuthStore } from '@/store/authStore';
import { getApiService } from '@/services';
import { Ionicons } from '@expo/vector-icons';

export default function ConnectionModal() {
  const router = useRouter();
  const { setOnline, setHasChecked } = useConnectionStore();
  const { restoreSession, loginAsGuest } = useAuthStore();
  const [isChecking, setIsChecking] = useState(false);
  const [isEnteringOffline, setIsEnteringOffline] = useState(false);

  const handleReload = async () => {
    setIsChecking(true);
    try {
      const api = getApiService();
      const online = await api.checkConnection();
      setOnline(online);
      if (online) {
        setHasChecked();
        router.back();
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleOfflineMode = async () => {
    setIsEnteringOffline(true);
    try {
      setHasChecked();

      // Intentar restaurar sesión guardada en AsyncStorage
      const hasSession = await restoreSession();

      if (!hasSession) {
        // No hay sesión guardada → entrar como invitado
        loginAsGuest();
      }

      // Ya tenemos usuario (guardado o guest), navegar a tabs
      router.replace('/(tabs)/productos');
    } finally {
      setIsEnteringOffline(false);
    }
  };

  const isBusy = isChecking || isEnteringOffline;

  return (
    <View className="flex-1 justify-center items-center bg-white px-8">
      <View className="items-center mb-8">
        <Ionicons name="cloud-offline-outline" size={80} color="#dc2626" />
        <Text className="text-2xl font-bold text-gray-800 mt-4 text-center">
          Sin conexión
        </Text>
        <Text className="text-base text-gray-500 mt-2 text-center">
          No se pudo conectar al servidor. Puedes reintentar o continuar en modo
          offline con datos limitados.
        </Text>
      </View>

      <View className="w-full gap-3">
        <Pressable
          onPress={handleReload}
          disabled={isBusy}
          className="bg-green-600 rounded-xl py-4 items-center active:bg-green-700">
          {isChecking ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Recargar</Text>
          )}
        </Pressable>

        <Pressable
          onPress={handleOfflineMode}
          disabled={isBusy}
          className="bg-gray-200 rounded-xl py-4 items-center active:bg-gray-300">
          {isEnteringOffline ? (
            <ActivityIndicator color="#374151" />
          ) : (
            <Text className="text-gray-700 font-semibold text-base">
              Modo offline
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
