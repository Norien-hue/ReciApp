// ============================================================
// app/(tabs)/index.tsx
// ============================================================
// Pantalla principal: muestra emisiones reducidas, TAP,
// historial de reciclaje y estadísticas del usuario
// ============================================================

import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import { Card, Button, Chip, Divider, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import {
  getUsuario,
  getReciclajeUsuario,
} from "../../services/database";
import { MATERIAL_COLORS } from "../../constants/config";

interface ReciclajeItem {
  Nombre: string;
  Material: string;
  Emisiones_Reducibles: number;
  Fecha: string;
  Hora: string;
}

export default function HomeScreen() {
  const { user, token, updateUser } = useAuthStore();
  const theme = useTheme();
  const [reciclajes, setReciclajes] = useState<ReciclajeItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showTAP, setShowTAP] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user || !token) return;
    try {
      const [userRes, reciclajeRes] = await Promise.all([
        getUsuario(user.Id_Usuario, token),
        getReciclajeUsuario(user.Id_Usuario, token),
      ]);
      if (userRes.success && userRes.user) {
        updateUser(userRes.user);
      }
      if (reciclajeRes.success && reciclajeRes.reciclajes) {
        setReciclajes(reciclajeRes.reciclajes);
      }
    } catch (e) {
      console.error("Error cargando datos:", e);
    }
  }, [user, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const totalEmisiones = user?.Emisiones_Reducidas ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-surface-50 dark:bg-surface-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-surface-500 dark:text-surface-400 text-sm">
            Hola de nuevo,
          </Text>
          <Text className="text-2xl font-bold text-surface-900 dark:text-white">
            {user?.Nombre ?? "Usuario"}
          </Text>
        </View>

        {/* Tarjeta de emisiones */}
        <View className="px-5 mt-3">
          <Card
            style={{
              backgroundColor: "#0d9488",
              borderRadius: 20,
            }}
          >
            <Card.Content className="py-5 px-5">
              <View className="flex-row items-center mb-3">
                <MaterialCommunityIcons
                  name="leaf"
                  size={20}
                  color="#99f6e4"
                />
                <Text className="text-teal-200 text-sm ml-2 font-medium">
                  Emisiones reducidas
                </Text>
              </View>
              <Text className="text-white text-5xl font-bold">
                {totalEmisiones.toFixed(1)}
              </Text>
              <Text className="text-teal-100 text-base mt-1">
                kg CO₂ equivalente
              </Text>

              <Divider
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  marginVertical: 16,
                }}
              />

              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-teal-200 text-xs">
                    Productos reciclados
                  </Text>
                  <Text className="text-white text-xl font-bold">
                    {reciclajes.length}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-teal-200 text-xs">Rol</Text>
                  <Chip
                    textStyle={{ color: "#0d9488", fontSize: 11, fontWeight: "700" }}
                    style={{
                      backgroundColor: "#ccfbf1",
                      height: 28,
                      marginTop: 2,
                    }}
                  >
                    {user?.Permisos === "administrador" ? "Admin" : "Cliente"}
                  </Chip>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* TAP */}
        <View className="px-5 mt-5">
          <Card
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.colors.outline,
            }}
          >
            <Card.Content className="py-4 px-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl items-center justify-center mr-3">
                    <MaterialCommunityIcons
                      name="credit-card-chip"
                      size={22}
                      color="#f59e0b"
                    />
                  </View>
                  <View>
                    <Text className="text-xs text-surface-500 dark:text-surface-400">
                      Tu código TAP
                    </Text>
                    <Text className="text-lg font-bold text-surface-900 dark:text-white">
                      {showTAP
                        ? user?.TAP
                          ? String(user.TAP).padStart(6, "0")
                          : "No asignado"
                        : "••••••"}
                    </Text>
                  </View>
                </View>
                <Button
                  mode="outlined"
                  compact
                  onPress={() => setShowTAP(!showTAP)}
                  textColor={theme.colors.primary}
                  style={{ borderColor: theme.colors.primary, borderRadius: 12 }}
                >
                  {showTAP ? "Ocultar" : "Mostrar"}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Historial de reciclaje */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-surface-900 dark:text-white mb-3">
            Historial reciente
          </Text>

          {reciclajes.length === 0 ? (
            <Card
              style={{
                backgroundColor: theme.colors.surfaceVariant,
                borderRadius: 16,
              }}
            >
              <Card.Content className="py-8 items-center">
                <MaterialCommunityIcons
                  name="recycle-variant"
                  size={48}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text className="text-surface-500 dark:text-surface-400 mt-3 text-center">
                  Aún no has reciclado ningún producto.{"\n"}
                  ¡Escanea tu primer producto!
                </Text>
              </Card.Content>
            </Card>
          ) : (
            reciclajes.map((item, index) => (
              <Pressable key={index}>
                <View
                  className="flex-row items-center py-3 px-1"
                  style={{
                    borderBottomWidth: index < reciclajes.length - 1 ? 0.5 : 0,
                    borderBottomColor: theme.colors.outline,
                  }}
                >
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                    style={{
                      backgroundColor:
                        (MATERIAL_COLORS[item.Material] || "#94a3b8") + "20",
                    }}
                  >
                    <MaterialCommunityIcons
                      name="package-variant"
                      size={20}
                      color={MATERIAL_COLORS[item.Material] || "#94a3b8"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-sm font-semibold text-surface-900 dark:text-white"
                      numberOfLines={1}
                    >
                      {item.Nombre}
                    </Text>
                    <Text className="text-xs text-surface-500 dark:text-surface-400">
                      {item.Fecha} · {item.Hora}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-bold text-teal-600 dark:text-teal-400">
                      -{item.Emisiones_Reducibles} kg
                    </Text>
                    <Chip
                      compact
                      textStyle={{ fontSize: 9, color: MATERIAL_COLORS[item.Material] || "#64748b" }}
                      style={{
                        height: 20,
                        backgroundColor:
                          (MATERIAL_COLORS[item.Material] || "#94a3b8") + "15",
                      }}
                    >
                      {item.Material}
                    </Chip>
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
