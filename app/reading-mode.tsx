import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';

// IMPORTACIONES DE FIREBASE (¡Agregamos auth para identificar al usuario!)
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function ReadingModeScreen() {
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

  const [datosBD, setDatosBD] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [idDocumento, setIdDocumento] = useState(idRecibido); 

  const { isFavorite, toggleFavorite } = useFavorites();
  const isCurrentFavorite = isFavorite(tituloRecibido);
  const [rating, setRating] = useState(0);
  const [enviando, setEnviando] = useState(false); 

  // DESCARGAMOS TODA LA INFO
  useEffect(() => {
    const buscarMonumentoEnBD = async () => {
      if (!idRecibido) {
        console.log("No se recibió un ID.");
        setCargando(false);
        return;
      }

      try {
        const docRef = doc(db, "monuments", idRecibido);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDatosBD(data);

          // Si el usuario ya había votado antes, le pintamos sus estrellas
          const user = auth.currentUser;
          if (user && data.userRatings && data.userRatings[user.uid]) {
            setRating(data.userRatings[user.uid]);
          }
        }
      } catch (error) {
        console.error("Error descargando datos para Reading Mode:", error);
      } finally {
        setCargando(false);
      }
    };

    buscarMonumentoEnBD();
  }, [idRecibido]);

  // 👇 SISTEMA DE CALIFICACIÓN ÚNICA POR USUARIO 👇
  const enviarCalificacion = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Debes iniciar sesión en la aplicación para poder calificar.");
      return;
    }

    if (rating === 0) {
      alert(t('readingMode.alerts.emptyRating'));
      return;
    }
    
    if (!idDocumento) {
      alert("Error: No se encontró el ID del monumento para calificar.");
      return;
    }

    setEnviando(true); 

    try {
      const uid = user.uid;
      const calificacionActual = datosBD.calificacionPromedio || 0;
      const totalVotosActuales = datosBD.totalVotos || 0;
      
      // Diccionario de usuarios que ya votaron (si no existe, lo creamos vacío)
      const userRatings = datosBD.userRatings || {};
      
      // Checamos si este usuario en particular ya tenía un voto registrado
      const votoAnterior = userRatings[uid];

      let nuevoTotalVotos = totalVotosActuales;
      let nuevoPromedio = 0;
      const sumaTotalAnterior = calificacionActual * totalVotosActuales;

      if (votoAnterior) {
        // ESCENARIO 1: EL USUARIO ESTÁ MODIFICANDO SU VOTO
        // Restamos su voto viejo de la suma, y le agregamos su voto nuevo
        const sumaCorregida = sumaTotalAnterior - votoAnterior + rating;
        // Como es el mismo usuario, el total de personas no cambia
        nuevoPromedio = nuevoTotalVotos === 0 ? rating : sumaCorregida / nuevoTotalVotos;
      } else {
        // ESCENARIO 2: ES EL PRIMER VOTO DE ESTE USUARIO
        nuevoTotalVotos += 1;
        const nuevaSuma = sumaTotalAnterior + rating;
        nuevoPromedio = nuevaSuma / nuevoTotalVotos;
      }

      // Guardamos o actualizamos su calificación en el diccionario
      userRatings[uid] = rating;

      // Mandamos los datos fresquecitos a Firebase
      const docRef = doc(db, "monuments", idDocumento);
      await updateDoc(docRef, {
        calificacionPromedio: nuevoPromedio,
        totalVotos: nuevoTotalVotos,
        rating: nuevoPromedio, 
        promedio: nuevoPromedio,
        userRatings: userRatings // Guardamos la huella del usuario
      });

      alert(t('readingMode.alerts.successRating', { rating }));
      
      // Actualizamos el estado local para que todo siga funcionando fluido
      setDatosBD(prev => ({
        ...prev,
        calificacionPromedio: nuevoPromedio,
        totalVotos: nuevoTotalVotos,
        userRatings: userRatings
      }));

    } catch (error) {
      console.error("Error al actualizar la calificación:", error);
      alert("Hubo un error al enviar tu calificación. Inténtalo de nuevo.");
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

  // EXTRACCIÓN INTELIGENTE BILINGÜE
  let img1 = desempaquetarSeguro(params.image) || 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=400';
  let img2 = 'https://images.unsplash.com/photo-1548625361-ec85d5809eb3?q=80&w=600';
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
  const textoLeyendas = datosIdioma.leyendas || datosBD?.leyendas || desempaquetarSeguro(params.legends) || "Aún no se han registrado leyendas para este sitio.";
  const textoHistoria = datosIdioma.descripcion || datosIdioma.historia || datosBD?.descripcionCompleta || datosBD?.description || desempaquetarSeguro(params.fullText) || "Aún no se ha registrado la historia completa de este sitio.";

  const tituloCajaHistoria = currentLang === 'en' ? "History and Description" : "Historia y Descripción";
  const tituloCajaLeyendas = currentLang === 'en' ? "Legends" : "Leyendas";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerLeft}>
          <Ionicons name="arrow-back" size={28} color={COLOR_LIGHT_BLUE} />
          <Text style={[styles.headerTitle, { color: COLOR_LIGHT_BLUE }]}>{t('readingMode.title')}</Text>
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

        <View style={[styles.imageContainer, { borderColor: COLOR_DARK_BLUE }]}>
          <Image source={{ uri: img1 }} style={styles.image} />
        </View>

        <View style={[styles.boxDark, { backgroundColor: COLOR_DARK_BLUE }]}>
          <Text style={[styles.sectionHeading, { color: '#FFF' }]}>{tituloCajaLeyendas}</Text>
          <Text style={styles.boxText}>{textoLeyendas}</Text>
        </View>

        <View style={[styles.imageContainer, { borderColor: COLOR_LIGHT_BLUE }]}>
          <Image source={{ uri: img2 }} style={styles.image} />
        </View>

        <View style={[styles.boxLight, { backgroundColor: COLOR_LIGHT_BLUE }]}>
          <Text style={[styles.sectionHeading, { color: '#FFF' }]}>{tituloCajaHistoria}</Text>
          <Text style={styles.boxText}>{textoHistoria}</Text>
        </View>

        <View style={[styles.imageContainer, { borderColor: COLOR_DARK_BLUE }]}>
          <Image source={{ uri: img3 }} style={styles.image} />
        </View>

        <TouchableOpacity 
          style={[styles.timelineButton, { borderColor: COLOR_LIGHT_BLUE, marginTop: 10 }]}
          onPress={() => router.push({
            pathname: '/timeline',
            params: { title: tituloFinal, timelineImage: encodeURIComponent(img1) }
          })}
        >
          <Text style={[styles.timelineText, { color: COLOR_LIGHT_BLUE }]}>{t('readingMode.buttons.timeline')}</Text>
        </TouchableOpacity>

        {/* SECCIÓN DE CALIFICACIÓN */}
        <View style={styles.ratingSection}>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} disabled={enviando}>
                <Ionicons name={star <= rating ? "star" : "star-outline"} size={32} color={COLOR_DARK_BLUE} style={styles.starIcon} />
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
              <Text style={[styles.rateText, { color: COLOR_LIGHT_BLUE }]}>{t('readingMode.buttons.rate')}</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }, headerLeft: { flexDirection: 'row', alignItems: 'center' }, headerTitle: { fontSize: 22, fontWeight: 'bold', fontFamily: 'serif', marginLeft: 10 }, scrollContent: { paddingHorizontal: 20, paddingBottom: 40 }, monumentTitle: { fontSize: 32, fontWeight: 'bold', fontFamily: 'serif', textAlign: 'center', marginBottom: 25, marginTop: 5 }, imageContainer: { width: '100%', height: 220, borderWidth: 4, marginBottom: 25, borderRadius: 8, overflow: 'hidden' }, image: { width: '100%', height: '100%', resizeMode: 'cover' }, boxLight: { padding: 20, marginBottom: 25, borderRadius: 8 }, boxDark: { padding: 20, marginBottom: 25, borderRadius: 8 }, sectionHeading: { fontSize: 20, fontWeight: 'bold', fontFamily: 'serif', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.3)', paddingBottom: 5 }, boxText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'serif', lineHeight: 26, textAlign: 'justify' }, timelineButton: { width: '100%', paddingVertical: 15, borderWidth: 2, borderRadius: 25, alignItems: 'center', marginBottom: 30 }, timelineText: { fontSize: 16, fontWeight: 'bold', fontFamily: 'serif' }, ratingSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.03)', padding: 15, borderRadius: 15 }, starsContainer: { flexDirection: 'row' }, starIcon: { marginRight: 5 }, rateButton: { paddingVertical: 10, paddingHorizontal: 20, borderWidth: 2, borderRadius: 20 }, rateText: { fontSize: 14, fontWeight: 'bold', fontFamily: 'serif' }
});