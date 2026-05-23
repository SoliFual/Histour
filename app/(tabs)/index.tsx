import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // 1. Importamos el traductor
import { Alert, Image, ImageBackground, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function HomeScreen() {
  const { colors, theme } = useTheme();
  const { t } = useTranslation(); // 2. Activamos el traductor
  const [searchQuery, setSearchQuery] = useState('');

  const handleAbrirCamara = () => {
    if (Platform.OS === 'web') {
      alert(t('home.alerts.webWarning'));
      router.push('/camera');
      return;
    }

    Alert.alert(
      t('home.alerts.permissionTitle'),
      t('home.alerts.permissionMessage'),
      [
        { 
          text: t('home.alerts.deny'), 
          style: 'cancel',
          onPress: () => Alert.alert(t('home.alerts.deniedTitle'), t('home.alerts.deniedMessage'))
        },
        { 
          text: t('home.alerts.allow'), 
          onPress: () => router.push('/camera') 
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      
      <View style={styles.headerContainer}>
        <Image source={require('../../assets/images/header_design.png')} style={styles.headerImageBackground} resizeMode="cover" />
        <View style={styles.headerOverlayContent}>
          <View style={styles.logoRow}>
            <Image source={require('../../assets/images/logo.png')} style={styles.headerLogo} resizeMode="contain" />
            <Text style={styles.headerTitle}>HISTOUR</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.primary }]}
        onPress={() => router.push('/search-site')}
        activeOpacity={0.8}
      >
        <Ionicons name="search-outline" size={20} color={colors.primary} style={styles.searchIcon} />
        <Text style={[styles.searchInput, { color: theme === 'light' ? '#A0A0A0' : '#888888', alignSelf: 'center' }]}>
          {t('home.searchPlaceholder')}
        </Text>
      </TouchableOpacity>

      <View style={[styles.blueBand, { backgroundColor: colors.primary }]}>
        <TouchableOpacity 
          style={[styles.captureButton, { backgroundColor: colors.card }]}
          onPress={handleAbrirCamara}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={50} color={colors.primary} />
          <Text style={[styles.captureText, { color: colors.primary }]}>{t('home.captureButton')}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.whiteContentContainer, { backgroundColor: colors.background }]}>
        
        <Text style={styles.sectionTitle}>{t('home.sections.categories')}</Text>
        <View style={styles.categoriesRow}>
          <TouchableOpacity style={styles.categoryItem} onPress={() => router.push('/category-museos')}>
            <Image source={require('../../assets/images/cat_museos.png')} style={styles.categoryIconImage} resizeMode="contain" />
            <Text style={[styles.categoryLabel, { color: colors.primary }]}>{t('home.categories.museums')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryItem} onPress={() => router.push('/category-iglesias')}>
            <Image source={require('../../assets/images/cat_iglesias.png')} style={styles.categoryIconImage} resizeMode="contain" />
            <Text style={[styles.categoryLabel, { color: colors.primary }]}>{t('home.categories.churches')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryItem} onPress={() => router.push('/category-monumentos')}>
            <Image source={require('../../assets/images/cat_monumentos.png')} style={styles.categoryIconImage} resizeMode="contain" />
            <Text style={[styles.categoryLabel, { color: colors.primary }]}>{t('home.categories.monuments')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryItem} onPress={() => router.push('/category-otros')}>
            <Image source={require('../../assets/images/cat_mas.png')} style={styles.categoryIconImage} resizeMode="contain" />
            <Text style={[styles.categoryLabel, { color: colors.primary }]}>{t('home.categories.others')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('home.sections.mostVisited')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          <TouchableOpacity 
            style={styles.placeCard}
            onPress={() => router.push({
              pathname: '/site-details',
              params: {
                title: 'La Catedral',
                image: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=400&auto=format&fit=crop', 
                description: t('home.defaultSiteDescription')
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
                <Text style={styles.placeName}>{t('home.cathedralTitle')}</Text>
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