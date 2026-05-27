import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// IMPORTACIONES DE FIREBASE
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function CategoryMonumentosScreen() {
  const { colors } = useTheme();
  
  // 👇 1. Extraemos i18n para saber el idioma actual 👇
  const { t, i18n } = useTranslation();

  // ESTADOS REALES
  const [monumentosLista, setMonumentosLista] = useState([]);
  const [cargando, setCargando] = useState(true);

  // DESCARGAR Y FILTRAR DESDE FIREBASE
  useEffect(() => {
    const cargarMonumentos = async () => {
      // 👇 2. Determinamos el idioma (es o en) 👇
      const currentLang = i18n.language ? i18n.language.substring(0, 2) : 'es';

      try {
        const querySnapshot = await getDocs(collection(db, "monuments"));
        const monumentosTemp = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const categoriaDB = (data.category || data.categoria || '').toLowerCase();

          // Filtramos buscando específicamente la palabra "monumento"
          if (categoriaDB.includes('monumento')) {
            
            // Extraer la imagen de forma segura
            let primeraImagen = 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=400'; 
            if (data.imagenesUrls && Array.isArray(data.imagenesUrls) && data.imagenesUrls.length > 0) primeraImagen = data.imagenesUrls[0];
            else if (data.image) primeraImagen = data.image;
            if (typeof primeraImagen === 'object' && primeraImagen.uri) primeraImagen = primeraImagen.uri;

            // Extraer calificación
            let calificacionDB = data.calificacionPromedio || data.promedio || data.rating || data.calificacion;
            let ratingFinal = calificacionDB ? Number(calificacionDB).toFixed(1) : t('addSite.newBadge', 'Nuevo');

            // 👇 3. LÓGICA DE TRADUCCIÓN INTELIGENTE PARA EL TÍTULO Y DESCRIPCIÓN 👇
            const carpetaTraducciones = data.traducciones || {};
            const datosIdioma = carpetaTraducciones[currentLang] || data[currentLang] || data.es || data || {};

            let titleFinal = datosIdioma.nombre || datosIdioma.name || data.nombre || data.name || 'Sin nombre';
            let descFinal = datosIdioma.descripcion || datosIdioma.historia || data.descripcionCompleta || data.description || t('categoryMonumentos.description', { title: titleFinal });

            monumentosTemp.push({
              id: doc.id,
              title: titleFinal, // Guardamos el título ya traducido
              rating: ratingFinal,
              image: primeraImagen,
              description: descFinal // Guardamos la descripción ya traducida
            });
          }
        });

        setMonumentosLista(monumentosTemp);
      } catch (error) {
        console.error("Error al cargar monumentos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarMonumentos();
    // 👇 4. Agregamos i18n.language para que la lista se recargue si el usuario cambia el idioma 👇
  }, [t, i18n.language]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* CABECERA AZUL */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('categoryMonumentos.title')}</Text>
      </View>

      {/* CONTENIDO (Carga o Lista) */}
      {cargando ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, color: colors.textSecondary }}>Cargando monumentos...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>
          <View style={styles.gridRow}>
            {monumentosLista.map((lugar) => (
              <TouchableOpacity 
                key={lugar.id} 
                style={styles.card} 
                onPress={() => router.push({
                  pathname: '/site-details',
                  params: {
                    id: lugar.id,
                    title: lugar.title,
                    // Empaquetamos la imagen para que Expo Router viaje seguro
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

          {monumentosLista.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('categoryMonumentos.emptyText')}
            </Text>
          )}
        </ScrollView>
      )}

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