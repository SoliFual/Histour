import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';

// IMPORTACIÓN DE AUDIO 
import { Audio } from 'expo-av';

// IMPORTACIONES DE FIREBASE
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function AudioModeScreen() {
  const { colors, theme } = useTheme();
  
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language ? i18n.language.substring(0, 2) : 'es'; 
  
  const params = useLocalSearchParams();
  
  const desempaquetarSeguro = (val) => {
    if (!val) return '';
    let str = Array.isArray(val) ? val[0] : val;
    try { return decodeURIComponent(str); } catch (e) { return str; }
  };
  
  const idRecibido = desempaquetarSeguro(params.id);
  const tituloRecibido = desempaquetarSeguro(params.title);

  // ESTADOS DE DATOS
  const [datosBD, setDatosBD] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [idDocumento, setIdDocumento] = useState(idRecibido); 

  // ESTADOS DE AUDIO
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [cargandoAudio, setCargandoAudio] = useState(false);

  // ESTADOS DE FAVORITOS Y RATING
  const { isFavorite, toggleFavorite } = useFavorites();
  const isCurrentFavorite = isFavorite(idRecibido || tituloRecibido);
  const [rating, setRating] = useState(0);
  const [enviando, setEnviando] = useState(false); 

  // 1. DESCARGAMOS LA INFO DEL SITIO
  useEffect(() => {
    const buscarMonumentoEnBD = async () => {
      if (!idRecibido) {
        setCargando(false);
        return;
      }
      try {
        const docRef = doc(db, "monuments", idRecibido);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDatosBD(data);

          const user = auth.currentUser;
          if (user && data.userRatings && data.userRatings[user.uid]) {
            setRating(data.userRatings[user.uid]);
          }
        }
      } catch (error) {
        console.error("Error descargando datos para Audio Mode:", error);
      } finally {
        setCargando(false);
      }
    };

    buscarMonumentoEnBD();
  }, [idRecibido]);

  // 2. LÓGICA DE REPRODUCCIÓN DE AUDIO REAL 
  const urlAudioBilingue = datosBD?.audiosUrls?.[currentLang] || datosBD?.audiosUrls?.es || '';

  const reproducirPausarAudio = async () => {
    if (!urlAudioBilingue) {
      alert("Lo sentimos, no hay audio disponible para este sitio en este idioma.");
      return;
    }

    try {
      if (sound) {
        // Si ya está cargado, lo pausamos o despausamos
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        // Si no está cargado, lo descargamos y le damos Play
        setCargandoAudio(true);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: urlAudioBilingue },
          { shouldPlay: true },
          actualizarProgresoVisual
        );
        setSound(newSound);
        setIsPlaying(true);
        setCargandoAudio(false);
      }
    } catch (error) {
      console.error("Error con el reproductor:", error);
      setCargandoAudio(false);
      alert("Hubo un problema al intentar reproducir el audio.");
    }
  };

  const actualizarProgresoVisual = (status) => {
    if (status.isLoaded) {
      setProgress(status.positionMillis / status.durationMillis);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setProgress(0);
        sound?.setPositionAsync(0);
      }
    }
  };

  // IMPORTANTE: Limpiamos la memoria y apagamos el audio si el turista se sale de la pantalla
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);


  // 3. SISTEMA DE CALIFICACIÓN ÚNICA POR USUARIO
  const enviarCalificacion = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Debes iniciar sesión para calificar.");
      return;
    }
    if (rating === 0) {
      alert(t('audioMode.alerts.emptyRating'));
      return;
    }
    if (!idDocumento) return;

    setEnviando(true); 
    try {
      const uid = user.uid;
      const calificacionActual = datosBD.calificacionPromedio || 0;
      const totalVotosActuales = datosBD.totalVotos || 0;
      const userRatings = datosBD.userRatings || {};
      const votoAnterior = userRatings[uid];

      let nuevoTotalVotos = totalVotosActuales;
      let nuevoPromedio = 0;
      const sumaTotalAnterior = calificacionActual * totalVotosActuales;

      if (votoAnterior) {
        const sumaCorregida = sumaTotalAnterior - votoAnterior + rating;
        nuevoPromedio = nuevoTotalVotos === 0 ? rating : sumaCorregida / nuevoTotalVotos;
      } else {
        nuevoTotalVotos += 1;
        const nuevaSuma = sumaTotalAnterior + rating;
        nuevoPromedio = nuevaSuma / nuevoTotalVotos;
      }

      userRatings[uid] = rating;

      const docRef = doc(db, "monuments", idDocumento);
      await updateDoc(docRef, {
        calificacionPromedio: nuevoPromedio,
        totalVotos: nuevoTotalVotos,
        rating: nuevoPromedio, 
        promedio: nuevoPromedio,
        userRatings: userRatings 
      });

      alert(t('audioMode.alerts.successRating', { rating }));
      
      setDatosBD(prev => ({
        ...prev,
        calificacionPromedio: nuevoPromedio,
        totalVotos: nuevoTotalVotos,
        userRatings: userRatings
      }));
    } catch (error) {
      console.error("Error al calificar:", error);
      alert("Error al enviar calificación.");
    } finally {
      setEnviando(false);
    }
  };

  const COLOR_LIGHT_BLUE = '#4E97D1';
  const COLOR_DARK_BLUE = '#2260A3';

  if (cargando) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLOR_LIGHT_BLUE} />
      </View>
    );
  }

  // 4. EXTRACCIÓN DE IMÁGENES Y TEXTOS BILINGÜES
  let img1 = desempaquetarSeguro(params.image) || 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=400';
  let img2 = desempaquetarSeguro(params.image2) || 'https://images.unsplash.com/photo-1548625361-ec85d5809eb3?q=80&w=600';
  let img3 = 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=400';

  if (datosBD?.imagenesUrls && Array.isArray(datosBD.imagenesUrls)) {
    if (datosBD.imagenesUrls[0]) img1 = typeof datosBD.imagenesUrls[0] === 'object' ? datosBD.imagenesUrls[0].uri : datosBD.imagenesUrls[0];
    if (datosBD.imagenesUrls[1]) img2 = typeof datosBD.imagenesUrls[1] === 'object' ? datosBD.imagenesUrls[1].uri : datosBD.imagenesUrls[1];
    if (datosBD.imagenesUrls[2]) img3 = typeof datosBD.imagenesUrls[2] === 'object' ? datosBD.imagenesUrls[2].uri : datosBD.imagenesUrls[2];
  } else if (datosBD?.image) {
    img1 = typeof datosBD.image === 'object' ? datosBD.image.uri : datosBD.image;
  }

  const carpetaTraducciones = datosBD?.traducciones || {};
  const datosIdioma = carpetaTraducciones[currentLang] || datosBD?.[currentLang] || datosBD?.es || datosBD || {};
  const tituloFinal = datosIdioma.nombre || datosIdioma.name || datosBD?.nombre || datosBD?.name || tituloRecibido;
  
  // 👇 NUEVA EXTRACCIÓN DE FUENTES 👇
  const textoFuentes = datosIdioma.fuentes || datosIdioma.sources || datosBD?.fuentes || datosBD?.sources || (currentLang === 'en' ? "No sources registered for this site." : "No se han registrado fuentes para este sitio.");
  const tituloCajaFuentes = currentLang === 'en' ? "Sources & Bibliography" : "Fuentes y Bibliografía";

  const progressPercent = `${(progress * 100) || 0}%`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* CABECERA */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerLeft}>
          <Ionicons name="arrow-back" size={28} color={COLOR_LIGHT_BLUE} />
          <Text style={[styles.headerTitle, { color: COLOR_LIGHT_BLUE }]}>{t('audioMode.title')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => toggleFavorite({ id: idDocumento, title: tituloFinal, image: img1 })}>
          <Ionicons 
            name={isCurrentFavorite ? "heart" : "heart-outline"} 
            size={35} 
            color={COLOR_DARK_BLUE} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Text style={[styles.monumentTitle, { color: colors.text }]}>{tituloFinal}</Text>
        
        {/* REPRODUCTOR DE AUDIO REAL */}
        <View style={[styles.audioBox, { backgroundColor: COLOR_DARK_BLUE }]}>
          <View style={styles.audioTopRow}>
            <Text style={styles.audioTitle} numberOfLines={1}>
              {t('audioMode.audioTitle', { title: tituloFinal })}
            </Text>
            
            <TouchableOpacity onPress={reproducirPausarAudio} style={styles.playButtonWrapper}>
              {cargandoAudio ? (
                <ActivityIndicator size="small" color={COLOR_DARK_BLUE} />
              ) : (
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={22} 
                  color={COLOR_DARK_BLUE} 
                  style={{ marginLeft: isPlaying ? 0 : 2 }} 
                />
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: progressPercent }]} />
            <View style={[styles.progressDot, { left: progressPercent }]} />
          </View>
        </View>

        {/* 3 RECTÁNGULOS DE IMÁGENES */}
        <View style={[styles.imageContainer, { borderColor: COLOR_LIGHT_BLUE }]}>
          <Image source={{ uri: img1 }} style={styles.image} />
        </View>

        <View style={[styles.imageContainer, { borderColor: COLOR_LIGHT_BLUE }]}>
          <Image source={{ uri: img2 }} style={styles.image} />
        </View>

        {/* 👇 ÚLTIMA FOTO 👇 */}
        <View style={[styles.imageContainer, { borderColor: COLOR_LIGHT_BLUE }]}>
          <Image source={{ uri: img3 }} style={styles.image} />
        </View>

        {/* 👇 SECCIÓN DE BIBLIOGRAFÍA 👇 */}
        <View style={[styles.sourcesBox, { backgroundColor: theme === 'light' ? '#F0F5FA' : '#1E1E1E', borderColor: colors.border }]}>
          <Text style={[styles.sourcesHeading, { color: COLOR_DARK_BLUE }]}>{tituloCajaFuentes}</Text>
          <Text style={[styles.sourcesText, { color: colors.textSecondary }]}>{textoFuentes}</Text>
        </View>

        {/* 👇 BOTÓN LÍNEA DEL TIEMPO 👇 */}
        <TouchableOpacity 
          style={[styles.timelineButton, { borderColor: COLOR_LIGHT_BLUE }]}
          onPress={() => router.push({
            pathname: '/timeline',
            params: {
                id: idDocumento,
              title: tituloFinal, 
              timelineImage: encodeURIComponent(img1)
            }
          })}
        >
          <Text style={[styles.timelineText, { color: COLOR_LIGHT_BLUE }]}>{t('audioMode.buttons.timeline')}</Text>
        </TouchableOpacity>

        {/* SECCIÓN DE CALIFICACIÓN */}
        <View style={styles.ratingSection}>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} disabled={enviando}>
                <Ionicons 
                  name={star <= rating ? "star" : "star-outline"} 
                  size={32} 
                  color={COLOR_DARK_BLUE} 
                  style={styles.starIcon}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity 
            style={[styles.rateButton, { borderColor: enviando ? '#A0A0A0' : COLOR_LIGHT_BLUE }]}
            onPress={enviarCalificacion}
            disabled={enviando}
          >
            {enviando ? (
              <ActivityIndicator size="small" color={COLOR_LIGHT_BLUE} />
            ) : (
              <Text style={[styles.rateText, { color: COLOR_LIGHT_BLUE }]}>{t('audioMode.buttons.rate')}</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingTop: 40, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
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
  },
  monumentTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'serif',
    textAlign: 'center',
    marginBottom: 25,
    marginTop: 5,
  },
  
  /* ESTILOS DEL REPRODUCTOR DE AUDIO */
  audioBox: {
    padding: 20,
    borderRadius: 8,
    marginBottom: 25,
  },
  audioTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  audioTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'serif',
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  playButtonWrapper: {
    backgroundColor: '#FFFFFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  progressDot: {
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    position: 'absolute',
    marginLeft: -6, 
  },

  /* ESTILOS DE IMÁGENES */
  imageContainer: {
    width: '100%',
    height: 180,
    borderWidth: 6,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  /* 👇 ESTILOS PARA LA CAJA DE FUENTES 👇 */
  sourcesBox: { 
    padding: 20, 
    marginBottom: 25, 
    borderRadius: 8, 
    borderWidth: 1 
  },
  sourcesHeading: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    fontFamily: 'serif', 
    marginBottom: 8 
  },
  sourcesText: { 
    fontSize: 14, 
    fontFamily: 'serif', 
    lineHeight: 22, 
    fontStyle: 'italic' 
  },

  /* ESTILOS BOTONES INFERIORES */
  timelineButton: {
    width: '100%',
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 5,
  },
  timelineText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  ratingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 15,
    borderRadius: 15,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    marginRight: 5,
  },
  rateButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderRadius: 20,
  },
  rateText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'serif',
  }
});