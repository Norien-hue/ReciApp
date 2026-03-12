import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';

export default function RegisterScreen() {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const register = useAuthStore((s) => s.register);

  const handleRegister = async () => {
    if (!nombre.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Por favor, rellena todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 4) {
      Alert.alert('Error', 'La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    setIsSubmitting(true);
    try {
      await register(nombre.trim(), password);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo registrar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled">
        <View className="px-8">
          {/* Header */}
          <View className="items-center mb-10">
            <View className="bg-green-100 rounded-full p-5 mb-4">
              <Ionicons name="person-add" size={48} color="#16a34a" />
            </View>
            <Text className="text-3xl font-bold text-green-700">Registro</Text>
            <Text className="text-gray-500 mt-1">Crea tu cuenta en ReciApp</Text>
          </View>

          {/* Formulario */}
          <View className="gap-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Nombre de usuario
              </Text>
              <TextInput
                value={nombre}
                onChangeText={setNombre}
                placeholder="Elige un nombre de usuario"
                autoCapitalize="none"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 4 caracteres"
                secureTextEntry
                className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Confirmar contraseña
              </Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repite la contraseña"
                secureTextEntry
                className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
              />
            </View>

            <Pressable
              onPress={handleRegister}
              disabled={isSubmitting}
              className="bg-green-600 rounded-xl py-4 items-center mt-2 active:bg-green-700">
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Registrarse
                </Text>
              )}
            </Pressable>
          </View>

          {/* Link a login */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">¿Ya tienes cuenta? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="text-green-600 font-semibold">Inicia sesión</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
