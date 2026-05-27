import { router } from 'expo-router';
import React, { useState } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// 👇 Importamos el gancho del traductor
import { useTranslation } from 'react-i18next';

export default function LanguageScreen() {
  
  // Activamos el traductor
  const { t, i18n } = useTranslation();
  
  // Guardamos el idioma seleccionado (inicia con el que el motor tenga activo)
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'es');
  
  // 👇 ESTA ES LA FUNCIÓN CLAVE 👇
  const cambiarIdioma = (lang: string) => {
    setSelectedLanguage(lang); // Pinta el circulito azul
    i18n.changeLanguage(lang); // Traduce toda la aplicación al instante
  };

  const handleContinue = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/intro');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/agave-background.png')} 
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.card}>
        {/* Usamos el traductor para el título */}
        <Text style={styles.title}>{t('language.title')}</Text>

        {/* Opción: English */}
        <TouchableOpacity 
          style={styles.optionContainer} 
          onPress={() => cambiarIdioma('en')} // Conectado al traductor
        >
          <View style={styles.radioCircle}>
            {selectedLanguage === 'en' && <View style={styles.selectedRb} />}
          </View>
          <Text style={styles.optionText}>English</Text>
        </TouchableOpacity>

        {/* Opción: Español */}
        <TouchableOpacity 
          style={styles.optionContainer} 
          onPress={() => cambiarIdioma('es')} // Conectado al traductor
        >
          <View style={styles.radioCircle}>
            {selectedLanguage === 'es' && <View style={styles.selectedRb} />}
          </View>
          <Text style={styles.optionText}>Español</Text>
        </TouchableOpacity>

        {/* Botón Continuar (También usa el traductor) */}
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>
            {t('language.continue')}
          </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
    width: '80%',
    alignItems: 'flex-start',
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
    fontFamily: 'Lato', 
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