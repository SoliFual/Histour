import { router } from 'expo-router';
import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function IntroScreen() {
  
  const handleIngresar = () => {
    // Le agregamos "/index" al final para que vaya directo al archivo del Login
   router.replace('/login'); //
  };

  return (
    // Reemplazamos el View principal por el ImageBackground
    <ImageBackground
      source={require('../assets/images/viaje.png')} 
      style={styles.background}
      resizeMode="cover" // Esto asegura que la imagen se estire por toda la pantalla
    >
      
      {/* Sección de textos y botón flotando sobre el fondo */}
      <View style={styles.textSection}>
        <Text style={styles.title}>HISTOUR</Text>
        <Text style={styles.subtitle}>App de historia y turismo</Text>
        <Text style={styles.description}>
          Porque viajar no es solo llegar a un lugar, es entender la historia que tiene que contarnos.
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={handleIngresar}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>
      </View>

    </ImageBackground>
  );
}

// El maquillaje actualizado
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  textSection: {
    paddingHorizontal: 40,
    alignItems: 'flex-start',
    marginTop: 40,// Empujamos el texto hacia abajo para que no pegue con el borde superior
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