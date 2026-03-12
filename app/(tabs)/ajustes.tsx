// ============================================================
// app/(tabs)/ajustes.tsx
// ============================================================
// Pantalla de ajustes: cambiar nombre, contraseña, borrar cuenta
// ============================================================

import { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import {
  Card,
  Button,
  TextInput,
  Dialog,
  Portal,
  Paragraph,
  Divider,
  List,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import {
  cambiarNombre,
  cambiarPassword,
  borrarCuenta,
} from "../../services/database";

export default function AjustesScreen() {
  const { user, token, updateUser, logout } = useAuthStore();
  const theme = useTheme();

  // -- Estado para cambiar nombre --
  const [showNombreForm, setShowNombreForm] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nombreLoading, setNombreLoading] = useState(false);
  const [nombreError, setNombreError] = useState("");
  const [nombreSuccess, setNombreSuccess] = useState(false);

  // -- Estado para cambiar contraseña --
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordActual, setPasswordActual] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [showPassActual, setShowPassActual] = useState(false);
  const [showPassNueva, setShowPassNueva] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // -- Estado para borrar cuenta --
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ============================================================
  // CAMBIAR NOMBRE
  // ============================================================
  const handleCambiarNombre = async () => {
    if (!nuevoNombre.trim()) {
      setNombreError("El nombre no puede estar vacío");
      return;
    }
    if (nuevoNombre.trim().length < 2) {
      setNombreError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    setNombreLoading(true);
    setNombreError("");
    setNombreSuccess(false);

    try {
      const res = await cambiarNombre(
        user!.Id_Usuario,
        nuevoNombre.trim(),
        token!
      );
      if (res.success) {
        updateUser({ Nombre: nuevoNombre.trim() });
        setNombreSuccess(true);
        setNuevoNombre("");
        setTimeout(() => {
          setShowNombreForm(false);
          setNombreSuccess(false);
        }, 1500);
      } else {
        setNombreError(res.error || "Error al cambiar el nombre");
      }
    } catch (e: any) {
      setNombreError("Error de conexión");
    } finally {
      setNombreLoading(false);
    }
  };

  // ============================================================
  // CAMBIAR CONTRASEÑA
  // ============================================================
  const handleCambiarPassword = async () => {
    setPasswordError("");
    setPasswordSuccess(false);

    if (!passwordActual || !nuevaPassword || !confirmarPassword) {
      setPasswordError("Todos los campos son obligatorios");
      return;
    }
    if (nuevaPassword.length < 6) {
      setPasswordError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await cambiarPassword(
        user!.Id_Usuario,
        passwordActual,
        nuevaPassword,
        token!
      );
      if (res.success) {
        setPasswordSuccess(true);
        setPasswordActual("");
        setNuevaPassword("");
        setConfirmarPassword("");
        setTimeout(() => {
          setShowPasswordForm(false);
          setPasswordSuccess(false);
        }, 1500);
      } else {
        setPasswordError(res.error || "Error al cambiar la contraseña");
      }
    } catch (e: any) {
      setPasswordError("Error de conexión");
    } finally {
      setPasswordLoading(false);
    }
  };

  // ============================================================
  // BORRAR CUENTA
  // ============================================================
  const handleBorrarCuenta = async () => {
    setDeleteLoading(true);
    try {
      const res = await borrarCuenta(user!.Id_Usuario, token!);
      if (res.success) {
        setShowDeleteDialog(false);
        await logout();
      } else {
        Alert.alert("Error", res.error || "No se pudo borrar la cuenta");
      }
    } catch (e: any) {
      Alert.alert("Error", "Error de conexión");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-50 dark:bg-surface-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-2xl font-bold text-surface-900 dark:text-white">
            Ajustes
          </Text>
        </View>

        {/* Info del usuario */}
        <View className="px-5 mt-2">
          <Card
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.colors.outline,
            }}
          >
            <Card.Content className="py-4 px-4">
              <View className="flex-row items-center">
                <View className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-2xl items-center justify-center mr-4">
                  <MaterialCommunityIcons
                    name="account"
                    size={28}
                    color="#0d9488"
                  />
                </View>
                <View>
                  <Text className="text-lg font-bold text-surface-900 dark:text-white">
                    {user?.Nombre}
                  </Text>
                  <Text className="text-xs text-surface-500 dark:text-surface-400">
                    ID: {user?.Id_Usuario} · {user?.Permisos}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Sección: Cuenta */}
        <View className="px-5 mt-6">
          <Text className="text-sm font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3">
            Cuenta
          </Text>

          <Card
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.colors.outline,
              overflow: "hidden",
            }}
          >
            {/* Cambiar nombre */}
            <List.Item
              title="Cambiar nombre"
              description="Modifica tu nombre de usuario"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="account-edit"
                  color={theme.colors.primary}
                />
              )}
              right={(props) => (
                <List.Icon
                  {...props}
                  icon={showNombreForm ? "chevron-up" : "chevron-down"}
                />
              )}
              onPress={() => {
                setShowNombreForm(!showNombreForm);
                setNombreError("");
                setNombreSuccess(false);
              }}
            />

            {showNombreForm && (
              <View className="px-4 pb-4">
                <TextInput
                  label="Nuevo nombre"
                  value={nuevoNombre}
                  onChangeText={(t) => {
                    setNuevoNombre(t);
                    setNombreError("");
                  }}
                  mode="outlined"
                  dense
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                  className="mb-2"
                />
                {nombreError ? (
                  <Text className="text-red-500 text-xs mb-2">{nombreError}</Text>
                ) : null}
                {nombreSuccess ? (
                  <Text className="text-teal-600 text-xs mb-2">
                    ¡Nombre cambiado correctamente!
                  </Text>
                ) : null}
                <Button
                  mode="contained"
                  onPress={handleCambiarNombre}
                  loading={nombreLoading}
                  disabled={nombreLoading}
                  buttonColor={theme.colors.primary}
                  textColor="#fff"
                  style={{ borderRadius: 12 }}
                >
                  Guardar nombre
                </Button>
              </View>
            )}

            <Divider />

            {/* Cambiar contraseña */}
            <List.Item
              title="Cambiar contraseña"
              description="Actualiza tu contraseña"
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="lock-reset"
                  color={theme.colors.primary}
                />
              )}
              right={(props) => (
                <List.Icon
                  {...props}
                  icon={showPasswordForm ? "chevron-up" : "chevron-down"}
                />
              )}
              onPress={() => {
                setShowPasswordForm(!showPasswordForm);
                setPasswordError("");
                setPasswordSuccess(false);
              }}
            />

            {showPasswordForm && (
              <View className="px-4 pb-4">
                <TextInput
                  label="Contraseña actual"
                  value={passwordActual}
                  onChangeText={(t) => {
                    setPasswordActual(t);
                    setPasswordError("");
                  }}
                  mode="outlined"
                  dense
                  secureTextEntry={!showPassActual}
                  right={
                    <TextInput.Icon
                      icon={showPassActual ? "eye-off" : "eye"}
                      onPress={() => setShowPassActual(!showPassActual)}
                    />
                  }
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                  className="mb-3"
                />
                <TextInput
                  label="Nueva contraseña"
                  value={nuevaPassword}
                  onChangeText={(t) => {
                    setNuevaPassword(t);
                    setPasswordError("");
                  }}
                  mode="outlined"
                  dense
                  secureTextEntry={!showPassNueva}
                  right={
                    <TextInput.Icon
                      icon={showPassNueva ? "eye-off" : "eye"}
                      onPress={() => setShowPassNueva(!showPassNueva)}
                    />
                  }
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                  className="mb-3"
                />
                <TextInput
                  label="Confirmar nueva contraseña"
                  value={confirmarPassword}
                  onChangeText={(t) => {
                    setConfirmarPassword(t);
                    setPasswordError("");
                  }}
                  mode="outlined"
                  dense
                  secureTextEntry={!showPassConfirm}
                  right={
                    <TextInput.Icon
                      icon={showPassConfirm ? "eye-off" : "eye"}
                      onPress={() => setShowPassConfirm(!showPassConfirm)}
                    />
                  }
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                  className="mb-2"
                />
                {passwordError ? (
                  <Text className="text-red-500 text-xs mb-2">
                    {passwordError}
                  </Text>
                ) : null}
                {passwordSuccess ? (
                  <Text className="text-teal-600 text-xs mb-2">
                    ¡Contraseña cambiada correctamente!
                  </Text>
                ) : null}
                <Button
                  mode="contained"
                  onPress={handleCambiarPassword}
                  loading={passwordLoading}
                  disabled={passwordLoading}
                  buttonColor={theme.colors.primary}
                  textColor="#fff"
                  style={{ borderRadius: 12 }}
                >
                  Actualizar contraseña
                </Button>
              </View>
            )}
          </Card>
        </View>

        {/* Sección: Zona peligrosa */}
        <View className="px-5 mt-6">
          <Text className="text-sm font-bold text-red-500 uppercase tracking-wider mb-3">
            Zona peligrosa
          </Text>

          <Card
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: "#fca5a5",
            }}
          >
            <Card.Content className="py-4 px-4">
              <View className="flex-row items-center mb-3">
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={20}
                  color="#ef4444"
                />
                <Text className="text-sm font-semibold text-surface-900 dark:text-white ml-2">
                  Borrar cuenta
                </Text>
              </View>
              <Text className="text-xs text-surface-500 dark:text-surface-400 mb-4">
                Esta acción es permanente. Se eliminarán todos tus datos,
                historial de reciclaje y tu cuenta. No se podrá deshacer.
              </Text>
              <Button
                mode="contained"
                onPress={() => setShowDeleteDialog(true)}
                buttonColor="#ef4444"
                textColor="#fff"
                icon="delete"
                style={{ borderRadius: 12 }}
              >
                Borrar mi cuenta
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* Cerrar sesión */}
        <View className="px-5 mt-6">
          <Button
            mode="outlined"
            onPress={logout}
            icon="logout"
            textColor={theme.colors.onSurfaceVariant}
            style={{
              borderColor: theme.colors.outline,
              borderRadius: 12,
            }}
            contentStyle={{ paddingVertical: 4 }}
          >
            Cerrar sesión
          </Button>
        </View>
      </ScrollView>

      {/* Dialog de confirmación para borrar */}
      <Portal>
        <Dialog
          visible={showDeleteDialog}
          onDismiss={() => setShowDeleteDialog(false)}
          style={{ borderRadius: 20 }}
        >
          <Dialog.Icon icon="alert" color="#ef4444" size={32} />
          <Dialog.Title style={{ textAlign: "center" }}>
            ¿Estás seguro?
          </Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{ textAlign: "center" }}>
              Esta acción eliminará permanentemente tu cuenta y todos tus datos
              asociados. No se puede deshacer.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowDeleteDialog(false)}
              textColor={theme.colors.onSurfaceVariant}
            >
              Cancelar
            </Button>
            <Button
              onPress={handleBorrarCuenta}
              loading={deleteLoading}
              textColor="#ef4444"
            >
              Sí, borrar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}
