import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ImageBackground, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext'; // Importar el tema

export default function HomeScreen() {
  const { colors, theme } = useTheme(); // Usar el tema
  const [searchQuery, setSearchQuery] = useState('');

  // 👇 Función SIMULADA para el botón de la cámara (Etapa 1) 👇
  const handleAbrirCamara = () => {
    if (Platform.OS === 'web') {
      alert('La función de escáner está optimizada para la app móvil. Abriendo vista de prueba...');
      router.push('/camera');
      return;
    }

    // Simulamos la petición de permisos de React Native
    Alert.alert(
      'Permiso de Cámara (Simulación)',
      '"Histour" necesita acceder a tu cámara para usar el escáner inteligente de monumentos. ¿Permitir acceso?',
      [
        { 
          text: 'Denegar', 
          style: 'cancel',
          onPress: () => Alert.alert('Permiso denegado', 'Recuerda que puedes habilitarlo más tarde en tu configuración.')
        },
        { 
          text: 'Permitir', 
          onPress: () => router.push('/camera') // Nos lleva a la pantalla oscura de prueba
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      
      {/* 1. HEADER */}
      <View style={styles.headerContainer}>
        <Image source={require('../../assets/images/header_design.png')} style={styles.headerImageBackground} resizeMode="cover" />
        <View style={styles.headerOverlayContent}>
          <View style={styles.logoRow}>
            <Image source={require('../../assets/images/logo.png')} style={styles.headerLogo} resizeMode="contain" />
            <Text style={styles.headerTitle}>HISTOUR</Text>
          </View>
        </View>
      </View>

      {/* 2. BARRA DE BÚSQUEDA (Convertida en botón hacia search-site) */}
      <TouchableOpacity 
        style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.primary }]}
        onPress={() => router.push('/search-site')}
        activeOpacity={0.8}
      >
        <Ionicons name="search-outline" size={20} color={colors.primary} style={styles.searchIcon} />
        <Text style={[styles.searchInput, { color: theme === 'light' ? '#A0A0A0' : '#888888', alignSelf: 'center' }]}>
          Buscar lugar
        </Text>
      </TouchableOpacity>

      {/* 3. RECTÁNGULO AZUL CON BOTÓN DE CÁMARA */}
      <View style={[styles.blueBand, { backgroundColor: colors.primary }]}>
        <TouchableOpacity 
          style={[styles.captureButton, { backgroundColor: colors.card }]}
          onPress={handleAbrirCamara} // 👈 Aquí conectamos la alerta de permisos
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={50} color={colors.primary} />
          <Text style={[styles.captureText, { color: colors.primary }]}>Capturar sitio</Text>
        </TouchableOpacity>
      </View>

      {/* 4. SECCIÓN INFERIOR */}
      <View style={[styles.whiteContentContainer, { backgroundColor: colors.background }]}>
        
        <Text style={styles.sectionTitle}>Categorías</Text>
        <View style={styles.categoriesRow}>
          <TouchableOpacity 
            style={styles.categoryItem}
            onPress={() => router.push('/category-museos')}
          >
            <Image source={require('../../assets/images/cat_museos.png')} style={styles.categoryIconImage} resizeMode="contain" />
            <Text style={[styles.categoryLabel, { color: colors.primary }]}>Museos</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.categoryItem}
            onPress={() => router.push('/category-iglesias')}
          >
            <Image source={require('../../assets/images/cat_iglesias.png')} style={styles.categoryIconImage} resizeMode="contain" />
            <Text style={[styles.categoryLabel, { color: colors.primary }]}>Iglesias</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.categoryItem}
            onPress={() => router.push('/category-monumentos')}
          >
            <Image source={require('../../assets/images/cat_monumentos.png')} style={styles.categoryIconImage} resizeMode="contain" />
            <Text style={[styles.categoryLabel, { color: colors.primary }]}>Monumentos</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.categoryItem}
            onPress={() => router.push('/category-otros')}
          >
            <Image source={require('../../assets/images/cat_mas.png')} style={styles.categoryIconImage} resizeMode="contain" />
            <Text style={[styles.categoryLabel, { color: colors.primary }]}>Otros</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Más visitados</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          <TouchableOpacity 
            style={styles.placeCard}
            onPress={() => router.push({
              pathname: '/site-details',
              params: {
                title: 'La Catedral',
                image: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=400&auto=format&fit=crop', 
                description: 'El monumento religioso y arquitectónico más emblemático de Jalisco, México.'
              }
            })}
            activeOpacity={0.8}
          >
            <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=400&auto=format&fit=crop' }} style={styles.placeImage} imageStyle={{ borderRadius: 10 }}>
              <View style={styles.placeCardOverlay}>
                <View style={[styles.cardRatingContainer, { backgroundColor: colors.card }]}>
                  <Ionicons name="star" size={12} color={colors.primary} />
                  <Text style={[styles.cardRatingText, { color: colors.text }]}>4.8</Text>
                </View>
                <Text style={styles.placeName}>La Catedral</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { width: '100%', height: 190, position: 'relative' },
  headerImageBackground: { width: '100%', height: '100%', position: 'absolute' },
  headerOverlayContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 10 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginTop: -20 },
  headerLogo: { width: 45, height: 45, marginRight: 8 },
  headerTitle: { fontSize: 28, color: '#FFFFFF', fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', marginHorizontal: 25, marginTop: -25, marginBottom: 20, borderRadius: 25, paddingHorizontal: 15, alignItems: 'center', height: 50, borderWidth: 3, elevation: 4 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  blueBand: { width: '100%', paddingVertical: 20, paddingHorizontal: 25 },
  captureButton: { width: '100%', height: 120, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  captureText: { fontSize: 16, fontWeight: 'bold', marginTop: 5 },
  whiteContentContainer: { paddingHorizontal: 20, paddingTop: 30 },
  sectionTitle: { fontSize: 15, color: '#888888', marginBottom: 15, fontWeight: '500' },
  categoriesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35, paddingHorizontal: 5 },
  categoryItem: { alignItems: 'center', width: 70 },
  categoryIconImage: { width: 60, height: 60, marginBottom: 8 },
  categoryLabel: { fontSize: 11, fontWeight: 'bold' },
  horizontalScroll: { flexDirection: 'row', paddingBottom: 25 },
  placeCard: { width: 220, height: 130, marginRight: 15, borderRadius: 10, overflow: 'hidden' },
  placeImage: { width: '100%', height: '100%' },
  placeCardOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.35)', justifyContent: 'space-between', padding: 10 },
  cardRatingContainer: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  cardRatingText: { fontSize: 12, fontWeight: 'bold', marginLeft: 3 },
  placeName: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' }
});