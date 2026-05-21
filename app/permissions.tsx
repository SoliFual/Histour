import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PermissionsScreen() {
  
  // Función para cuando el usuario acepta el permiso
  const handlePermitir = () => {
    // Nota: Más adelante, aquí agregaremos el código real de Expo para encender la cámara de verdad.
    // Por ahora, simularemos que ya nos dio permiso y avanzamos a la pantalla principal.
    router.replace('/intro'); 
  };

  // Función para cuando el usuario rechaza el permiso
  const handleDenegar = () => {
    // Si dice que no, igual lo mandamos al inicio por ahora (aunque sin cámara habilitada)
    router.replace('/intro'); 
  };

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

        <Text style={styles.text}>
          ¿Quieres permitir que Histour haga fotos y grabe videos?
        </Text>

        {/* Contenedor de los botones */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handlePermitir}>
            <Text style={styles.allowText}>PERMITIR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleDenegar}>
            <Text style={styles.denyText}>DENEGAR</Text>
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
    width: '75%', // Un poco más angosto para que parezca alerta del sistema
    padding: 24,
    borderRadius: 8, // Bordes ligeramente redondeados típicos de Android
    alignItems: 'center',
    elevation: 10, // Sombra fuerte
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
    lineHeight: 24, // Para que el texto respire un poco
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
    color: '#4E97D1', // Usamos el azul de Histour
    fontWeight: 'bold',
    fontSize: 16,
  },
  denyText: {
    color: '#4E97D1',
    fontWeight: 'bold',
    fontSize: 16,
  }
});