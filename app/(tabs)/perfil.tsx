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
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useConnectionStore } from '@/store/connectionStore';
import { getApiService } from '@/services';
import StatCard from '@/components/StatCard';
import TapModal from '@/components/TapModal';

export default function PerfilScreen() {
  const router = useRouter();
  const { user, logout, updateUser, isGuest } = useAuthStore();
  const { setOnline, setHasChecked } = useConnectionStore();

  // Estado para editar nombre
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [passwordNombre, setPasswordNombre] = useState('');
  const [isUpdatingNombre, setIsUpdatingNombre] = useState(false);

  // Estado para cambiar contraseña
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Estado para modal de TAP
  const [showTapModal, setShowTapModal] = useState(false);

  // Estado para comprobar conexión al intentar iniciar sesión
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  const handleGuestLogin = async () => {
    setIsCheckingConnection(true);
    try {
      const api = getApiService();
      const online = await api.checkConnection();
      setOnline(online);

      if (online) {
        // Hay conexión → logout del guest e ir a login
        setHasChecked();
        await logout();
      } else {
        // No hay conexión → mostrar modal de reconexión
        await logout();
        router.push('/connection-modal');
      }
    } catch {
      // Error inesperado → mostrar modal de reconexión
      await logout();
      router.push('/connection-modal');
    } finally {
      setIsCheckingConnection(false);
    }
  };

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
          {isGuest
            ? 'Modo offline — Invitado'
            : user?.permisos === 'administrador'
              ? 'Administrador'
              : 'Cliente'}
        </Text>
      </View>

      {/* Banner invitado */}
      {isGuest && (
        <View className="mx-4 mt-4 bg-amber-50 border border-amber-300 rounded-xl p-3 flex-row items-center">
          <Ionicons name="information-circle" size={22} color="#d97706" />
          <Text className="text-amber-800 text-sm ml-2 flex-1">
            Estás en modo invitado. Inicia sesión para guardar tu progreso y
            acceder a todas las funciones.
          </Text>
        </View>
      )}

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

      {/* Botón consultar TAP */}
      <Pressable
        onPress={() => setShowTapModal(true)}
        className="mx-4 mt-4 bg-white rounded-xl p-4 border border-gray-100 flex-row items-center active:bg-gray-50">
        <View className="bg-green-100 rounded-full p-2 mr-3">
          <Ionicons name="shield-checkmark" size={22} color="#16a34a" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800">
            Consultar TAP
          </Text>
          <Text className="text-sm text-gray-500">
            Token de Autenticacion Personal
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </Pressable>

      {/* Modal TAP */}
      <TapModal
        visible={showTapModal}
        onClose={() => setShowTapModal(false)}
        tap={user?.tap ?? null}
        isGuest={isGuest}
      />

      {/* Editar nombre — solo usuarios registrados */}
      {!isGuest ? (
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
      ) : (
        /* Aviso de login en lugar de las secciones de edición */
        <Pressable
          onPress={handleGuestLogin}
          disabled={isCheckingConnection}
          className="mx-4 mt-6 bg-white rounded-xl p-5 border border-gray-100 items-center active:bg-gray-50">
          <View className="bg-gray-100 rounded-full p-3 mb-3">
            <Ionicons name="lock-closed" size={28} color="#6b7280" />
          </View>
          <Text className="text-gray-800 font-semibold text-base text-center">
            Inicia sesión para editar tu perfil
          </Text>
          <Text className="text-gray-500 text-sm text-center mt-1">
            Cambia tu nombre, contraseña y gestiona tu cuenta.
          </Text>
          <View className="mt-4 bg-green-600 rounded-lg px-6 py-2.5">
            {isCheckingConnection ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-semibold">Iniciar sesión</Text>
            )}
          </View>
        </Pressable>
      )}

      {/* Cambiar contraseña — solo usuarios registrados */}
      {!isGuest && (
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
      )}

      {/* Acciones */}
      <View className="mx-4 mt-6 mb-10 gap-3">
        {isGuest ? (
          // Guest: comprobar conexión antes de ir a login
          <Pressable
            onPress={handleGuestLogin}
            disabled={isCheckingConnection}
            className="bg-green-600 rounded-xl py-4 items-center active:bg-green-700">
            {isCheckingConnection ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-semibold">
                  Comprobando conexion...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-semibold">
                Iniciar sesion / Registrarse
              </Text>
            )}
          </Pressable>
        ) : (
          // Usuario registrado: cerrar sesión + eliminar cuenta
          <>
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
          </>
        )}
      </View>
    </ScrollView>
  );
}
