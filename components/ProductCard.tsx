import { View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ProductoConConteo } from '@/types';

interface ProductCardProps {
  producto: ProductoConConteo;
  onPress: () => void;
}

export default function ProductCard({ producto, onPress }: ProductCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-xl mx-4 mb-3 p-4 shadow-sm border border-gray-100 active:bg-gray-50">
      <View className="flex-row">
        {/* Imagen placeholder */}
        {producto.imagen ? (
          <Image
            source={{ uri: producto.imagen }}
            className="w-16 h-16 rounded-lg"
            resizeMode="cover"
          />
        ) : (
          <View className="w-16 h-16 rounded-lg bg-gray-200 items-center justify-center">
            <Ionicons name="cube-outline" size={28} color="#9ca3af" />
          </View>
        )}

        {/* Info */}
        <View className="flex-1 ml-3 justify-center">
          <Text className="text-base font-semibold text-gray-800" numberOfLines={1}>
            {producto.nombre}
          </Text>
          <View className="flex-row items-center mt-1 gap-2">
            <View className="bg-green-100 rounded-full px-2 py-0.5">
              <Text className="text-xs text-green-700">{producto.material}</Text>
            </View>
            <Text className="text-xs text-gray-400">
              {producto.tipo}:{producto.numeroBarras}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="items-end justify-center">
          <Text className="text-sm font-bold text-green-600">
            -{producto.emisionesReducibles} kg
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            {producto.vecesReciclado}x
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
