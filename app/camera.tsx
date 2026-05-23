import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// 1. Importamos el traductor
import { useTranslation } from 'react-i18next';

export default function CameraPlaceholderScreen() {
  // 2. Activamos el traductor
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      
      {/* BOTÓN PARA CERRAR LA CÁMARA */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="close" size={36} color="#FFFFFF" />
      </TouchableOpacity>

      {/* MARCO DEL ESCÁNER SIMULADO */}
      <View style={styles.scannerFrame}>
        {/* Esquinas del escáner */}
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>

      {/* TEXTO INFORMATIVO PARA LA ETAPA 1 */}
      <View style={styles.textContainer}>
        <Ionicons name="scan-outline" size={48} color="#4E97D1" style={styles.icon} />
        <Text style={styles.title}>{t('camera.title')}</Text>
        <Text style={styles.description}>
          {t('camera.subtitle')}
          {'\n\n'}
          {t('camera.description')}
        </Text>
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Fondo muy oscuro simulando la cámara
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  scannerFrame: {
    width: 260,
    height: 260,
    position: 'relative',
    marginBottom: 50,
  },
  corner: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderColor: '#4E97D1', 
  },
  topLeft: { 
    top: 0, left: 0, 
    borderTopWidth: 5, borderLeftWidth: 5,
    borderTopLeftRadius: 15,
  },
  topRight: { 
    top: 0, right: 0, 
    borderTopWidth: 5, borderRightWidth: 5,
    borderTopRightRadius: 15,
  },
  bottomLeft: { 
    bottom: 0, left: 0, 
    borderBottomWidth: 5, borderLeftWidth: 5,
    borderBottomLeftRadius: 15,
  },
  bottomRight: { 
    bottom: 0, right: 0, 
    borderBottomWidth: 5, borderRightWidth: 5,
    borderBottomRightRadius: 15,
  },
  textContainer: {
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 15,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    color: '#A0A0A0',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  }
});