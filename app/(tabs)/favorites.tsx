import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFavorites } from '../../context/FavoritesContext';
import { useTheme } from '../../context/ThemeContext';
// 1. Importamos el traductor
import { useTranslation } from 'react-i18next';

export default function FavoritesScreen() {
  const { colors } = useTheme();
  
  // 2. Activamos el traductor
  const { t } = useTranslation();

  const { favorites } = useFavorites();

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.cardContainer} 
      activeOpacity={0.8}
      onPress={() => router.push({
        pathname: '/site-details',
        params: {
          title: item.title,
          image: item.image,
          // Inyectamos el nombre del lugar en la descripción traducida
          description: t('favorites.description', { title: item.title })
        }
      })}
    >
      <ImageBackground 
        source={{ uri: item.image }} 
        style={styles.cardImage}
        imageStyle={{ borderRadius: 8 }} 
      >
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={10} color="#FFFFFF" style={styles.starIcon} />
          <Text style={styles.ratingText}>{item.rating || '5.0'}</Text>
        </View>

        <View style={styles.titleOverlay}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* ENCABEZADO SUPERIOR AZUL */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Ionicons name="heart" size={32} color="#FFFFFF" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>{t('favorites.title')}</Text>
      </View>

      {favorites.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.text }]}>
          {t('favorites.emptyText')}
        </Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.title}
          renderItem={renderItem}
          numColumns={2} 
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row} 
          showsVerticalScrollIndicator={false}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 25,     
    paddingBottom: 15, 
    paddingHorizontal: 25,
    marginBottom: 15,
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 3,
  },
  headerIcon: { marginRight: 10, marginTop: 2 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF' },
  listContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  row: { justifyContent: 'space-between', marginBottom: 15 },
  cardContainer: { width: '48%', height: 140 },
  cardImage: { width: '100%', height: '100%', justifyContent: 'space-between' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', paddingHorizontal: 6, paddingVertical: 3, borderTopLeftRadius: 8, borderBottomRightRadius: 8, alignSelf: 'flex-start' },
  starIcon: { marginRight: 3 },
  ratingText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  titleOverlay: { backgroundColor: 'rgba(0, 0, 0, 0.4)', paddingVertical: 5, paddingHorizontal: 8, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  cardTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, paddingHorizontal: 20 }
});