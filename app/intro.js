import { router } from 'expo-router';
import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// 1. Importamos el traductor
import { useTranslation } from 'react-i18next';

export default function IntroScreen() {
  
  // 2. Activamos el traductor
  const { t } = useTranslation();

  const handleIngresar = () => {
    // Le agregamos "/index" al final para que vaya directo al archivo del Login
   router.replace('/login'); 
  };

  return (
    <ImageBackground
      source={require('../assets/images/viaje.png')} 
      style={styles.background}
      resizeMode="cover" 
    >
      
      {/* Sección de textos y botón flotando sobre el fondo */}
      <View style={styles.textSection}>
        {/* El nombre de la app se queda fijo */}
        <Text style={styles.title}>HISTOUR</Text>
        <Text style={styles.subtitle}>{t('intro.subtitle')}</Text>
        <Text style={styles.description}>
          {t('intro.description')}
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={handleIngresar}>
          <Text style={styles.buttonText}>{t('intro.button')}</Text>
        </TouchableOpacity>
      </View>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  textSection: {
    paddingHorizontal: 40,
    alignItems: 'flex-start',
    marginTop: 40,
  },
  title: {
    fontSize: 45,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 22,
    color: 'white',
    marginBottom: 15,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: 'white',
    marginBottom: 30,
    lineHeight: 22,
    opacity: 0.9,
  },
  button: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});