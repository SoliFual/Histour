import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// IMPORTACIONES DE FIREBASE
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';

// LLAVE DE LA API DE TRADUCCIÓN
const TRANSLATION_API_KEY = "AIzaSyDWG8cLxDpNYcQj4oO1wDmjGt3IAIWST6o";

export default function AdminModifyMonumentScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation(); // Agregamos i18n para saber el idioma actual
  
  const { id } = useLocalSearchParams(); 

  // ESTADOS DE TEXTO
  const [nombre, setNombre] = useState('');
  const [frase, setFrase] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [leyendas, setLeyendas] = useState('');
  const [fuentes, setFuentes] = useState('');
  const [urlUbicacion, setUrlUbicacion] = useState('');
  const [categoria, setCategoria] = useState('Monumentos');
  const [showCat, setShowCat] = useState(false);
  
  // ESTADOS PARA ARCHIVOS MULTIMEDIA NUEVOS (Local)
  const [nuevasImagenesUris, setNuevasImagenesUris] = useState([]);
  const [timelineUri, setTimelineUri] = useState(null);
  const [audioEsUri, setAudioEsUri] = useState(null);
  const [audioEsName, setAudioEsName] = useState('');
  const [audioEnUri, setAudioEnUri] = useState(null);
  const [audioEnName, setAudioEnName] = useState('');

  // ESTADOS PARA ARCHIVOS MULTIMEDIA EXISTENTES (Firebase URLs)
  const [imagenesUrls, setImagenesUrls] = useState([]);
  const [timelineUrl, setTimelineUrl] = useState('');
  const [audioEsUrl, setAudioEsUrl] = useState('');
  const [audioEnUrl, setAudioEnUrl] = useState('');
  
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const categorias = ['Museos', 'Iglesias', 'Monumentos', 'Otros'];

  // EFECTO: CARGAR DATOS EN EL IDIOMA CORRECTO
  useEffect(() => {
    const fetchMonument = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "monuments", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Detectar idioma actual de la app ('en' o 'es')
          const currentLang = i18n.language?.startsWith('en') ? 'en' : 'es';
          
          // Buscar en la carpeta de traducciones, si no existe, usar la raíz por compatibilidad
          const textos = data.traducciones?.[currentLang] || data;

          setNombre(textos.nombre || data.nombre || '');
          setFrase(textos.frase || data.frase || '');
          setDescripcion(textos.descripcion || data.descripcion || '');
          setLeyendas(textos.leyendas || data.leyendas || '');
          setFuentes(textos.fuentes || data.fuentes || '');
          
          setUrlUbicacion(data.urlUbicacion || '');
          setCategoria(data.categoria || 'Monumentos');
          
          // Cargar URLs existentes
          setImagenesUrls(data.imagenesUrls || []);
          setTimelineUrl(data.timelineUrl || '');
          setAudioEsUrl(data.audiosUrls?.es || '');
          setAudioEnUrl(data.audiosUrls?.en || '');
        } else {
          Alert.alert("Error", "No se encontró el monumento");
          router.back();
        }
      } catch (error) {
        console.error("Error al cargar monumento:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchMonument();
  }, [id, i18n.language]);

  const translateText = async (text, targetLang) => {
    if (!text) return "";
    try {
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${TRANSLATION_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, target: targetLang }) // Sin source, detecta solo
      });
      const data = await response.json();
      return data.data.translations[0].translatedText;
    } catch (error) {
      console.error("Error en traducción automática:", error);
      return text;
    }
  };

  // FUNCIONES DE MULTIMEDIA (Adaptadas para no sobreescribir)
  const totalImagenes = imagenesUrls.length + nuevasImagenesUris.length;

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 3 - totalImagenes, // Solo deja subir las que falten para llegar a 3
      quality: 0.7,
    });
    if (!result.canceled) {
      const uris = result.assets.map(asset => asset.uri);
      setNuevasImagenesUris(prev => [...prev, ...uris]);
    }
  };

  const pickTimeline = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setTimelineUri(result.assets[0].uri);
      setTimelineUrl(''); // Si sube una nueva, quitamos la vieja
    }
  };

  const pickAudioEs = async () => {
    let result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
    if (!result.canceled && result.assets.length > 0) {
      setAudioEsUri(result.assets[0].uri);
      setAudioEsName(result.assets[0].name);
      setAudioEsUrl('');
    }
  };

  const pickAudioEn = async () => {
    let result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
    if (!result.canceled && result.assets.length > 0) {
      setAudioEnUri(result.assets[0].uri);
      setAudioEnName(result.assets[0].name);
      setAudioEnUrl('');
    }
  };

  const uploadFile = async (uri, folder) => {
    if (!uri) return null;
    const response = await fetch(uri);
    const blob = await response.blob();
    const extension = uri.split('.').pop() || (folder.includes('audios') ? 'mp3' : 'jpg');
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleGuardarCambios = async () => {
    if (!nombre || !descripcion) {
      Alert.alert(t('adminAddMonument.errorTitle'), t('adminAddMonument.errorIncomplete'));
      return;
    }
    setGuardando(true);
    
    try {
      // 1. Conservar las imágenes viejas que no se borraron y subir las nuevas
      let urlsDeImagenesFinales = [...imagenesUrls];
      for (let uri of nuevasImagenesUris) {
        const url = await uploadFile(uri, 'monuments');
        urlsDeImagenesFinales.push(url);
      }

      // 2. Subir Timeline y Audios (solo si hay nuevos, si no se conservan o se quedan vacíos)
      const timelineUrlFinal = timelineUri ? await uploadFile(timelineUri, 'timelines') : timelineUrl;
      const audioEsLinkFinal = audioEsUri ? await uploadFile(audioEsUri, 'audios_es') : audioEsUrl;
      const audioEnLinkFinal = audioEnUri ? await uploadFile(audioEnUri, 'audios_en') : audioEnUrl;

      // 3. Traducciones (No importa el idioma en el que el admin haya escrito)
      const nombreEn = await translateText(nombre, 'en');
      const fraseEn = await translateText(frase, 'en');
      const descripcionEn = await translateText(descripcion, 'en');
      const leyendasEn = await translateText(leyendas, 'en');
      const fuentesEn = await translateText(fuentes, 'en');

      const nombreEs = await translateText(nombre, 'es');
      const fraseEs = await translateText(frase, 'es');
      const descripcionEs = await translateText(descripcion, 'es');
      const leyendasEs = await translateText(leyendas, 'es');
      const fuentesEs = await translateText(fuentes, 'es');

      const traducciones = {
        es: { nombre: nombreEs, frase: fraseEs, descripcion: descripcionEs, leyendas: leyendasEs, fuentes: fuentesEs },
        en: { nombre: nombreEn, frase: fraseEn, descripcion: descripcionEn, leyendas: leyendasEn, fuentes: fuentesEn }
      };
      
      const docRef = doc(db, "monuments", id);
      await updateDoc(docRef, {
        categoria,
        urlUbicacion,
        imagenesUrls: urlsDeImagenesFinales,
        timelineUrl: timelineUrlFinal || "",
        
        // Guardamos también en raíz para evitar problemas estructurales
        nombre, frase, descripcion, leyendas, fuentes,
        
        traducciones: traducciones,
        
        audiosUrls: {
          es: audioEsLinkFinal || "",
          en: audioEnLinkFinal || ""
        },
        
        updatedAt: new Date(),
        actualizadoPor: "admin_sistema"
      });
      
      const mensaje = t('adminModifyMonument.alerts.successMessage', { name: nombre });
      if (Platform.OS === 'web') {
        alert(mensaje);
        router.replace('/admin-monuments');
      } else {
        Alert.alert(t('adminModifyMonument.alerts.successTitle'), mensaje, [
          { text: t('adminModifyMonument.alerts.accept'), onPress: () => router.replace('/admin-monuments') }
        ]);
      }
      
    } catch (error) {
      console.error("Error al actualizar:", error);
      Alert.alert("Error", "No se pudieron guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.text }}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('adminModifyMonument.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          
          {/* TEXTOS */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.name')}</Text>
            <TextInput style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]} value={nombre} onChangeText={setNombre} />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.phrase')}</Text>
            <TextInput style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]} value={frase} onChangeText={setFrase} />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.category')}</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowCat(!showCat)}>
              <Text style={{color: colors.text}}>{categoria}</Text>
              <Ionicons name={showCat ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
            </TouchableOpacity>
            {showCat && categorias.map(cat => (
              <TouchableOpacity key={cat} style={styles.option} onPress={() => {setCategoria(cat); setShowCat(false);}}>
                <Text style={{color: colors.text}}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.legends')}</Text>
            <TextInput style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]} value={leyendas} onChangeText={setLeyendas} multiline />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.description')}</Text>
            <TextInput style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]} value={descripcion} onChangeText={setDescripcion} multiline />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.locationUrl')}</Text>
            <TextInput style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]} value={urlUbicacion} onChangeText={setUrlUbicacion} />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.historicalSources')}</Text>
            <TextInput style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]} value={fuentes} onChangeText={setFuentes} />
          </View>

          {/* SECCIÓN MULTIMEDIA CON BORRADO GRANULAR */}
          <Text style={[styles.inputLabel, { color: colors.text, marginTop: 10 }]}>Imágenes (Max 3)</Text>
          <View style={styles.mediaGrid}>
            {/* Imágenes que ya están en Firebase */}
            {imagenesUrls.map((url, index) => (
              <View key={`fb-${index}`} style={styles.imageWrapper}>
                <Image source={{ uri: url }} style={styles.previewImageSmall} />
                <TouchableOpacity style={styles.deleteIcon} onPress={() => setImagenesUrls(prev => prev.filter((_, i) => i !== index))}>
                  <Ionicons name="close-circle" size={24} color="#FF4C4C" />
                </TouchableOpacity>
              </View>
            ))}
            {/* Imágenes nuevas locales */}
            {nuevasImagenesUris.map((uri, index) => (
              <View key={`loc-${index}`} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.previewImageSmall} />
                <TouchableOpacity style={styles.deleteIcon} onPress={() => setNuevasImagenesUris(prev => prev.filter((_, i) => i !== index))}>
                  <Ionicons name="close-circle" size={24} color="#FF4C4C" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          {totalImagenes < 3 && (
            <TouchableOpacity style={styles.fileButton} onPress={pickImages}>
              <Text style={{color: '#333'}}>Agregar más imágenes (+{3 - totalImagenes})</Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.inputLabel, { color: colors.text, marginTop: 15 }]}>Línea de Tiempo</Text>
          {(timelineUrl || timelineUri) ? (
            <View style={styles.singleMediaWrapper}>
              <Image source={{ uri: timelineUri || timelineUrl }} style={styles.previewImage} />
              <TouchableOpacity style={styles.deleteSingleIcon} onPress={() => { setTimelineUrl(''); setTimelineUri(null); }}>
                <Ionicons name="trash" size={24} color="#FF4C4C" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.fileButton} onPress={pickTimeline}>
              <Text style={{color: '#333'}}>{t('adminAddMonument.buttons.addTimeline')}</Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.inputLabel, { color: colors.text, marginTop: 15 }]}>Audios (MP3 / OGG)</Text>
          
          {/* Audio ES */}
          {(audioEsUrl || audioEsUri) ? (
            <View style={styles.audioRow}>
              <Text style={{color: colors.text, flex: 1}}>ES: {audioEsName || "Audio actual"} ✅</Text>
              <TouchableOpacity onPress={() => { setAudioEsUrl(''); setAudioEsUri(null); }}>
                <Ionicons name="trash" size={24} color="#FF4C4C" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.fileButton} onPress={pickAudioEs}>
              <Text style={{color: '#333'}}>{t('adminAddMonument.buttons.addAudioEs')}</Text>
            </TouchableOpacity>
          )}

          {/* Audio EN */}
          {(audioEnUrl || audioEnUri) ? (
            <View style={styles.audioRow}>
              <Text style={{color: colors.text, flex: 1}}>EN: {audioEnName || "Audio actual"} ✅</Text>
              <TouchableOpacity onPress={() => { setAudioEnUrl(''); setAudioEnUri(null); }}>
                <Ionicons name="trash" size={24} color="#FF4C4C" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.fileButton} onPress={pickAudioEn}>
              <Text style={{color: '#333'}}>{t('adminAddMonument.buttons.addAudioEn')}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionItem} onPress={() => router.back()}>
              <Ionicons name="close-circle-outline" size={50} color="#FF4C4C" />
              <Text style={[styles.actionText, { color: colors.text }]}>{t('adminModifyMonument.buttons.cancel')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem} onPress={handleGuardarCambios} disabled={guardando}>
              {guardando ? (
                <ActivityIndicator size="large" color="#4CAF50" />
              ) : (
                <Ionicons name="checkmark-circle-outline" size={50} color="#4CAF50" />
              )}
              <Text style={[styles.actionText, { color: colors.text }]}>
                {guardando ? "Guardando..." : t('adminModifyMonument.buttons.save')}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

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
  header: { paddingTop: 50, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  backButton: { position: 'absolute', left: 20, bottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  formCard: { padding: 20, borderRadius: 15, borderWidth: 1, elevation: 3 },
  inputWrapper: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  input: { borderBottomWidth: 2, paddingVertical: 8, fontSize: 16 },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 2, borderColor: '#4E97D1' },
  option: { padding: 10, borderBottomWidth: 1 },
  fileButton: { alignItems: 'center', padding: 15, backgroundColor: '#E0E0E0', borderRadius: 8, marginBottom: 10 },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 },
  imageWrapper: { position: 'relative', width: 80, height: 80 },
  previewImageSmall: { width: '100%', height: '100%', borderRadius: 10 },
  deleteIcon: { position: 'absolute', top: -10, right: -10, backgroundColor: 'white', borderRadius: 12 },
  singleMediaWrapper: { position: 'relative', width: 120, height: 120, alignSelf: 'center', marginBottom: 15 },
  previewImage: { width: '100%', height: '100%', borderRadius: 10 },
  deleteSingleIcon: { position: 'absolute', top: -10, right: -10, backgroundColor: 'white', borderRadius: 12, padding: 2 },
  audioRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', padding: 15, borderRadius: 8, marginBottom: 10 },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 },
  actionItem: { alignItems: 'center' },
  actionText: { marginTop: 5, fontWeight: '600', fontSize: 14 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#0A2342', height: 75, paddingBottom: 10, position: 'absolute', bottom: 0, width: '100%' },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navText: { fontSize: 9, color: '#FFFFFF', textAlign: 'center', marginTop: 4 },
  navTextActive: { fontWeight: 'bold' }
});