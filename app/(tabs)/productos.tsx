// ============================================================
// app/(tabs)/productos.tsx
// ============================================================
// Pantalla de productos: lista todos los productos de la BD
// con filtrado por material
// ============================================================

import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import {
  Card,
  Searchbar,
  Chip,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { getProductos } from "../../services/database";
import { MATERIAL_COLORS, CONTENEDOR_MAP } from "../../constants/config";

interface Producto {
  Tipo: string;
  Numero_barras: number;
  Nombre: string;
  Emisiones_Reducibles: number;
  Material: string;
  Imagen: string | null;
}

const MATERIALES = ["Todos", "PET", "Vidrio", "Aluminio", "Plástico", "Brick"];

export default function ProductosScreen() {
  const { token } = useAuthStore();
  const theme = useTheme();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [materialFilter, setMaterialFilter] = useState("Todos");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProductos = useCallback(async () => {
    if (!token) return;
    try {
      const res = await getProductos(token);
      if (res.success && res.productos) {
        setProductos(res.productos);
      }
    } catch (e) {
      console.error("Error cargando productos:", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  useEffect(() => {
    let filtered = productos;
    if (materialFilter !== "Todos") {
      filtered = filtered.filter((p) => p.Material === materialFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.Nombre.toLowerCase().includes(q) ||
          String(p.Numero_barras).includes(q)
      );
    }
    setFilteredProductos(filtered);
  }, [productos, materialFilter, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProductos();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-50 dark:bg-surface-900">
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-surface-900 dark:text-white">
          Productos
        </Text>
        <Text className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          {productos.length} productos registrados
        </Text>
      </View>

      {/* Buscador */}
      <View className="px-5 mt-2">
        <Searchbar
          placeholder="Buscar por nombre o código..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 14,
            elevation: 0,
          }}
          inputStyle={{ fontSize: 14 }}
        />
      </View>

      {/* Filtros de material */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-3 pl-5"
        contentContainerStyle={{ paddingRight: 20, gap: 8 }}
      >
        {MATERIALES.map((mat) => {
          const isActive = materialFilter === mat;
          const color = mat === "Todos" ? theme.colors.primary : (MATERIAL_COLORS[mat] || "#64748b");
          return (
            <Chip
              key={mat}
              selected={isActive}
              onPress={() => setMaterialFilter(mat)}
              style={{
                backgroundColor: isActive ? color + "20" : theme.colors.surfaceVariant,
                borderWidth: isActive ? 1.5 : 0,
                borderColor: isActive ? color : "transparent",
              }}
              textStyle={{
                color: isActive ? color : theme.colors.onSurfaceVariant,
                fontWeight: isActive ? "700" : "500",
                fontSize: 12,
              }}
            >
              {mat}
            </Chip>
          );
        })}
      </ScrollView>

      {/* Lista de productos */}
      <ScrollView
        className="flex-1 px-5 mt-3"
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View className="items-center py-12">
            <Text className="text-surface-500">Cargando productos...</Text>
          </View>
        ) : filteredProductos.length === 0 ? (
          <View className="items-center py-12">
            <MaterialCommunityIcons
              name="magnify-close"
              size={48}
              color={theme.colors.onSurfaceVariant}
            />
            <Text className="text-surface-500 dark:text-surface-400 mt-3 text-center">
              No se encontraron productos
            </Text>
          </View>
        ) : (
          filteredProductos.map((producto, index) => {
            const matColor = MATERIAL_COLORS[producto.Material] || "#94a3b8";
            const contenedor = CONTENEDOR_MAP[producto.Material];
            return (
              <Card
                key={`${producto.Tipo}-${producto.Numero_barras}`}
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: 16,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: theme.colors.outline,
                }}
              >
                <Card.Content className="py-3 px-4">
                  <View className="flex-row items-start">
                    <View
                      className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                      style={{ backgroundColor: matColor + "18" }}
                    >
                      <MaterialCommunityIcons
                        name="package-variant"
                        size={24}
                        color={matColor}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-sm font-bold text-surface-900 dark:text-white"
                        numberOfLines={2}
                      >
                        {producto.Nombre}
                      </Text>
                      <View className="flex-row items-center mt-1 gap-2">
                        <Chip
                          compact
                          textStyle={{
                            fontSize: 9,
                            color: matColor,
                            fontWeight: "700",
                          }}
                          style={{
                            height: 22,
                            backgroundColor: matColor + "15",
                          }}
                        >
                          {producto.Material}
                        </Chip>
                        {contenedor && (
                          <Text className="text-xs text-surface-500 dark:text-surface-400">
                            Contenedor{" "}
                            <Text style={{ color: contenedor.color, fontWeight: "700" }}>
                              {contenedor.nombre}
                            </Text>
                          </Text>
                        )}
                      </View>
                      <View className="flex-row items-center justify-between mt-2">
                        <Text className="text-xs text-surface-400">
                          <MaterialCommunityIcons
                            name="barcode"
                            size={11}
                            color={theme.colors.onSurfaceVariant}
                          />{" "}
                          {String(producto.Numero_barras)}
                        </Text>
                        <View className="flex-row items-center">
                          <MaterialCommunityIcons
                            name="leaf"
                            size={12}
                            color="#0d9488"
                          />
                          <Text className="text-xs font-bold text-teal-600 dark:text-teal-400 ml-1">
                            {producto.Emisiones_Reducibles} kg CO₂
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
