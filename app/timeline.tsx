import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
// 1. Importamos el gancho (hook) de traducción
import { useTranslation } from 'react-i18next';

export default function TimelineScreen() {
  const { colors } = useTheme();
  
  // 2. Activamos el traductor
  const { t } = useTranslation();
  
  // Atrapamos el título y la imagen de la línea del tiempo
  const { title, timelineImage } = useLocalSearchParams();

  // Color extraído de tu PDF
  const COLOR_LIGHT_BLUE = '#4E97D1';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* CABECERA (Idéntica al PDF) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerLeft}>
          <Ionicons name="arrow-back" size={28} color={COLOR_LIGHT_BLUE} />
          {/* 3. Reemplazamos el texto fijo por el diccionario */}
          <Text style={[styles.headerTitle, { color: COLOR_LIGHT_BLUE }]}>{t('timeline.title')}</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENIDO SCROLLEABLE */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Título opcional para saber de qué lugar es la línea del tiempo */}
        <Text style={[styles.siteTitle, { color: COLOR_LIGHT_BLUE }]}>
          {title}
        </Text>

        {/* CONTENEDOR DE LA IMAGEN DE LA BD */}
        <View style={styles.imageWrapper}>
          <Image 
            source={{ uri: timelineImage as string }} 
            style={styles.image} 
            resizeMode="contain" 
          />
        </View>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingTop: 40, // Espacio para la barra de estado
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'serif', // Simulando Bree Serif
    marginLeft: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  siteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageWrapper: {
    width: '100%',
    // Ya no hay límite de altura
  },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 0.5, // 👈 Pista para que React Native sepa que es una infografía vertical
  }
});