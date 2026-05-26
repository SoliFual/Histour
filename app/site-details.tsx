import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// IMPORTACIONES DE FIREBASE
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const { height } = Dimensions.get('window');

// Súper decodificador por si el enlace llega con doble empaquetado
const desempaquetarSeguro = (textoBase) => {
  if (!textoBase) return '';
  let str = Array.isArray(textoBase) ? textoBase[0] : textoBase;
  let iteraciones = 0;
  while (str.includes('%') && iteraciones < 3) {
    try {
      const decodificado = decodeURIComponent(str);
      if (decodificado === str) break;
      str = decodificado;
    } catch (e) {
      break;
    }
    iteraciones++;
  }
  return str;
};

export default function SiteDetailsScreen() {
  const { colors } = useTheme();
  
  // Extraemos el idioma (cortamos a 2 letras por seguridad: 'en' o 'es')
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language ? i18n.language.substring(0, 2) : 'es'; 
  
  // Atrapamos los datos básicos
  const params = useLocalSearchParams();
  const idSitio = desempaquetarSeguro(params.id);
  const tituloPreliminar = desempaquetarSeguro(params.title);
  const imagenPreliminar = desempaquetarSeguro(params.image);

  // ESTADOS
  const [datosSitio, setDatosSitio] = useState(null);
  const [cargando, setCargando] = useState(true);

  // DESCARGAMOS LA INFORMACIÓN COMPLETA DESDE FIREBASE
  useEffect(() => {
    const cargarDetalles = async () => {
      if (!idSitio) {
        setCargando(false);
        return;
      }
      try {
        const docRef = doc(db, "monuments", idSitio);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setDatosSitio(docSnap.data());
        }
      } catch (error) {
        console.error("Error al cargar detalles profundos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDetalles();
  }, [idSitio]); 

  if (cargando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  // 👇 DATOS REALES DE FIREBASE BILINGÜES 👇

  // 1. IMAGEN
  let imagenFinal = imagenPreliminar;
  if (datosSitio?.imagenesUrls && datosSitio.imagenesUrls.length > 0) {
    imagenFinal = typeof datosSitio.imagenesUrls[0] === 'object' ? datosSitio.imagenesUrls[0].uri : datosSitio.imagenesUrls[0];
  } else if (datosSitio?.image) {
    imagenFinal = datosSitio.image;
  }

  // 👇 2. EL TRUCO: BUSCAMOS EN TU NUEVA CARPETA "traducciones" 👇
  const carpetaTraducciones = datosSitio?.traducciones || {};
  const datosIdioma = carpetaTraducciones[currentLang] || datosSitio?.[currentLang] || datosSitio?.es || datosSitio || {};

  // 3. TÍTULO COMPLETO
  const tituloFinal = datosIdioma.nombre || datosIdioma.name || datosSitio?.nombre || datosSitio?.name || tituloPreliminar;

  // 4. LA FRASE CORTA
  const fraseCorta = datosIdioma.frase || datosSitio?.frase || t('siteDetails.defaultDescription');

  // 5. TEXTOS PROFUNDOS
  const textoCompleto = datosIdioma.descripcion || datosIdioma.historia || datosSitio?.descripcionCompleta || datosSitio?.historia || datosSitio?.description || "No hay información histórica disponible.";
  const leyendas = datosIdioma.leyendas || datosSitio?.leyendas || datosSitio?.curiosidades || "No se han registrado leyendas para este sitio.";
  
  let segundaImagen = 'https://images.unsplash.com/photo-1548625361-ec85d5809eb3?q=80&w=600&auto=format&fit=crop';
  if (datosSitio?.imagenesUrls && datosSitio.imagenesUrls.length > 1) {
    segundaImagen = typeof datosSitio.imagenesUrls[1] === 'object' ? datosSitio.imagenesUrls[1].uri : datosSitio.imagenesUrls[1];
  }

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={{ uri: imagenFinal }} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={32} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.contentContainer}>
            
            <Text style={styles.title}>{tituloFinal}</Text>

            <Text style={styles.description}>
              {fraseCorta}
            </Text>

            <View style={styles.buttonWrapper}>
              
              <TouchableOpacity 
                style={styles.modeButton}
                onPress={() => router.push({
                  pathname: '/reading-mode',
                  params: {
                    id: idSitio,
                    title: tituloFinal, 
                    image: imagenFinal,
                    legends: leyendas, 
                    fullText: textoCompleto 
                  }
                })}
              >
                <Ionicons name="book-outline" size={24} color="#FFFFFF" style={styles.icon} />
                <Text style={styles.buttonText}>{t('siteDetails.readingMode')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.modeButton}
                onPress={() => router.push({
                  pathname: '/audio-mode',
                  params: {
                    id: idSitio,
                    title: tituloFinal, 
                    image: imagenFinal,
                    image2: segundaImagen,
                    fullText: textoCompleto 
                  }
                })}
              >
                <Ionicons name="headset-outline" size={24} color="#FFFFFF" style={styles.icon} />
                <Text style={styles.buttonText}>{t('siteDetails.audioMode')}</Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  backgroundImage: { width: '100%', height: '100%' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)', 
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 50,
  },
  backButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
  },
  contentContainer: {
    width: '100%',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 50, 
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginBottom: 10,
    lineHeight: 52,
  },
  description: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'serif',
    lineHeight: 26,
    marginBottom: 40,
    opacity: 0.9,
  },
  buttonWrapper: {
    gap: 15,
  },
  modeButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.25)', 
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  icon: { marginRight: 15 },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  }
});