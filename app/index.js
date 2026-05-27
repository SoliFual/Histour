import { AbrilFatface_400Regular, useFonts } from '@expo-google-fonts/abril-fatface';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const [fontsLoaded] = useFonts({
    AbrilFatface_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Espera 2 segundos y luego va a la pantalla de idioma
      const timer = setTimeout(() => {
        router.replace('/language');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.titulo}>HISTOUR</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4E97D1',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  logo: {
    width: 220,
    height: 220,
  },
  titulo: {
    fontFamily: 'AbrilFatface_400Regular',
    fontSize: 52,
    color: '#FFFFFF',
    letterSpacing: 4,
  },
});