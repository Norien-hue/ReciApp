// ============================================================
// app/(auth)/login.tsx
// ============================================================
// Pantalla de inicio de sesión
// ============================================================

import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import { useAuthStore } from "../../store/authStore";
import { loginUser } from "../../services/database";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async () => {
    if (!nombre.trim() || !password.trim()) {
      setError("Por favor, rellena todos los campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await loginUser(nombre.trim(), password);
      if (result.success && result.user && result.token) {
        await setAuth(result.user, result.token);
      } else {
        setError(result.error || "Error al iniciar sesión");
      }
    } catch (e: any) {
      setError("Error de conexión. Verifica que el servidor esté activo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-teal-700 dark:bg-surface-900">
          {/* Header decorativo */}
          <View className="items-center pt-20 pb-10">
            <View className="w-24 h-24 bg-white/20 rounded-3xl items-center justify-center mb-4">
              <MaterialCommunityIcons
                name="recycle"
                size={56}
                color="#ffffff"
              />
            </View>
            <Text className="text-white text-3xl font-bold">ReciApp</Text>
            <Text className="text-teal-200 text-base mt-1">
              Recicla. Reduce. Reutiliza.
            </Text>
          </View>

          {/* Formulario */}
          <View className="flex-1 bg-white dark:bg-surface-800 rounded-t-[32px] px-6 pt-8 pb-6">
            <Text className="text-2xl font-bold text-surface-900 dark:text-white mb-1">
              Bienvenido
            </Text>
            <Text className="text-surface-500 dark:text-surface-400 mb-8">
              Inicia sesión para continuar
            </Text>

            <TextInput
              label="Nombre de usuario"
              value={nombre}
              onChangeText={(t) => {
                setNombre(t);
                setError("");
              }}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
              autoCapitalize="none"
              className="mb-4"
              outlineColor="#cbd5e1"
              activeOutlineColor="#0d9488"
            />

            <TextInput
              label="Contraseña"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError("");
              }}
              mode="outlined"
              secureTextEntry={!showPassword}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              className="mb-2"
              outlineColor="#cbd5e1"
              activeOutlineColor="#0d9488"
            />

            {error ? (
              <HelperText type="error" visible={!!error} className="mb-2">
                {error}
              </HelperText>
            ) : (
              <View className="h-6" />
            )}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              className="mt-2 rounded-xl"
              contentStyle={{ paddingVertical: 6 }}
              buttonColor="#0d9488"
              textColor="#ffffff"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
