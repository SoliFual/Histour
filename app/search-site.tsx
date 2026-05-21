import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const MOCK_DATA = [
  { id: '1', title: 'La Catedral', category: 'Iglesia', rating: '5.0', image: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=400' },
  { id: '2', title: 'El Hospicio Cabañas', category: 'Museos', rating: '4.9', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=400' },
  { id: '3', title: 'Museo Regional', category: 'Museos', rating: '4.8', image: 'https://images.unsplash.com/photo-1566121933407-3c7ccdd26763?q=80&w=400' },
  { id: '4', title: 'Templo Expiatorio', category: 'Iglesia', rating: '5.0', image: 'https://images.unsplash.com/photo-1584630019672-87000100f73b?q=80&w=400' },
  { id: '5', title: 'Rotonda', category: 'Monumentos', rating: '4.7', image: 'https://images.unsplash.com/photo-1570116494159-00b8bb5a3406?q=80&w=400' },
  { id: '6', title: 'Arcos Vallarta', category: 'Monumentos', rating: '4.9', image: 'https://images.unsplash.com/photo-1538089408581-224855bd29ba?q=80&w=400' },
  { id: '7', title: 'Palacio de Gobierno', category: 'Otros', rating: '4.8', image: 'https://images.unsplash.com/photo-1594904351111-a072f80b1a71?q=80&w=400' },
];

const CATEGORIAS = ['Museos', 'Iglesia', 'Monumentos', 'Otros'];

export default function SearchSiteScreen() {
  const { colors, theme } = useTheme();
  const [search, setSearch] = useState('');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      <ImageBackground source={require('../assets/images/header_design.png')} style={styles.headerBackground} resizeMode="cover">
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
             <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.logoWrapper}>
            <Image source={require('../assets/images/logo.png')} style={styles.logoImage} />
            <Text style={styles.logoText}>Histour</Text>
          </View>
          
          <View style={[styles.searchBarContainer, { backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E1E1E' }]}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput 
              placeholder="Buscar lugar" 
              placeholderTextColor="#999" 
              style={[styles.searchInput, { color: colors.text }]} 
              value={search} 
              onChangeText={setSearch} 
            />
          </View>
        </View>
      </ImageBackground>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>
        {CATEGORIAS.map((categoria) => {
          const lugares = MOCK_DATA.filter(lugar => lugar.category === categoria && lugar.title.toLowerCase().includes(search.toLowerCase()));
          if (lugares.length === 0) return null;
          return (
            <View key={categoria} style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{categoria}</Text>
              
              <View style={styles.gridRow}>
                {lugares.map((lugar) => (
                  <TouchableOpacity 
                    key={lugar.id} 
                    style={styles.card} 
                    // 👇 Aquí reemplazamos el alert por la navegación hacia site-details 👇
                    onPress={() => router.push({
                      pathname: '/site-details',
                      params: {
                        title: lugar.title,
                        image: lugar.image,
                        description: `Explora la increíble historia, arquitectura y legado cultural de ${lugar.title}, un sitio emblemático que forma parte de la identidad de la región.`
                      }
                    })}
                    activeOpacity={0.8}
                  >
                    <ImageBackground source={{ uri: lugar.image }} style={styles.cardImage} imageStyle={{ borderRadius: 8 }}>
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={10} color="#FFFFFF" style={styles.starIcon} />
                        <Text style={styles.ratingText}>{lugar.rating}</Text>
                      </View>
                      <View style={styles.cardTitleOverlay}>
                        <Text style={styles.cardTitleText} numberOfLines={1}>{lugar.title}</Text>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBackground: { width: '100%', height: 185 },
  headerContent: { flex: 1, paddingTop: 35, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.15)' },
  backButton: { position: 'absolute', top: 40, left: 20, zIndex: 10 },
  logoWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  logoImage: { width: 36, height: 36, marginRight: 10, resizeMode: 'contain' },
  logoText: { color: '#FFFFFF', fontSize: 30, fontWeight: 'bold', fontFamily: 'serif' },
  searchBarContainer: { flexDirection: 'row', width: '85%', height: 42, borderRadius: 25, alignItems: 'center', paddingHorizontal: 15, borderWidth: 3, borderColor: '#4E97D1' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14 },
  scrollArea: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  sectionContainer: { marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginLeft: 2 },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', height: 110, marginBottom: 15, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  cardImage: { width: '100%', height: '100%', justifyContent: 'space-between' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4E97D1', paddingHorizontal: 6, paddingVertical: 3, borderTopLeftRadius: 8, borderBottomRightRadius: 8, alignSelf: 'flex-start' },
  starIcon: { marginRight: 3 },
  ratingText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  cardTitleOverlay: { backgroundColor: 'rgba(0, 0, 0, 0.45)', paddingVertical: 5, paddingHorizontal: 8, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  cardTitleText: { color: '#FFFFFF', fontSize: 12 }
});