import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { height } = Dimensions.get('window');

const MOCK_CAROUSEL_IMAGES = [
  'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=600&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=600&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1552084117-56a98a966bd4?q=80&w=600&auto=format&fit=crop', 
];

export default function AdminDashboardScreen() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { colors, theme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % MOCK_CAROUSEL_IMAGES.length);
    }, 3000); 
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      <Image 
        source={require('../assets/images/header_admindesign.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={[styles.mainCard, { backgroundColor: colors.background }]}>
          
          <Text style={[styles.mainTitle, { color: theme === 'light' ? '#1A3B5C' : colors.text }]}>
            Panel de Administración
          </Text>

          <View style={styles.carouselContainer}>
            <Image 
              source={{ uri: MOCK_CAROUSEL_IMAGES[currentImageIndex] }} 
              style={styles.carouselImage}
            />
            <View style={styles.dotsContainer}>
              {MOCK_CAROUSEL_IMAGES.map((_, index) => (
                <View 
                  key={index} 
                  style={[styles.dot, currentImageIndex === index && styles.activeDot]} 
                />
              ))}
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Monumentos registrados</Text>
              <View style={styles.statValueRow}>
                <Ionicons name="business" size={24} color={colors.primary} />
                <Text style={[styles.statNumber, { color: colors.text }]}>155</Text>
              </View>
            </View>

            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Usuarios registrados</Text>
              <View style={styles.statValueRow}>
                <Ionicons name="people" size={24} color={colors.primary} />
                <Text style={[styles.statNumber, { color: colors.text }]}>18,500</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statBox, { width: '48%', backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Administradores</Text>
              <View style={styles.statValueRow}>
                <Ionicons name="git-network-outline" size={24} color={colors.primary} />
                <Text style={[styles.statNumber, { color: colors.text }]}>12</Text>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* PANEL INFERIOR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={22} color="#FFFFFF" />
          <Text style={styles.navText}>Principal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-profile')}>
          <Ionicons name="person" size={22} color="#FFFFFF" />
          <Text style={styles.navText}>Usuario</Text>
        </TouchableOpacity>

        {/* Botón de Usuarios ya conectado sin errores */}
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-users')}>
          <Ionicons name="settings" size={22} color="#FFFFFF" />
          <Text style={styles.navText}>Gestión de{'\n'}Usuarios</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => alert('Gestión de Monumentos')}>
          <Ionicons name="library" size={22} color="#FFFFFF" />
          <Text style={styles.navText}>Gestión de{'\n'}Monumentos</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { position: 'absolute', top: 0, width: '100%', height: 300 },
  scrollContent: { paddingTop: 180, paddingBottom: 20 },
  mainCard: { borderTopLeftRadius: 30, borderTopRightRadius: 30, minHeight: height - 180, paddingHorizontal: 20, paddingTop: 25 },
  mainTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  carouselContainer: { width: '100%', height: 180, borderRadius: 15, overflow: 'hidden', marginBottom: 25 },
  carouselImage: { width: '100%', height: '100%' },
  dotsContainer: { position: 'absolute', bottom: 10, flexDirection: 'row', width: '100%', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.5)', marginHorizontal: 4 },
  activeDot: { backgroundColor: '#FFFFFF', width: 10, height: 10 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statBox: { borderWidth: 1, borderRadius: 12, padding: 15 },
  statLabel: { fontSize: 11, marginBottom: 8 },
  statValueRow: { flexDirection: 'row', alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: 'bold', marginLeft: 8 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#0A2342', height: 75, paddingBottom: 10 },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navText: { fontSize: 9, color: '#FFFFFF', textAlign: 'center', marginTop: 4, fontWeight: '500' }
});