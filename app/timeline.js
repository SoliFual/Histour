import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// IMPORTACIONES DE FIREBASE
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function TimelineScreen() {
  const { colors } = useTheme();
  
  // Extraemos idioma
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language ? i18n.language.substring(0, 2) : 'es';

  const params = useLocalSearchParams();
  
  const desempaquetarSeguro = (val) => {
    if (!val) return '';
    let str = Array.isArray(val) ? val[0] : val;
    try { return decodeURIComponent(str); } catch (e) { return str; }
  };

  // Recibimos los parámetros
  const idRecibido = desempaquetarSeguro(params.id);
  const titleParam = desempaquetarSeguro(params.title);

  // ESTADOS: Forzamos la imagen a null al inicio para evitar que cargue fotos normales
  const [imagenLineaTiempo, setImagenLineaTiempo] = useState(null);
  const [tituloPantalla, setTituloPantalla] = useState(titleParam);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      if (!idRecibido) {
        setCargando(false);
        return;
      }

      try {
        const docRef = doc(db, "monuments", idRecibido);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          
          const carpetaTraducciones = data.traducciones || {};
          const datosIdioma = carpetaTraducciones[currentLang] || data[currentLang] || data.es || {};

          // Buscamos la URL de la línea del tiempo EXCLUSIVAMENTE
          const urlTimelineDB = datosIdioma.timelineUrl || data.timelineUrl;
          
          // Si realmente existe el enlace, lo guardamos. Si no, se queda en null.
          if (urlTimelineDB && urlTimelineDB.trim() !== "") {
            setImagenLineaTiempo(urlTimelineDB);
          } else {
            setImagenLineaTiempo(null);
          }

          const titleDB = datosIdioma.nombre || datosIdioma.name || data.nombre || data.name;
          if (titleDB) {
            setTituloPantalla(titleDB);
          }
        }
      } catch (error) {
        console.error("Error al cargar la línea del tiempo:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchTimeline();
  }, [idRecibido, currentLang]);

  const COLOR_LIGHT_BLUE = '#4E97D1';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerLeft}>
          <Ionicons name="arrow-back" size={28} color={COLOR_LIGHT_BLUE} />
          <Text style={[styles.headerTitle, { color: COLOR_LIGHT_BLUE }]}>{t('timeline.title')}</Text>
        </TouchableOpacity>
      </View>

      {cargando ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLOR_LIGHT_BLUE} />
          <Text style={{ marginTop: 10, color: colors.textSecondary }}>Cargando línea del tiempo...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <Text style={[styles.siteTitle, { color: COLOR_LIGHT_BLUE }]}>
            {tituloPantalla}
          </Text>

          <View style={styles.imageWrapper}>
            {imagenLineaTiempo ? (
              <Image 
                source={{ uri: imagenLineaTiempo }} 
                style={styles.image} 
                resizeMode="contain" 
              />
            ) : (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="images-outline" size={50} color={colors.border} style={{ marginBottom: 15 }} />
                <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 16 }}>
                  La línea del tiempo no está disponible para este sitio por el momento.
                </Text>
              </View>
            )}
          </View>

        </ScrollView>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginLeft: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  siteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginBottom: 10,
    textAlign: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: 500, // 👈 Ajuste clave: Le damos una altura controlada al contenedor
    justifyContent: 'flex-start',
  },
  image: {
    width: '100%',
    height: '100%', // 👈 Se adapta perfecto sin estirar el contenedor
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  }
});