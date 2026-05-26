import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Image, ImageBackground, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// IMPORTACIONES DE FIREBASE
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function HomeScreen() {
  const { colors, theme } = useTheme();
  
  // 1. Extraemos i18n para saber el idioma actual
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // ESTADOS PARA LOS MONUMENTOS TOP
  const [topMonumentos, setTopMonumentos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarTopMonumentos = async () => {
      // 2. Determinamos el idioma (es o en)
      const currentLang = i18n.language ? i18n.language.substring(0, 2) : 'es';

      try {
        const querySnapshot = await getDocs(collection(db, "monuments"));
        const monumentosTemp = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          let primeraImagen = 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=400&auto=format&fit=crop'; 
          if (data.imagenesUrls && Array.isArray(data.imagenesUrls) && data.imagenesUrls.length > 0) primeraImagen = data.imagenesUrls[0];
          else if (data.image) primeraImagen = data.image;

          if (typeof primeraImagen === 'object' && primeraImagen.uri) primeraImagen = primeraImagen.uri;

          // Extraemos la calificación de forma segura
          let calificacionDB = data.calificacionPromedio || data.promedio || data.rating || data.calificacion;
          let ratingFinal = calificacionDB ? Number(calificacionDB) : 0; // Si no tiene, vale 0

          // 👇 3. LÓGICA DE TRADUCCIÓN INTELIGENTE PARA EL TÍTULO Y DESCRIPCIÓN 👇
          const carpetaTraducciones = data.traducciones || {};
          const datosIdioma = carpetaTraducciones[currentLang] || data[currentLang] || data.es || data || {};

          let titleFinal = datosIdioma.nombre || datosIdioma.name || data.nombre || data.name || 'Sin nombre';
          let descFinal = datosIdioma.descripcion || datosIdioma.historia || data.descripcionCompleta || data.description || t('home.defaultSiteDescription');

          monumentosTemp.push({
            id: doc.id,
            title: titleFinal, // Guardamos el título traducido
            rating: ratingFinal, // Guardamos el número para poder ordenarlos
            ratingTexto: ratingFinal > 0 ? ratingFinal.toFixed(1) : t('addSite.newBadge', 'Nuevo'), // Texto para la pantalla
            image: primeraImagen,
            description: descFinal // Guardamos la descripción traducida
          });
        });

        // 👇 LA MAGIA DE LOS TOP 5 👇
        // 1. Ordenamos de mayor a menor calificación
        monumentosTemp.sort((a, b) => b.rating - a.rating);
        
        // 2. Tomamos solo los primeros 5
        const losTop5 = monumentosTemp.slice(0, 5);

        setTopMonumentos(losTop5);
      } catch (error) {
        console.error("Error al cargar los monumentos top:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarTopMonumentos();
    
    // 4. Agregamos i18n.language para que se recargue si el usuario cambia el idioma
  }, [t, i18n.language]);

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
        
        {/* 👇 LISTA HORIZONTAL DINÁMICA DE LOS TOP 5 👇 */}
        {cargando ? (
           <View style={{ alignItems: 'center', paddingVertical: 20 }}>
             <ActivityIndicator size="small" color={colors.primary} />
           </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {topMonumentos.map((monumento) => (
              <TouchableOpacity 
                key={monumento.id}
                style={styles.placeCard}
                onPress={() => router.push({
                  pathname: '/site-details',
                  params: {
                    id: monumento.id,
                    title: monumento.title,
                    image: encodeURIComponent(monumento.image), 
                    description: encodeURIComponent(monumento.description)
                  }
                })}
                activeOpacity={0.8}
              >
                <ImageBackground source={{ uri: monumento.image }} style={styles.placeImage} imageStyle={{ borderRadius: 10 }}>
                  <View style={styles.placeCardOverlay}>
                    <View style={[styles.cardRatingContainer, { backgroundColor: colors.card }]}>
                      <Ionicons name="star" size={12} color={colors.primary} />
                      <Text style={[styles.cardRatingText, { color: colors.text }]}>{monumento.ratingTexto}</Text>
                    </View>
                    <Text style={styles.placeName} numberOfLines={2}>{monumento.title}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
            
            {topMonumentos.length === 0 && (
              <Text style={{ color: colors.textSecondary, fontStyle: 'italic', marginLeft: 10 }}>
                Aún no hay monumentos registrados.
              </Text>
            )}
          </ScrollView>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, headerContainer: { width: '100%', height: 190, position: 'relative' }, headerImageBackground: { width: '100%', height: '100%', position: 'absolute' }, headerOverlayContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 10 }, logoRow: { flexDirection: 'row', alignItems: 'center', marginTop: -20 }, headerLogo: { width: 45, height: 45, marginRight: 8 }, headerTitle: { fontSize: 28, color: '#FFFFFF', fontWeight: 'bold' }, searchContainer: { flexDirection: 'row', marginHorizontal: 25, marginTop: -25, marginBottom: 20, borderRadius: 25, paddingHorizontal: 15, alignItems: 'center', height: 50, borderWidth: 3, elevation: 4 }, searchIcon: { marginRight: 10 }, searchInput: { flex: 1, fontSize: 16 }, blueBand: { width: '100%', paddingVertical: 20, paddingHorizontal: 25 }, captureButton: { width: '100%', height: 120, borderRadius: 15, justifyContent: 'center', alignItems: 'center' }, captureText: { fontSize: 16, fontWeight: 'bold', marginTop: 5 }, whiteContentContainer: { paddingHorizontal: 20, paddingTop: 30 }, sectionTitle: { fontSize: 15, color: '#888888', marginBottom: 15, fontWeight: '500' }, categoriesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35, paddingHorizontal: 5 }, categoryItem: { alignItems: 'center', width: 70 }, categoryIconImage: { width: 60, height: 60, marginBottom: 8 }, categoryLabel: { fontSize: 11, fontWeight: 'bold' }, horizontalScroll: { flexDirection: 'row', paddingBottom: 25 }, placeCard: { width: 220, height: 130, marginRight: 15, borderRadius: 10, overflow: 'hidden' }, placeImage: { width: '100%', height: '100%' }, placeCardOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.35)', justifyContent: 'space-between', padding: 10 }, cardRatingContainer: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }, cardRatingText: { fontSize: 12, fontWeight: 'bold', marginLeft: 3 }, placeName: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' }
});