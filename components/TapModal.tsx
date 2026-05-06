import { View, Text, Pressable, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TapModalProps {
  visible: boolean;
  onClose: () => void;
  tap: number | null;
  isGuest: boolean;
  onRequestTap?: () => Promise<void>;
  isRequestingTap?: boolean;
}

export default function TapModal({
  visible,
  onClose,
  tap,
  isGuest,
  onRequestTap,
  isRequestingTap = false,
}: TapModalProps) {
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
        <Pressable onPress={() => {}} className="w-full max-w-sm">
          <View className="bg-white rounded-2xl w-full overflow-hidden">
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
                    No tienes un TAP asignado todavia. Puedes solicitar uno ahora.
                  </Text>
                </View>
              )}
            </View>

            {/* Footer */}
            <View className="px-6 pb-5 gap-3">
              {/* Botón Solicitar / Renovar TAP — solo usuarios registrados con handler */}
              {!isGuest && onRequestTap && (
                <Pressable
                  onPress={onRequestTap}
                  disabled={isRequestingTap}
                  className={`rounded-xl py-3 items-center flex-row justify-center gap-2 ${
                    hasTap
                      ? 'bg-amber-500 active:bg-amber-600'
                      : 'bg-green-600 active:bg-green-700'
                  } ${isRequestingTap ? 'opacity-60' : ''}`}>
                  {isRequestingTap ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Ionicons
                      name={hasTap ? 'refresh' : 'add-circle-outline'}
                      size={18}
                      color="white"
                    />
                  )}
                  <Text className="text-white font-semibold text-base">
                    {isRequestingTap
                      ? 'Solicitando...'
                      : hasTap
                        ? 'Renovar TAP'
                        : 'Solicitar TAP'}
                  </Text>
                </Pressable>
              )}

              <Pressable
                onPress={onClose}
                className="bg-gray-100 rounded-xl py-3 items-center active:bg-gray-200">
                <Text className="text-gray-700 font-semibold text-base">Cerrar</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
