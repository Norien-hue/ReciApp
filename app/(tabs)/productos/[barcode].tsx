import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getApiService } from '@/services';
import type { ProductoConConteo } from '@/types';

export default function ProductDetailScreen() {
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const [producto, setProducto] = useState<ProductoConConteo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!barcode) return;
      // barcode viene como "TIPO-NUMERO", ej: "EAN13-0000000000001"
      const [tipo, ...rest] = barcode.split('-');
      const numeroBarras = rest.join('-');
      const api = getApiService();
      const p = await api.getProducto(tipo, numeroBarras);
      setProducto(p);
      setIsLoading(false);
    };
    load();
  }, [barcode]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (!producto) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Ionicons name="alert-circle-outline" size={64} color="#d1d5db" />
        <Text className="text-gray-400 text-base mt-4">
          Producto no encontrado
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Imagen placeholder */}
      <View className="bg-gray-200 h-48 items-center justify-center">
        {producto.imagen ? (
          <Text className="text-gray-400">Imagen del producto</Text>
        ) : (
          <View className="items-center">
            <Ionicons name="image-outline" size={64} color="#9ca3af" />
            <Text className="text-gray-400 mt-2">Sin imagen</Text>
          </View>
        )}
      </View>

      <View className="p-6">
        {/* Nombre */}
        <Text className="text-2xl font-bold text-gray-800">
          {producto.nombre}
        </Text>

        {/* Material badge */}
        <View className="flex-row mt-3">
          <View className="bg-green-100 rounded-full px-3 py-1">
            <Text className="text-sm text-green-700 font-medium">
              {producto.material}
            </Text>
          </View>
        </View>

        {/* Info cards */}
        <View className="mt-6 gap-4">
          <View className="bg-white rounded-xl p-4 border border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="barcode-outline" size={24} color="#6b7280" />
              <View className="ml-3">
                <Text className="text-xs text-gray-400">Código de barras</Text>
                <Text className="text-base font-medium text-gray-800">
                  {producto.tipo}: {producto.numeroBarras}
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-xl p-4 border border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="leaf-outline" size={24} color="#16a34a" />
              <View className="ml-3">
                <Text className="text-xs text-gray-400">
                  Emisiones reducibles al reciclar
                </Text>
                <Text className="text-base font-bold text-green-600">
                  {producto.emisionesReducibles} kg CO₂
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-xl p-4 border border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="refresh-outline" size={24} color="#2563eb" />
              <View className="ml-3">
                <Text className="text-xs text-gray-400">
                  Veces reciclado por ti
                </Text>
                <Text className="text-base font-bold text-blue-600">
                  {producto.vecesReciclado.toLocaleString()} veces
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
