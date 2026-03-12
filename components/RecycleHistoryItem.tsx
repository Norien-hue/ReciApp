import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { HistorialItem } from '@/types';

interface RecycleHistoryItemProps {
  item: HistorialItem;
}

export default function RecycleHistoryItem({ item }: RecycleHistoryItemProps) {
  return (
    <View className="bg-white mx-4 mb-2 p-4 rounded-xl border border-gray-100">
      <View className="flex-row items-center">
        <View className="bg-green-100 rounded-full p-2">
          <Ionicons name="refresh" size={20} color="#16a34a" />
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-base font-medium text-gray-800">
            {item.productoNombre}
          </Text>
          <Text className="text-xs text-gray-400 mt-0.5">
            {item.productoMaterial}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-sm font-semibold text-green-600">
            -{item.emisionesReducibles} kg CO₂
          </Text>
          <Text className="text-xs text-gray-400 mt-0.5">
            {item.fecha} {item.hora}
          </Text>
        </View>
      </View>
    </View>
  );
}
