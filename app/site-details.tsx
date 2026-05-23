import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
// 1. Importamos el traductor
import { useTranslation } from 'react-i18next';

const { height } = Dimensions.get('window');

export default function SiteDetailsScreen() {
  const { colors } = useTheme();
  
  // 2. Activamos el traductor
  const { t } = useTranslation();
  
  // Atrapamos los datos que nos mande cualquier pantalla anterior
  const { title, image, description } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      {/* 🖼️ FONDO: Imagen a pantalla completa 🖼️ */}
      <ImageBackground 
        source={{ uri: image as string }} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Capa oscura para que el texto blanco se lea perfecto */}
        <View style={styles.overlay}>
          
          {/* Botón de Regreso */}
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={32} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.contentContainer}>
            {/* 🏷️ TÍTULO (Viene de la BD, no se traduce aquí) */}
            <Text style={styles.title}>{title}</Text>

            {/* 📝 DESCRIPCIÓN (Si no hay descripción, usa el texto de respaldo traducido) */}
            <Text style={styles.description}>
              {description || t('siteDetails.defaultDescription')}
            </Text>

            {/* 🔘 BOTONES DE MODO 🔘 */}
            <View style={styles.buttonWrapper}>
              <TouchableOpacity 
                style={styles.modeButton}
                onPress={() => router.push({
                  pathname: '/reading-mode',
                  params: {
                    title: title,
                    image: image,
                    legends: "Leyendas: Existe la creencia popular de una red de túneles bajo el templo, supuestamente utilizados durante la Guerra Cristera.",
                    fullText: "La Catedral Metropolitana de Guadalajara, dedicada a la Asunción de María, es un emblema de la ciudad cuya construcción inició en 1561 por orden de Felipe II y concluyó en 1618. Ha resistido múltiples terremotos, destacando la reconstrucción de sus icónicas torres neogóticas en 1854. Combina estilos barroco, morisco y neoclásico."
                  }
                })}
              >
                <Ionicons name="book-outline" size={24} color="#FFFFFF" style={styles.icon} />
                {/* 3. Traducimos el botón de lectura */}
                <Text style={styles.buttonText}>{t('siteDetails.readingMode')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.modeButton}
                onPress={() => router.push({
                  pathname: '/audio-mode',
                  params: {
                    title: title,
                    image: image,
                    image2: 'https://images.unsplash.com/photo-1548625361-ec85d5809eb3?q=80&w=600&auto=format&fit=crop'
                  }
                })}
              >
                <Ionicons name="headset-outline" size={24} color="#FFFFFF" style={styles.icon} />
                {/* 4. Traducimos el botón de audioguía */}
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
    fontSize: 55, 
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginBottom: 10,
    lineHeight: 60,
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