import { Stack } from 'expo-router';
import { FavoritesProvider } from '../context/FavoritesContext';
import { ThemeProvider } from '../context/ThemeContext';
import '../i18n'; // Esto enciende el traductor al abrir la app

export default function RootLayout() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="language" />
          <Stack.Screen name="permissions" />
          <Stack.Screen name="intro" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="recover" />
          <Stack.Screen name="edit-profile" /> {/* <-- ¡AQUÍ ESTÁ LA NUEVA PANTALLA! */}
          <Stack.Screen name="about" /> 
          <Stack.Screen name="privacy-policy" />
          <Stack.Screen name="add-site" />
          <Stack.Screen name="search-site" options={{ headerShown: false }} />
          <Stack.Screen name="category-museos" options={{ headerShown: false }} />
          <Stack.Screen name="category-iglesias" options={{ headerShown: false }} />
          <Stack.Screen name="category-monumentos" options={{ headerShown: false }} />
          <Stack.Screen name="category-otros" options={{ headerShown: false }} />
          <Stack.Screen name="site-details" options={{ headerShown: false }} />
          <Stack.Screen name="reading-mode" options={{ headerShown: false }} />
          <Stack.Screen name="audio-mode" options={{ headerShown: false }} />
          <Stack.Screen name="timeline" options={{ headerShown: false }} />
          <Stack.Screen name="camera" options={{ headerShown: false }} />
          <Stack.Screen name="admin-dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </FavoritesProvider>
    </ThemeProvider>
  );
}