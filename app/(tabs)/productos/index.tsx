import { useEffect } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useProductStore } from '@/store/productStore';
import SearchBar from '@/components/SearchBar';
import ProductCard from '@/components/ProductCard';
import EmptyState from '@/components/EmptyState';

export default function ProductosScreen() {
  const router = useRouter();
  const {
    isLoading,
    searchQuery,
    fetchProductos,
    setSearchQuery,
    getFilteredProductos,
  } = useProductStore();

  useEffect(() => {
    fetchProductos();
  }, []);

  const productos = getFilteredProductos();

  return (
    <View className="flex-1 bg-gray-50">
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(item) => `${item.tipo}-${item.numeroBarras}`}
          renderItem={({ item }) => (
            <ProductCard
              producto={item}
              onPress={() =>
                router.push(
                  `/(tabs)/productos/${item.tipo}-${item.numeroBarras}`
                )
              }
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="leaf-outline"
              message="No se encontraron productos"
            />
          }
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
        />
      )}
    </View>
  );
}
