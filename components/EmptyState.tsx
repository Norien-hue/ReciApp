import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  message?: string;
}

export default function EmptyState({
  icon = 'file-tray-outline',
  message = 'No hay datos disponibles',
}: EmptyStateProps) {
  return (
    <View className="flex-1 justify-center items-center py-20">
      <Ionicons name={icon} size={64} color="#d1d5db" />
      <Text className="text-gray-400 text-base mt-4">{message}</Text>
    </View>
  );
}
