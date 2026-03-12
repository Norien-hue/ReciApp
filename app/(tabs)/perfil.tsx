import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { getApiService } from '@/services';
import StatCard from '@/components/StatCard';

export default function PerfilScreen() {
  const { user, logout, updateUser } = useAuthStore();

  // Estado para editar nombre
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [passwordNombre, setPasswordNombre] = useState('');
  const [isUpdatingNombre, setIsUpdatingNombre] = useState(false);

  // Estado para cambiar contraseña
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const emisionesKg = user?.emisionesReducidas ?? 0;
  const emisionesTon = emisionesKg / 1000;

  const handleUpdateNombre = async () => {
    if (!nuevoNombre.trim() || !passwordNombre.trim()) {
      Alert.alert('Error', 'Rellena el nuevo nombre y tu contraseña actual.');
      return;
    }
    setIsUpdatingNombre(true);
    try {
      const api = getApiService();
      const updated = await api.updateNombre(
        user!.id,
        nuevoNombre.trim(),
        passwordNombre
      );
      updateUser(updated);
      setNuevoNombre('');
      setPasswordNombre('');
      Alert.alert('Éxito', 'Nombre actualizado correctamente.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo actualizar el nombre.');
    } finally {
      setIsUpdatingNombre(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (
      !passwordActual.trim() ||
      !passwordNueva.trim() ||
      !passwordConfirm.trim()
    ) {
      Alert.alert('Error', 'Rellena todos los campos de contraseña.');
      return;
    }
    if (passwordNueva !== passwordConfirm) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden.');
      return;
    }
    if (passwordNueva.length < 4) {
      Alert.alert(
        'Error',
        'La nueva contraseña debe tener al menos 4 caracteres.'
      );
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const api = getApiService();
      await api.updatePassword(user!.id, passwordActual, passwordNueva);
      setPasswordActual('');
      setPasswordNueva('');
      setPasswordConfirm('');
      Alert.alert('Éxito', 'Contraseña actualizada correctamente.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const api = getApiService();
              await api.deleteAccount(user!.id, 'mock-password');
              await logout();
            } catch (e: any) {
              Alert.alert(
                'Error',
                e.message || 'No se pudo eliminar la cuenta.'
              );
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header con nombre */}
      <View className="bg-green-600 px-6 py-6 items-center">
        <View className="bg-white/20 rounded-full p-4 mb-3">
          <Ionicons name="person" size={40} color="white" />
        </View>
        <Text className="text-white text-xl font-bold">
          {user?.nombre ?? 'offline'}
        </Text>
        <Text className="text-green-100 text-sm mt-1">
          {user?.permisos === 'administrador' ? 'Administrador' : 'Cliente'}
        </Text>
      </View>

      {/* Stats */}
      <View className="flex-row px-4 mt-4 gap-3">
        <StatCard
          label="CO₂ reducido"
          value={`${emisionesKg.toFixed(1)} kg`}
          icon="leaf"
        />
        <StatCard
          label="En toneladas"
          value={`${emisionesTon.toFixed(4)} t`}
          icon="earth"
          color="#2563eb"
        />
      </View>

      {/* Editar nombre */}
      <View className="mx-4 mt-6 bg-white rounded-xl p-4 border border-gray-100">
        <Text className="text-base font-semibold text-gray-800 mb-3">
          Editar nombre
        </Text>
        <TextInput
          value={nuevoNombre}
          onChangeText={setNuevoNombre}
          placeholder="Nuevo nombre de usuario"
          autoCapitalize="none"
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-gray-50 mb-2"
        />
        <TextInput
          value={passwordNombre}
          onChangeText={setPasswordNombre}
          placeholder="Contraseña actual"
          secureTextEntry
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-gray-50 mb-3"
        />
        <Pressable
          onPress={handleUpdateNombre}
          disabled={isUpdatingNombre}
          className="bg-green-600 rounded-lg py-3 items-center active:bg-green-700">
          {isUpdatingNombre ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">Guardar nombre</Text>
          )}
        </Pressable>
      </View>

      {/* Cambiar contraseña */}
      <View className="mx-4 mt-4 bg-white rounded-xl p-4 border border-gray-100">
        <Text className="text-base font-semibold text-gray-800 mb-3">
          Cambiar contraseña
        </Text>
        <TextInput
          value={passwordActual}
          onChangeText={setPasswordActual}
          placeholder="Contraseña actual"
          secureTextEntry
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-gray-50 mb-2"
        />
        <TextInput
          value={passwordNueva}
          onChangeText={setPasswordNueva}
          placeholder="Nueva contraseña"
          secureTextEntry
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-gray-50 mb-2"
        />
        <TextInput
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          placeholder="Confirmar nueva contraseña"
          secureTextEntry
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-gray-50 mb-3"
        />
        <Pressable
          onPress={handleUpdatePassword}
          disabled={isUpdatingPassword}
          className="bg-green-600 rounded-lg py-3 items-center active:bg-green-700">
          {isUpdatingPassword ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">
              Cambiar contraseña
            </Text>
          )}
        </Pressable>
      </View>

      {/* Acciones peligrosas */}
      <View className="mx-4 mt-6 mb-10 gap-3">
        <Pressable
          onPress={handleLogout}
          className="bg-gray-200 rounded-xl py-4 items-center active:bg-gray-300">
          <Text className="text-gray-700 font-semibold">Cerrar sesión</Text>
        </Pressable>

        <Pressable
          onPress={handleDeleteAccount}
          className="bg-red-100 rounded-xl py-4 items-center active:bg-red-200">
          <Text className="text-red-600 font-semibold">Eliminar cuenta</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
