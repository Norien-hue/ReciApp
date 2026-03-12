import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  color = '#16a34a',
}: StatCardProps) {
  return (
    <View className="bg-white rounded-xl p-4 flex-1 border border-gray-100 shadow-sm">
      <View className="flex-row items-center mb-2">
        <Ionicons name={icon} size={20} color={color} />
        <Text className="text-xs text-gray-500 ml-1">{label}</Text>
      </View>
      <Text className="text-xl font-bold text-gray-800">{value}</Text>
    </View>
  );
}
