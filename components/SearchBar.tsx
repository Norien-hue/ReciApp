import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar por nombre o código...',
}: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2 mx-4 mt-4 mb-2">
      <Ionicons name="search" size={20} color="#9ca3af" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoCapitalize="none"
        className="flex-1 ml-2 text-base text-gray-800"
        placeholderTextColor="#9ca3af"
      />
      {value.length > 0 && (
        <Ionicons
          name="close-circle"
          size={20}
          color="#9ca3af"
          onPress={() => onChangeText('')}
        />
      )}
    </View>
  );
}
