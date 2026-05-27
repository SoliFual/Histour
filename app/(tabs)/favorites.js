import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFavorites } from '../../context/FavoritesContext';
import { useTheme } from '../../context/ThemeContext';

// IMPORTACIONES DE FIREBASE (Nuevas)
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function FavoritesScreen() {
  const { colors } = useTheme();
  
  // 👇 1. Extraemos i18n para saber el idioma actual 👇
  const { t, i18n } = useTranslation();
  
  // Extraemos la lista original de favoritos del contexto
  const { favorites } = useFavorites();

  // ESTADOS REALES PARA LOS FAVORITOS TRADUCIDOS
  const [translatedFavorites, setTranslatedFavorites] = useState([]);
  const [cargando, setCargando] = useState(true);

  // EFECTO: TRADUCIR FAVORITOS EN TIEMPO REAL
  useEffect(() => {
    const cargarFavoritosBilingues = async () => {
      if (!favorites || favorites.length === 0) {
        setTranslatedFavorites([]);
        setCargando(false);
        return;
      }

      // Determinamos el idioma actual
      const currentLang = i18n.language ? i18n.language.substring(0, 2) : 'es';
      setCargando(true);

      try {
        // Pedimos a Firebase la información fresca y traducida de CADA favorito
        const promesas = favorites.map(async (fav) => {
          if (!fav.id) return fav; // Si por algún error no tiene ID, lo devolvemos igual
          
          const docRef = doc(db, "monuments", fav.id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // 👇 2. LÓGICA DE TRADUCCIÓN INTELIGENTE 👇
            const carpetaTraducciones = data.traducciones || {};
            const datosIdioma = carpetaTraducciones[currentLang] || data[currentLang] || data.es || data || {};

            let titleFinal = datosIdioma.nombre || datosIdioma.name || data.nombre || data.name || fav.title;
            let descFinal = datosIdioma.descripcion || datosIdioma.historia || data.descripcionCompleta || data.description || t('favorites.description', { title: titleFinal });

            // Retornamos el favorito pero con sus textos actualizados al idioma
            return {
              ...fav,
              title: titleFinal,
              description: descFinal
            };
          }
          return fav; // Si el monumento fue borrado de la base de datos principal
        });

        // Esperamos a que todas las traducciones se descarguen
        const favsResueltos = await Promise.all(promesas);
        setTranslatedFavorites(favsResueltos);

      } catch (error) {
        console.error("Error al traducir los favoritos:", error);
        setTranslatedFavorites(favorites); // En caso de error, mostramos los originales
      } finally {
        setCargando(false);
      }
    };

    cargarFavoritosBilingues();
    // 👇 Se recarga si cambian los favoritos o si el turista cambia el idioma 👇
  }, [favorites, t, i18n.language]);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.cardContainer} 
      activeOpacity={0.8}
      onPress={() => router.push({
        pathname: '/site-details',
        params: {
          id: item.id, 
          title: item.title,
          // Empaquetamos para que viaje seguro por Expo Router
          image: encodeURIComponent(item.image),
          description: encodeURIComponent(item.description)
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

      {/* CONTENIDO (Carga o Lista) */}
      {cargando ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, color: colors.textSecondary }}>Cargando favoritos...</Text>
        </View>
      ) : translatedFavorites.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.text }]}>
          {t('favorites.emptyText')}
        </Text>
      ) : (
        <FlatList
          data={translatedFavorites}
          keyExtractor={(item) => item.id || item.title} 
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