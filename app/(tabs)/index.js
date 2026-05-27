import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Image, ImageBackground, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

import * as ImagePicker from 'expo-image-picker';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function HomeScreen() {
  const { colors, theme } = useTheme();
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const [topMonumentos, setTopMonumentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [analizando, setAnalizando] = useState(false);

  useEffect(() => {
    const cargarTopMonumentos = async () => {
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

          let calificacionDB = data.calificacionPromedio || data.promedio || data.rating || data.calificacion;
          let ratingFinal = calificacionDB ? Number(calificacionDB) : 0; 

          const carpetaTraducciones = data.traducciones || {};
          const datosIdioma = carpetaTraducciones[currentLang] || data[currentLang] || data.es || data || {};

          let titleFinal = datosIdioma.nombre || datosIdioma.name || data.nombre || data.name || 'Sin nombre';
          let descFinal = datosIdioma.descripcion || datosIdioma.historia || data.descripcionCompleta || data.description || t('home.defaultSiteDescription');

          monumentosTemp.push({
            id: doc.id,
            title: titleFinal, 
            rating: ratingFinal, 
            ratingTexto: ratingFinal > 0 ? ratingFinal.toFixed(1) : t('addSite.newBadge', 'Nuevo'), 
            image: primeraImagen,
            description: descFinal 
          });
        });

        monumentosTemp.sort((a, b) => b.rating - a.rating);
        const losTop5 = monumentosTemp.slice(0, 5);

        setTopMonumentos(losTop5);
      } catch (error) {
        console.error("Error al cargar los monumentos top:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarTopMonumentos();
  }, [t, i18n.language]);

  // 👇 1. FUNCIÓN QUE SE ENCARGA DE ABRIR LA CÁMARA Y ANALIZAR 👇
  const ejecutarCamaraYAnalisis = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.6,
        base64: true,
      });

      if (result.canceled) return; 

      setAnalizando(true);
      const base64Img = result.assets[0].base64;

      const GOOGLE_VISION_API_KEY = "AIzaSyDjKGthmq3AXrjqSyL96g5wSvzJv7d0cDQ"; 
      const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;
      
      const response = await fetch(apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: base64Img },
            features: [{ type: 'LANDMARK_DETECTION', maxResults: 3 }]
          }]
        })
      });

      const visionData = await response.json();

      // Manejo de errores directos de Google API
      if (visionData.error) {
        throw new Error(visionData.error.message);
      }

      const landmarks = visionData.responses[0]?.landmarkAnnotations;

      if (!landmarks || landmarks.length === 0) {
        setAnalizando(false);
        Alert.alert(
          t('home.alerts.notRecognizedTitle', 'No reconocido'), 
          t('home.alerts.notRecognizedMessage', 'No pudimos identificar ningún monumento en la foto. Asegúrate de capturar el exterior del edificio.')
        );
        return;
      }

      const recognizedNameRaw = landmarks[0].description;
      const recognizedName = recognizedNameRaw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      console.log("IA detectó:", recognizedNameRaw);

      const querySnapshot = await getDocs(collection(db, "monuments"));
      let sitioEncontrado = null;

      querySnapshot.forEach((doc) => {
        const bdData = doc.data();
        
        const nombreBaseES = (bdData.nombre || bdData.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const nombreBaseEN = (bdData.traducciones?.en?.nombre || bdData.traducciones?.en?.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        const keywords = bdData.palabrasClave || bdData.keywords || [];
        const normalizedKeywords = keywords.map(kw => kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

        const coincideNombre = (nombreBaseES && (nombreBaseES.includes(recognizedName) || recognizedName.includes(nombreBaseES))) ||
                               (nombreBaseEN && (nombreBaseEN.includes(recognizedName) || recognizedName.includes(nombreBaseEN)));
        
        const coincideKeyword = normalizedKeywords.some(kw => recognizedName.includes(kw) || kw.includes(recognizedName));

        if (coincideNombre || coincideKeyword) {
          let primeraImagen = bdData.image || 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83'; 
          if (bdData.imagenesUrls && bdData.imagenesUrls.length > 0) primeraImagen = bdData.imagenesUrls[0];

          sitioEncontrado = {
            id: doc.id,
            title: bdData.nombre || bdData.name || recognizedNameRaw,
            image: typeof primeraImagen === 'object' ? primeraImagen.uri : primeraImagen,
            description: bdData.descripcionCompleta || bdData.description || bdData.descripcion || ''
          };
        }
      });

      setAnalizando(false); 

      if (sitioEncontrado) {
        router.push({
          pathname: '/site-details',
          params: {
            id: sitioEncontrado.id,
            title: sitioEncontrado.title,
            image: encodeURIComponent(sitioEncontrado.image),
            description: encodeURIComponent(sitioEncontrado.description)
          }
        });
      } else {
        Alert.alert(
          t('home.alerts.notFoundTitle', 'Sitio no registrado'), 
          `Identificamos el lugar como "${recognizedNameRaw}", pero aún no tenemos información sobre él en la base de datos.`
        );
      }

    } catch (error) {
      console.error("Error en el proceso de cámara/IA:", error);
      setAnalizando(false);
      Alert.alert(
        t('home.alerts.errorTitle', 'Error de conexión'), 
        "Hubo un problema al analizar la imagen. Si el problema persiste, verifica la cuota o restricciones de tu API Key de Google."
      );
    }
  };

  // 👇 2. FUNCIÓN INTELIGENTE DE PERMISOS QUE EVITA PREGUNTAR DOS VECES 👇
  const handleAbrirCamara = async () => {
    if (Platform.OS === 'web') {
      alert(t('home.alerts.webWarning', 'La cámara mediante IA no está disponible en la versión web.'));
      return;
    }

    // A) Revisamos silenciosamente si el celular ya tiene permiso guardado
    const { status: statusActual } = await ImagePicker.getCameraPermissionsAsync();

    if (statusActual === 'granted') {
      // B) Si ya tiene permiso, saltamos las alertas y vamos directo a abrir la cámara
      ejecutarCamaraYAnalisis();
    } else {
      // C) Si NO tiene permiso, entonces sí mostramos la alerta bilingüe
      Alert.alert(
        t('home.alerts.permissionTitle', 'Permiso de Cámara'),
        t('home.alerts.permissionMessage', 'Histour necesita acceso a tu cámara para identificar monumentos mediante Inteligencia Artificial.'),
        [
          { 
            text: t('home.alerts.deny', 'Cancelar'), 
            style: 'cancel' 
          },
          { 
            text: t('home.alerts.allow', 'Permitir'), 
            onPress: async () => {
              // Pedimos el permiso oficial del sistema
              const { status: nuevoStatus } = await ImagePicker.requestCameraPermissionsAsync();
              
              if (nuevoStatus === 'granted') {
                ejecutarCamaraYAnalisis();
              } else {
                Alert.alert(
                  t('home.alerts.deniedTitle', 'Permiso denegado'),
                  t('home.alerts.deniedMessage', 'Necesitamos acceso a la cámara para usar esta función.')
                );
              }
            } 
          }
        ]
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
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

      {/* MODAL BILINGÜE DE CARGA MIENTRAS LA IA ESTÁ TRABAJANDO */}
      <Modal transparent={true} visible={analizando} animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#4E97D1" />
            <Text style={styles.loadingText}>
              {t('home.analyzingText', 'Analizando el monumento...')}
            </Text>
            <Text style={styles.loadingSubText}>Google Cloud Vision API</Text>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, headerContainer: { width: '100%', height: 190, position: 'relative' }, headerImageBackground: { width: '100%', height: '100%', position: 'absolute' }, headerOverlayContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 10 }, logoRow: { flexDirection: 'row', alignItems: 'center', marginTop: -20 }, headerLogo: { width: 45, height: 45, marginRight: 8 }, headerTitle: { fontSize: 28, color: '#FFFFFF', fontWeight: 'bold' }, searchContainer: { flexDirection: 'row', marginHorizontal: 25, marginTop: -25, marginBottom: 20, borderRadius: 25, paddingHorizontal: 15, alignItems: 'center', height: 50, borderWidth: 3, elevation: 4 }, searchIcon: { marginRight: 10 }, searchInput: { flex: 1, fontSize: 16 }, blueBand: { width: '100%', paddingVertical: 20, paddingHorizontal: 25 }, captureButton: { width: '100%', height: 120, borderRadius: 15, justifyContent: 'center', alignItems: 'center' }, captureText: { fontSize: 16, fontWeight: 'bold', marginTop: 5 }, whiteContentContainer: { paddingHorizontal: 20, paddingTop: 30 }, sectionTitle: { fontSize: 15, color: '#888888', marginBottom: 15, fontWeight: '500' }, categoriesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35, paddingHorizontal: 5 }, categoryItem: { alignItems: 'center', width: 70 }, categoryIconImage: { width: 60, height: 60, marginBottom: 8 }, categoryLabel: { fontSize: 11, fontWeight: 'bold' }, horizontalScroll: { flexDirection: 'row', paddingBottom: 25 }, placeCard: { width: 220, height: 130, marginRight: 15, borderRadius: 10, overflow: 'hidden' }, placeImage: { width: '100%', height: '100%' }, placeCardOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.35)', justifyContent: 'space-between', padding: 10 }, cardRatingContainer: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }, cardRatingText: { fontSize: 12, fontWeight: 'bold', marginLeft: 3 }, placeName: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  loadingOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  loadingBox: { width: 250, padding: 25, backgroundColor: '#FFFFFF', borderRadius: 15, alignItems: 'center', elevation: 10 },
  loadingText: { marginTop: 15, fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  loadingSubText: { marginTop: 5, fontSize: 12, color: '#888', textAlign: 'center' }
});