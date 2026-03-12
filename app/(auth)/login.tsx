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

export default function LoginScreen() {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    if (!nombre.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor, rellena todos los campos.');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(nombre.trim(), password);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo iniciar sesión.');
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
          {/* Logo / Header */}
          <View className="items-center mb-10">
            <View className="bg-green-100 rounded-full p-5 mb-4">
              <Ionicons name="leaf" size={48} color="#16a34a" />
            </View>
            <Text className="text-3xl font-bold text-green-700">ReciApp</Text>
            <Text className="text-gray-500 mt-1">Recicla y reduce emisiones</Text>
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
                placeholder="Tu nombre de usuario"
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
                placeholder="Tu contraseña"
                secureTextEntry
                className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
              />
            </View>

            <Pressable
              onPress={handleLogin}
              disabled={isSubmitting}
              className="bg-green-600 rounded-xl py-4 items-center mt-2 active:bg-green-700">
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Iniciar Sesión
                </Text>
              )}
            </Pressable>
          </View>

          {/* Link a registro */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">¿No tienes cuenta? </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text className="text-green-600 font-semibold">Regístrate</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
