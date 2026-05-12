import { useCallback, useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useRecycleStore } from '@/store/recycleStore';
import RecycleHistoryItem from '@/components/RecycleHistoryItem';
import EmptyState from '@/components/EmptyState';

export default function HistorialScreen() {
  const { user, isGuest } = useAuthStore((s) => ({ user: s.user, isGuest: s.isGuest }));
  const { historial, isLoading, fetchHistorial } = useRecycleStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHistorial(user.id);
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchHistorial(user.id);
    setRefreshing(false);
  }, [user]);

  // Calcular total de emisiones reducidas del historial
  const totalEmisiones = historial.reduce(
    (acc, item) => acc + item.emisionesReducibles,
    0
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Resumen arriba */}
      <View className="bg-green-600 px-4 py-4">
        <Text className="text-white text-sm">Total reducido en historial</Text>
        <Text className="text-white text-2xl font-bold">
          {totalEmisiones.toFixed(1)} kg CO₂
        </Text>
      </View>

      {/* Banner invitado */}
      {isGuest && (
        <View className="mx-4 mt-3 bg-amber-50 border border-amber-300 rounded-xl p-3 flex-row items-center">
          <Ionicons name="lock-closed-outline" size={20} color="#d97706" />
          <Text className="text-amber-800 text-sm ml-2 flex-1">
            Estás viendo datos de ejemplo. Inicia sesión para ver tu historial real.
          </Text>
        </View>
      )}

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : (
        <FlatList
          data={historial}
          keyExtractor={(item, index) =>
            `${item.tipo}-${item.numeroBarras}-${item.fecha}-${item.hora}-${index}`
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} tintColor="#16a34a" />
          }
          renderItem={({ item }) => <RecycleHistoryItem item={item} />}
          ListEmptyComponent={
            <EmptyState
              icon="time-outline"
              message="No hay registros de reciclaje"
            />
          }
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
        />
      )}
    </View>
  );
}
