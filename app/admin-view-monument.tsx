import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// IMPORTACIONES DE FIREBASE
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function AdminViewMonumentScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams();

  const [monumento, setMonumento] = useState(null);
  const [cargando, setCargando] = useState(true);

  // CARGAR DATOS REALES DE FIREBASE
  useEffect(() => {
    const fetchMonument = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "monuments", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMonumento(docSnap.data());
        }
      } catch (error) {
        console.error("Error al cargar:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchMonument();
  }, [id]);

  if (cargando) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // OBTENER DATOS SEGÚN IDIOMA ACTUAL
  const lang = i18n.language?.startsWith('en') ? 'en' : 'es';
  const data = monumento.traducciones?.[lang] || monumento;

  // Convertimos a minúsculas para que coincida exactamente con las llaves de tus archivos .json
  // Si por alguna razón viene vacío, le ponemos 'otros' por defecto para evitar errores.
  const categoriaKey = monumento.categoria ? monumento.categoria.toLowerCase() : 'otros';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{data.nombre}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>{t('adminViewMonument.readonlyMode')}</Text>

          {/* GALERÍA DE IMÁGENES */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminViewMonument.labels.images')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 20}}>
            {monumento.imagenesUrls?.map((url, i) => (
              <Image key={i} source={{ uri: url }} style={styles.galleryImage} />
            ))}
          </ScrollView>

          {/* CAMPOS DE TEXTO */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.name')}</Text>
            <TextInput style={[styles.input, { color: colors.textSecondary, borderBottomColor: colors.border }]} value={data.nombre} editable={false} />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.phrase')}</Text>
            <TextInput style={[styles.input, { color: colors.textSecondary, borderBottomColor: colors.border }]} value={data.frase} editable={false} />
          </View>

          {/* CAMPO CATEGORÍA TRADUCIDO */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.category')}</Text>
            <TextInput 
              style={[styles.input, { color: colors.textSecondary, borderBottomColor: colors.border }]} 
              value={t(`adminAddMonument.categories.${categoriaKey}`)} 
              editable={false} 
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.legends')}</Text>
            <TextInput style={[styles.input, { color: colors.textSecondary, borderBottomColor: colors.border }]} value={data.leyendas} multiline editable={false} />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.description')}</Text>
            <TextInput style={[styles.input, { color: colors.textSecondary, borderBottomColor: colors.border }]} value={data.descripcion} multiline editable={false} />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.locationUrl')}</Text>
            <TextInput style={[styles.input, { color: colors.textSecondary, borderBottomColor: colors.border }]} value={monumento.urlUbicacion} editable={false} />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.historicalSources')}</Text>
            <TextInput style={[styles.input, { color: colors.textSecondary, borderBottomColor: colors.border }]} value={data.fuentes} editable={false} />
          </View>

          {/* LÍNEA DE TIEMPO */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminViewMonument.labels.timeline')}</Text>
          {monumento.timelineUrl ? (
            <Image source={{ uri: monumento.timelineUrl }} style={styles.timelineImage} />
          ) : (
            <Text style={{color: colors.textSecondary, marginBottom: 15}}>{t('adminViewMonument.labels.status.missing')}</Text>
          )}

          {/* AUDIOS */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminViewMonument.labels.audioEs')}</Text>
          <View style={styles.fileButton}>
            <Text style={{color: colors.textSecondary}}>
              {monumento.audiosUrls?.es ? t('adminViewMonument.labels.status.present') : t('adminViewMonument.labels.status.missing')}
            </Text>
          </View>

          <Text style={[styles.inputLabel, { color: colors.text, marginTop: 10 }]}>{t('adminViewMonument.labels.audioEn')}</Text>
          <View style={styles.fileButton}>
            <Text style={{color: colors.textSecondary}}>
              {monumento.audiosUrls?.en ? t('adminViewMonument.labels.status.present') : t('adminViewMonument.labels.status.missing')}
            </Text>
          </View>

        </View>
      </ScrollView>

      {/* PANEL INFERIOR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-dashboard')}><Ionicons name="home" size={22} color="#FFFFFF" /><Text style={styles.navText}>{t('admin.principal')}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-profile')}><Ionicons name="person" size={22} color="#FFFFFF" /><Text style={styles.navText}>{t('admin.perfil')}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-users')}><Ionicons name="settings" size={22} color="#FFFFFF" /><Text style={styles.navText}>{t('admin.usuarios')}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-monuments')}><Ionicons name="library" size={22} color="#FFFFFF" /><Text style={[styles.navText, styles.navTextActive]}>{t('admin.monumentos')}</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative', paddingHorizontal: 50 },
  backButton: { position: 'absolute', left: 20, bottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', textAlign: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  formCard: { padding: 20, borderRadius: 15, borderWidth: 1, elevation: 3 },
  infoText: { fontSize: 12, fontStyle: 'italic', marginBottom: 20, textAlign: 'center' },
  inputWrapper: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  input: { borderBottomWidth: 1, paddingVertical: 8, fontSize: 16 },
  fileButton: { borderBottomWidth: 1, paddingVertical: 10, marginBottom: 10 },
  galleryImage: { width: 100, height: 100, borderRadius: 10, marginRight: 10 },
  timelineImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 20, resizeMode: 'contain' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#0A2342', height: 75, paddingBottom: 10, position: 'absolute', bottom: 0, width: '100%' },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navText: { fontSize: 9, color: '#FFFFFF', textAlign: 'center', marginTop: 4 },
  navTextActive: { fontWeight: 'bold' }
});