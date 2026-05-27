import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 1. IMPORTAMOS IMAGE PICKER PARA GESTIONAR LOS PERMISOS REALES
import * as ImagePicker from 'expo-image-picker';

export default function PermissionsScreen() {
  const { t } = useTranslation();
  
  // Estado para evitar que la pantalla parpadee mientras revisamos los permisos en silencio
  const [revisando, setRevisando] = useState(true);

  // 2. REVISIÓN SILENCIOSA AL ABRIR LA PANTALLA
  useEffect(() => {
    const verificarPermisosPrevios = async () => {
      // Preguntamos el estatus actual sin mostrar ninguna alerta al usuario
      const { status } = await ImagePicker.getCameraPermissionsAsync();
      
      if (status === 'granted') {
        // Si ya nos dio permiso antes, lo mandamos a la siguiente pantalla inmediatamente
        router.replace('/intro'); 
      } else {
        // Si no tiene permiso, apagamos la carga y mostramos tu diseño
        setRevisando(false);
      }
    };

    verificarPermisosPrevios();
  }, []);

  // 3. FUNCIÓN PARA CUANDO EL USUARIO PRESIONA "PERMITIR" EN TU DISEÑO
  const handlePermitir = async () => {
    // Aquí detonamos la alerta oficial del celular (Android/iOS)
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status === 'granted') {
      // Si aceptó en la alerta del celular, avanzamos
      router.replace('/intro'); 
    } else {
      // Si rechazó en la alerta del celular, también avanzamos (la cámara en home le avisará después)
      router.replace('/intro'); 
    }
  };

  // Función para cuando el usuario rechaza el permiso desde tu diseño
  const handleDenegar = () => {
    router.replace('/intro'); 
  };

  // Si estamos haciendo la revisión silenciosa, mostramos una pantalla de carga sutil
  if (revisando) {
    return (
      <ImageBackground source={require('../assets/images/agave-background.png')} style={styles.background} resizeMode="cover">
        <ActivityIndicator size="large" color="#4E97D1" />
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/images/agave-background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Este View simula el cuadrito de alerta que muestran los celulares Android */}
      <View style={styles.alertBox}>
        
        {/* Un pequeño icono representativo */}
        <View style={styles.iconContainer}>
          <Ionicons name="camera-outline" size={40} color="#4E97D1" />
        </View>

        {/* Texto de la alerta conectado al traductor */}
        <Text style={styles.text}>
          {t('permissions.prompt')}
        </Text>

        {/* Contenedor de los botones */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handlePermitir}>
            <Text style={styles.allowText}>{t('permissions.allow')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleDenegar}>
            <Text style={styles.denyText}>{t('permissions.deny')}</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ImageBackground>
  );
}

// El "maquillaje" de la pantalla
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    backgroundColor: 'white',
    width: '75%', 
    padding: 24,
    borderRadius: 8, 
    alignItems: 'center',
    elevation: 10, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  iconContainer: {
    marginBottom: 15,
  },
  icon: {
    fontSize: 24,
  },
  text: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24, 
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  allowText: {
    color: '#4E97D1', 
    fontWeight: 'bold',
    fontSize: 16,
  },
  denyText: {
    color: '#4E97D1',
    fontWeight: 'bold',
    fontSize: 16,
  }
});