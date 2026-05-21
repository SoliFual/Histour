import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

export default function CategoryOtrosScreen() {
  const { colors } = useTheme();

  // 👇 Filtrado exclusivo para la categoría "Otros" 👇
  const otrosFiltrados = MOCK_DATA.filter(lugar => lugar.category === 'Otros');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* CABECERA AZUL */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Otros</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>
        <View style={styles.gridRow}>
          {otrosFiltrados.map((lugar) => (
            <TouchableOpacity 
              key={lugar.id} 
              style={styles.card} 
              // 👇 Navegación dinámica aplicada aquí 👇
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

        {otrosFiltrados.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No hay sitios registrados en esta categoría por el momento.
          </Text>
        )}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    width: '100%',
    height: 100, 
    justifyContent: 'flex-end', 
    alignItems: 'center', 
    paddingBottom: 15,
    elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3
  },
  backButton: {
    position: 'absolute', 
    left: 15, 
    bottom: 10, 
    zIndex: 10, 
    padding: 5, 
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollArea: { paddingHorizontal: 20, paddingTop: 25, paddingBottom: 40 },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    width: '48%', 
    height: 140, 
    marginBottom: 20, 
    borderRadius: 8, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 
  },
  cardImage: { width: '100%', height: '100%', justifyContent: 'space-between' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4E97D1', paddingHorizontal: 6, paddingVertical: 3, borderTopLeftRadius: 8, borderBottomRightRadius: 8, alignSelf: 'flex-start' },
  starIcon: { marginRight: 3 },
  ratingText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  cardTitleOverlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)', paddingVertical: 8, paddingHorizontal: 10, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  cardTitleText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16 }
});