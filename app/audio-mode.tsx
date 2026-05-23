import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
// 1. Importamos el traductor
import { useTranslation } from 'react-i18next';

export default function AudioModeScreen() {
  const { colors } = useTheme();
  
  // Atrapamos la información del sitio
  const { title, image, image2 } = useLocalSearchParams();

  // 2. Activamos el traductor
  const { t } = useTranslation();

  // Estados interactivos
  // Usamos el contexto global
  const { isFavorite, toggleFavorite } = useFavorites();
  
  // Verificamos si este lugar específico está en la lista
  const isCurrentFavorite = isFavorite(title as string);
  const [rating, setRating] = useState(0);

  // Función que simula el envío a la base de datos
  const enviarCalificacion = () => {
    if (rating === 0) {
      alert(t('audioMode.alerts.emptyRating'));
      return;
    }

    // AQUÍ IRÁ TU CÓDIGO DE BASE DE DATOS EN EL FUTURO. 
    // Inyectamos la calificación en el texto traducido
    alert(t('audioMode.alerts.successRating', { rating }));
    
    // Opcional: regresar las estrellas a 0 después de calificar
    // setRating(0); 
  };
  const [isPlaying, setIsPlaying] = useState(false); // Controla el botón de Play/Pausa

  // Paleta de colores exacta de tu PDF
  const COLOR_LIGHT_BLUE = '#4E97D1';
  const COLOR_DARK_BLUE = '#2260A3';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* 1. CABECERA */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerLeft}>
          <Ionicons name="arrow-back" size={28} color={COLOR_LIGHT_BLUE} />
          <Text style={[styles.headerTitle, { color: COLOR_LIGHT_BLUE }]}>{t('audioMode.title')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => toggleFavorite({ title, image })}>
          <Ionicons 
            name={isCurrentFavorite ? "heart" : "heart-outline"} 
            size={35} 
            color={COLOR_DARK_BLUE} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 2. REPRODUCTOR DE AUDIO (Caja Azul Oscuro) */}
        <View style={[styles.audioBox, { backgroundColor: COLOR_DARK_BLUE }]}>
          <View style={styles.audioTopRow}>
            {/* Inyectamos el nombre del sitio en el reproductor */}
            <Text style={styles.audioTitle} numberOfLines={1}>
              {t('audioMode.audioTitle', { title })}
            </Text>
            
            <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)} style={styles.playButtonWrapper}>
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={22} 
                color={COLOR_DARK_BLUE} 
              />
            </TouchableOpacity>
          </View>
          
          {/* Barra de progreso visual simulada */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: isPlaying ? '60%' : '10%' }]} />
            <View style={[styles.progressDot, { left: isPlaying ? '60%' : '10%' }]} />
          </View>
        </View>

        {/* 3. GALERÍA DE IMÁGENES (Marcos Azul Claro) */}
        <View style={[styles.imageContainer, { borderColor: COLOR_LIGHT_BLUE }]}>
          <Image source={{ uri: image as string }} style={styles.image} />
        </View>

        <View style={[styles.imageContainer, { borderColor: COLOR_LIGHT_BLUE }]}>
          {/* Si no mandan image2, repetimos la primera para evitar errores */}
          <Image source={{ uri: (image2 || image) as string }} style={styles.image} />
        </View>

        {/* 4. BOTÓN: MOSTRAR LÍNEA DEL TIEMPO */}
        <TouchableOpacity 
          style={[styles.timelineButton, { borderColor: COLOR_LIGHT_BLUE }]}
          onPress={() => router.push({
            pathname: '/timeline',
            params: {
              title: title, 
              timelineImage: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?q=80&w=600&auto=format&fit=crop'
            }
          })}
        >
          <Text style={[styles.timelineText, { color: COLOR_LIGHT_BLUE }]}>{t('audioMode.buttons.timeline')}</Text>
        </TouchableOpacity>

        {/* 5. SECCIÓN DE CALIFICACIÓN */}
        <View style={styles.ratingSection}>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons 
                  name={star <= rating ? "star" : "star-outline"} 
                  size={32} 
                  color={COLOR_DARK_BLUE} 
                  style={styles.starIcon}
                />
              </TouchableOpacity>
            ))}
          </View>

         <TouchableOpacity 
            style={[styles.rateButton, { borderColor: COLOR_LIGHT_BLUE }]}
            onPress={enviarCalificacion}
          >
            <Text style={[styles.rateText, { color: COLOR_LIGHT_BLUE }]}>{t('audioMode.buttons.rate')}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingTop: 40, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontFamily: 'serif',
    marginLeft: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  
  /* ESTILOS DEL REPRODUCTOR DE AUDIO */
  audioBox: {
    padding: 20,
    borderRadius: 8,
    marginBottom: 25,
  },
  audioTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  audioTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'serif',
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  playButtonWrapper: {
    backgroundColor: '#FFFFFF',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2, 
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  progressDot: {
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    position: 'absolute',
    marginLeft: -6, 
  },

  /* ESTILOS DE IMÁGENES */
  imageContainer: {
    width: '100%',
    height: 180,
    borderWidth: 6,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  /* ESTILOS BOTONES INFERIORES */
  timelineButton: {
    width: '100%',
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 5,
  },
  timelineText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  ratingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    marginRight: 5,
  },
  rateButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderRadius: 20,
  },
  rateText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'serif',
  }
});