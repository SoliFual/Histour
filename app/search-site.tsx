import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// IMPORTACIONES DE FIREBASE
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function SearchSiteScreen() {
  const { colors, theme } = useTheme();
  const [search, setSearch] = useState('');
  
  // 👇 1. Extraemos i18n para saber el idioma actual 👇
  const { t, i18n } = useTranslation();

  // ESTADOS REALES
  const [monumentos, setMonumentos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // DESCARGAMOS TODOS LOS MONUMENTOS
  useEffect(() => {
    const cargarMonumentos = async () => {
      // 👇 2. Determinamos el idioma (es o en) 👇
      const currentLang = i18n.language ? i18n.language.substring(0, 2) : 'es';

      try {
        const querySnapshot = await getDocs(collection(db, "monuments"));
        const monumentosTemp = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          let primeraImagen = 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=400'; 
          if (data.imagenesUrls && Array.isArray(data.imagenesUrls) && data.imagenesUrls.length > 0) primeraImagen = data.imagenesUrls[0];
          else if (data.image) primeraImagen = data.image;

          if (typeof primeraImagen === 'object' && primeraImagen.uri) primeraImagen = primeraImagen.uri;

          let calificacionDB = data.calificacionPromedio || data.promedio || data.rating || data.calificacion;
          let ratingFinal = calificacionDB ? Number(calificacionDB).toFixed(1) : t('addSite.newBadge', 'Nuevo');

          // 👇 3. LÓGICA DE TRADUCCIÓN INTELIGENTE PARA EL TÍTULO Y DESCRIPCIÓN 👇
          const carpetaTraducciones = data.traducciones || {};
          const datosIdioma = carpetaTraducciones[currentLang] || data[currentLang] || data.es || data || {};

          let titleFinal = datosIdioma.nombre || datosIdioma.name || data.nombre || data.name || 'Sin nombre';
          let descFinal = datosIdioma.descripcion || datosIdioma.historia || data.descripcionCompleta || data.description || t('searchSite.description', { title: titleFinal });

          monumentosTemp.push({
            id: doc.id,
            title: titleFinal, // Guardamos el título traducido
            category: data.category || data.categoria || 'Otros', 
            rating: ratingFinal, 
            image: primeraImagen,
            description: descFinal // Guardamos la descripción traducida
          });
        });

        setMonumentos(monumentosTemp);
      } catch (error) {
        console.error("Error al cargar monumentos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarMonumentos();
    // 👇 4. Agregamos i18n.language para recargar al cambiar de idioma 👇
  }, [t, i18n.language]);

  // AGRUPACIÓN DINÁMICA POR CATEGORÍAS
  const monumentosFiltrados = monumentos.filter(lugar => lugar.title.toLowerCase().includes(search.toLowerCase()));
  
  const monumentosPorCategoria = monumentosFiltrados.reduce((grupos, lugar) => {
    const categoria = lugar.category;
    if (!grupos[categoria]) grupos[categoria] = [];
    grupos[categoria].push(lugar);
    return grupos;
  }, {});

  const categoriasDisponibles = Object.keys(monumentosPorCategoria);

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
              placeholder={t('searchSite.placeholder', 'Buscar lugar...')} 
              placeholderTextColor="#999" 
              style={[styles.searchInput, { color: colors.text }]} 
              value={search} 
              onChangeText={setSearch} 
            />
          </View>
        </View>
      </ImageBackground>

      {cargando ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, color: colors.textSecondary }}>Cargando catálogo...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>
          
          {categoriasDisponibles.length === 0 && (
            <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textSecondary }}>No se encontraron lugares.</Text>
          )}

          {categoriasDisponibles.map((categoriaOriginal) => {
            const lugares = monumentosPorCategoria[categoriaOriginal];
            
            // Lógica de traducción inteligente para el título de la categoría
            let catKey = 'others';
            const catLower = categoriaOriginal.toLowerCase();
            
            if (catLower.includes('museo')) catKey = 'museums';
            else if (catLower.includes('iglesia') || catLower.includes('templo')) catKey = 'churches';
            else if (catLower.includes('monumento')) catKey = 'monuments';

            const nombreCategoriaMostrar = t(`adminAddMonument.categories.${catKey}`, categoriaOriginal);

            return (
              <View key={categoriaOriginal} style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{nombreCategoriaMostrar}</Text>
                
                <View style={styles.gridRow}>
                  {lugares.map((lugar) => (
                    <TouchableOpacity 
                      key={lugar.id} 
                      style={styles.card} 
                      onPress={() => router.push({
                        pathname: '/site-details',
                        params: {
                          id: lugar.id,
                          title: lugar.title,
                          image: encodeURIComponent(lugar.image),
                          description: encodeURIComponent(lugar.description)
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
      )}

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
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginLeft: 2, textTransform: 'capitalize' },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', height: 110, marginBottom: 15, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  cardImage: { width: '100%', height: '100%', justifyContent: 'space-between' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4E97D1', paddingHorizontal: 6, paddingVertical: 3, borderTopLeftRadius: 8, borderBottomRightRadius: 8, alignSelf: 'flex-start' },
  starIcon: { marginRight: 3 },
  ratingText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  cardTitleOverlay: { backgroundColor: 'rgba(0, 0, 0, 0.45)', paddingVertical: 5, paddingHorizontal: 8, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  cardTitleText: { color: '#FFFFFF', fontSize: 12 }
});