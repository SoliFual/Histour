import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';

export default function ReadingModeScreen() {
  const { colors, theme } = useTheme();
  
  // Atrapamos la información del sitio
  const { title, image, legends, fullText } = useLocalSearchParams();

  // Estados interactivos para el botón de me gusta y las estrellas
  // 👇 Usamos el contexto global 👇
  const { isFavorite, toggleFavorite } = useFavorites();
  
  // Verificamos si este lugar específico está en la lista
  const isCurrentFavorite = isFavorite(title as string);
  const [rating, setRating] = useState(0);
  // 👇 Función que simula el envío a la base de datos 👇
  const enviarCalificacion = () => {
    if (rating === 0) {
      alert("Por favor, selecciona al menos una estrella para calificar.");
      return;
    }

    // AQUÍ IRÁ TU CÓDIGO DE BASE DE DATOS EN EL FUTURO. 
    // Ejemplo: supabase.from('calificaciones').insert({ sitio: title, estrellas: rating })
    
    alert(`¡Calificación de ${rating} estrellas enviada a la base de datos! \n\nEl sistema promediará esto y actualizará la etiqueta del sitio.`);
    
    // Opcional: regresar las estrellas a 0 después de calificar
    // setRating(0); 
  };

  // Paleta de colores exacta de tu PDF
  const COLOR_LIGHT_BLUE = '#4E97D1';
  const COLOR_DARK_BLUE = '#2260A3';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* 1. CABECERA */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerLeft}>
          <Ionicons name="arrow-back" size={28} color={COLOR_LIGHT_BLUE} />
          <Text style={[styles.headerTitle, { color: COLOR_LIGHT_BLUE }]}>Modo Lectura</Text>
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
        
        {/* 2. IMAGEN PRINCIPAL CON BORDE OSCURO */}
        <View style={[styles.imageContainer, { borderColor: COLOR_DARK_BLUE }]}>
          <Image source={{ uri: image as string }} style={styles.image} />
        </View>

        {/* 3. CAJA DE LEYENDAS (Azul Claro) */}
        <View style={[styles.boxLight, { backgroundColor: COLOR_LIGHT_BLUE }]}>
          <Text style={styles.boxText}>{legends}</Text>
        </View>

        {/* 4. CAJA DE TEXTO PRINCIPAL (Azul Oscuro) */}
        <View style={[styles.boxDark, { backgroundColor: COLOR_DARK_BLUE }]}>
          <Text style={styles.boxText}>{fullText}</Text>
        </View>

       {/* 5. BOTÓN: MOSTRAR LÍNEA DEL TIEMPO */}
        <TouchableOpacity 
          style={[styles.timelineButton, { borderColor: COLOR_LIGHT_BLUE }]}
          onPress={() => router.push({
            pathname: '/timeline',
            params: {
              title: title, // Le pasamos el nombre del lugar
              // Simulamos la imagen de la línea de tiempo que luego vendrá de tu BD
              timelineImage: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?q=80&w=600&auto=format&fit=crop'
            }
          })}
        >
          <Text style={[styles.timelineText, { color: COLOR_LIGHT_BLUE }]}>Mostrar linea del tiempo</Text>
        </TouchableOpacity>

        {/* 6. SECCIÓN DE CALIFICACIÓN */}
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
            // 👇 Conectamos el botón con la función que creamos 👇
            onPress={enviarCalificacion}
          >
            <Text style={[styles.rateText, { color: COLOR_LIGHT_BLUE }]}>Calificar</Text>
          </TouchableOpacity>
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
  imageContainer: {
    width: '100%',
    height: 200,
    borderWidth: 6,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  boxLight: {
    padding: 15,
    marginBottom: 20,
    borderRadius: 4,
  },
  boxDark: {
    padding: 20,
    marginBottom: 25,
    borderRadius: 4,
  },
  boxText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'serif',
    lineHeight: 24,
    textAlign: 'justify',
  },
  timelineButton: {
    width: '100%',
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 25,
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