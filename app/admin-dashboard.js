import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// IMPORTACIONES DE FIREBASE
import { collection, getCountFromServer, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const { height } = Dimensions.get('window');

export default function AdminDashboardScreen() {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [carouselImages, setCarouselImages] = useState([]);
  const [stats, setStats] = useState({ monuments: 0, users: 0, admins: 0 });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const adminsQuery = query(collection(db, "users"), where("rol", "==", "admin"));
        const adminsSnapshot = await getCountFromServer(adminsQuery);
        const adminsCount = adminsSnapshot.data().count;

        const usersQuery = query(collection(db, "users"), where("rol", "==", "user"));
        const usersSnapshot = await getCountFromServer(usersQuery);
        const usersCount = usersSnapshot.data().count;

        const monumentsSnapshot = await getDocs(collection(db, "monuments"));
        const monumentsCount = monumentsSnapshot.size;

        let imagenesExtraidas = [];

        monumentsSnapshot.forEach((doc) => {
          const data = doc.data();
          let primeraImagen = null;

          // 👇 ¡AQUÍ ESTÁ LA MAGIA! Agregamos la variable exacta de tu base de datos: imagenesUrls 👇
          if (data.imagenesUrls && Array.isArray(data.imagenesUrls) && data.imagenesUrls.length > 0) primeraImagen = data.imagenesUrls[0];
          else if (data.imagenes && Array.isArray(data.imagenes) && data.imagenes.length > 0) primeraImagen = data.imagenes[0];
          else if (data.images && Array.isArray(data.images) && data.images.length > 0) primeraImagen = data.images[0];
          else if (data.fotos && Array.isArray(data.fotos) && data.fotos.length > 0) primeraImagen = data.fotos[0];
          else if (data.fotosUrls && Array.isArray(data.fotosUrls) && data.fotosUrls.length > 0) primeraImagen = data.fotosUrls[0];
          else if (data.imagen) primeraImagen = data.imagen;
          else if (data.image) primeraImagen = data.image;
          else if (data.foto) primeraImagen = data.foto;
          else if (data.imageUrl) primeraImagen = data.imageUrl;

          if (primeraImagen && typeof primeraImagen === 'object' && primeraImagen.uri) {
            primeraImagen = primeraImagen.uri;
          }

          if (primeraImagen && typeof primeraImagen === 'string' && primeraImagen.startsWith('http')) {
            imagenesExtraidas.push(primeraImagen);
          }
        });

        setCarouselImages(imagenesExtraidas);

        setStats({
          monuments: monumentsCount,
          users: usersCount,
          admins: adminsCount
        });

      } catch (error) {
        console.error("Error al cargar el dashboard:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (carouselImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={require('../assets/images/header_admindesign.png')} style={styles.backgroundImage} resizeMode="cover" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.mainCard, { backgroundColor: colors.background }]}>
          <Text style={[styles.mainTitle, { color: theme === 'light' ? '#1A3B5C' : colors.text }]}>
            {t('adminDashboard.title')}
          </Text>

          {carouselImages.length > 0 ? (
            <View style={styles.carouselContainer}>
              <Image source={{ uri: carouselImages[currentImageIndex] }} style={styles.carouselImage} />
              {carouselImages.length > 1 && (
                <View style={styles.dotsContainer}>
                  {carouselImages.map((_, index) => (
                    <View key={index} style={[styles.dot, currentImageIndex === index && styles.activeDot]} />
                  ))}
                </View>
              )}
            </View>
          ) : !cargando ? (
            <View style={[styles.noMonumentsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="images-outline" size={32} color={colors.textSecondary} />
              <Text style={[styles.noMonumentsText, { color: colors.textSecondary }]}>
                No hay fotos de monumentos disponibles.
              </Text>
            </View>
          ) : null}

          {cargando ? (
            <View style={{ marginTop: 30, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ marginTop: 10, color: colors.textSecondary }}>Actualizando estadísticas...</Text>
            </View>
          ) : (
            <>
              <View style={styles.statsRow}>
                <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('adminDashboard.stats.monuments')}</Text>
                  <View style={styles.statValueRow}>
                    <Ionicons name="business" size={24} color={colors.primary} />
                    <Text style={[styles.statNumber, { color: colors.text }]}>{stats.monuments}</Text>
                  </View>
                </View>

                <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('adminDashboard.stats.users')}</Text>
                  <View style={styles.statValueRow}>
                    <Ionicons name="people" size={24} color={colors.primary} />
                    <Text style={[styles.statNumber, { color: colors.text }]}>{stats.users.toLocaleString()}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={[styles.statBox, { width: '48%', backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('adminDashboard.stats.admins')}</Text>
                  <View style={styles.statValueRow}>
                    <Ionicons name="git-network-outline" size={24} color={colors.primary} />
                    <Text style={[styles.statNumber, { color: colors.text }]}>{stats.admins}</Text>
                  </View>
                </View>
              </View>
            </>
          )}

        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={22} color="#FFFFFF" />
          <Text style={[styles.navText, { fontWeight: 'bold' }]}>{t('admin.principal')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-profile')}>
          <Ionicons name="person" size={22} color="#FFFFFF" />
          <Text style={styles.navText}>{t('admin.perfil')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-users')}>
          <Ionicons name="settings" size={22} color="#FFFFFF" />
          <Text style={styles.navText}>{t('admin.usuarios')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-monuments')}>
          <Ionicons name="library" size={22} color="#FFFFFF" />
          <Text style={styles.navText}>{t('admin.monumentos')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { position: 'absolute', top: 0, width: '100%', height: 300 },
  scrollContent: { paddingTop: 180, paddingBottom: 120 },
  mainCard: { borderTopLeftRadius: 30, borderTopRightRadius: 30, minHeight: height - 180, paddingHorizontal: 20, paddingTop: 25 },
  mainTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  carouselContainer: { width: '100%', height: 180, borderRadius: 15, overflow: 'hidden', marginBottom: 25 },
  carouselImage: { width: '100%', height: '100%' },
  dotsContainer: { position: 'absolute', bottom: 10, flexDirection: 'row', width: '100%', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.5)', marginHorizontal: 4 },
  activeDot: { backgroundColor: '#FFFFFF', width: 10, height: 10 },
  noMonumentsCard: { width: '100%', height: 180, borderRadius: 15, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 25, borderStyle: 'dashed' },
  noMonumentsText: { fontSize: 14, marginTop: 8, fontWeight: '500' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statBox: { borderWidth: 1, borderRadius: 12, padding: 15, width: '48%' },
  statLabel: { fontSize: 11, marginBottom: 8 },
  statValueRow: { flexDirection: 'row', alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: 'bold', marginLeft: 8 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#0A2342', height: 90, paddingBottom: 20, position: 'absolute', bottom: 0, width: '100%' },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navText: { fontSize: 9, color: '#FFFFFF', textAlign: 'center', marginTop: 4, fontWeight: '500' }
});