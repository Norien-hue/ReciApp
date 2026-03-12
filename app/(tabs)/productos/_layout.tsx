import { Stack } from 'expo-router';

export default function ProductosLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#16a34a' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}>
      <Stack.Screen name="index" options={{ title: 'Productos Reciclables' }} />
      <Stack.Screen name="[barcode]" options={{ title: 'Detalle del Producto' }} />
    </Stack>
  );
}
