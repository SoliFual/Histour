import { router } from 'expo-router';
import React, { useState } from 'react'; // <-- Se agregó useState aquí
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LanguageScreen() {
  
  // 👇 AQUÍ ESTÁ LA MEMORIA QUE FALTABA 👇
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  
  const handleContinue = () => {
    if (router.canGoBack()) {
      // Si venías navegando desde el Perfil, te regresa al Perfil
      router.back();
    } else {
      // Si estás abriendo la app por primera vez, te manda a la pantalla de permisos
      router.replace('/permissions');
    }
  };

  return (
    // ImageBackground pone la foto del paisaje de Jalisco de fondo
    <ImageBackground
      // ¡IMPORTANTE!: Asegúrate de tener una imagen llamada 'paisaje.jpg' en tu carpeta assets/images/
      source={require('../assets/images/agave-background.png')} 
      style={styles.background}
      resizeMode="cover"
    >
      {/* View es como una "caja". Esta caja es el recuadro blanco del centro */}
      <View style={styles.card}>
        <Text style={styles.title}>Select language</Text>

        {/* Opción: English */}
        <TouchableOpacity 
          style={styles.optionContainer} 
          onPress={() => setSelectedLanguage('en')}
        >
          <View style={styles.radioCircle}>
            {/* Si el idioma seleccionado es 'en', mostramos el circulito relleno */}
            {selectedLanguage === 'en' && <View style={styles.selectedRb} />}
          </View>
          <Text style={styles.optionText}>English</Text>
        </TouchableOpacity>

        {/* Opción: Español */}
        <TouchableOpacity 
          style={styles.optionContainer} 
          onPress={() => setSelectedLanguage('es')}
        >
          <View style={styles.radioCircle}>
            {/* Si el idioma seleccionado es 'es', mostramos el circulito relleno */}
            {selectedLanguage === 'es' && <View style={styles.selectedRb} />}
          </View>
          <Text style={styles.optionText}>Español</Text>
        </TouchableOpacity>

        {/* Botón para avanzar a la siguiente pantalla */}
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>
            {selectedLanguage === 'es' ? 'Continuar' : 'Continue'}
          </Text>
        </TouchableOpacity>

      </View>
    </ImageBackground>
  );
}

// Aquí está el "CSS" de la pantalla, el maquillaje para que se vea como en tu diseño
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',     
    height: '100%',    
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
    width: '80%',
    alignItems: 'flex-start',
    // Sombras para que el cuadro blanco resalte sobre el fondo
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    color: '#47525E',
    fontFamily: 'Lato', // Asegúrate de cargar esta fuente si la necesitas exacta
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  radioCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4E97D1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectedRb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4E97D1',
  },
  optionText: {
    fontSize: 16,
    color: '#47525E',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#4E97D1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});