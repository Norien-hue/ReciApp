import { View, Text, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TapModalProps {
  visible: boolean;
  onClose: () => void;
  tap: number | null;
  isGuest: boolean;
}

export default function TapModal({ visible, onClose, tap, isGuest }: TapModalProps) {
  const hasTap = tap !== null && tap !== undefined;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
          {/* Header */}
          <View
            className={`px-6 py-5 items-center ${hasTap ? 'bg-green-50' : 'bg-gray-50'}`}>
            <View
              className={`rounded-full p-3 mb-3 ${hasTap ? 'bg-green-100' : 'bg-gray-200'}`}>
              <Ionicons
                name={hasTap ? 'shield-checkmark' : 'shield-outline'}
                size={36}
                color={hasTap ? '#16a34a' : '#9ca3af'}
              />
            </View>
            <Text className="text-lg font-bold text-gray-800">
              TAP de la cuenta
            </Text>
          </View>

          {/* Body */}
          <View className="px-6 py-5">
            {isGuest ? (
              <View className="items-center">
                <Ionicons name="person-outline" size={28} color="#d97706" />
                <Text className="text-gray-600 text-center mt-2 text-base">
                  No se puede consultar el TAP en modo invitado. Inicia sesion
                  para ver tu TAP.
                </Text>
              </View>
            ) : hasTap ? (
              <View className="items-center">
                <Text className="text-4xl font-bold text-green-600">{tap}</Text>
                <Text className="text-gray-500 text-sm mt-2 text-center">
                  Este es tu TAP (Token de Autenticacion Personal) asociado a tu
                  cuenta.
                </Text>
              </View>
            ) : (
              <View className="items-center">
                <Ionicons name="help-circle-outline" size={28} color="#9ca3af" />
                <Text className="text-gray-600 text-center mt-2 text-base">
                  No tienes un TAP asignado. Contacta con un administrador o
                  espera a que se te asigne uno.
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View className="px-6 pb-5">
            <Pressable
              onPress={onClose}
              className="bg-green-600 rounded-xl py-3 items-center active:bg-green-700">
              <Text className="text-white font-semibold text-base">Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
