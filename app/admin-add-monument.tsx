import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// IMPORTACIONES DE FIREBASE
import { addDoc, collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';

// LLAVE DE LA API DE TRADUCCIÓN
const TRANSLATION_API_KEY = "AIzaSyDWG8cLxDpNYcQj4oO1wDmjGt3IAIWST6o";

export default function AdminAddMonumentScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // ESTADOS DE TEXTO
  const [nombre, setNombre] = useState('');
  const [frase, setFrase] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [leyendas, setLeyendas] = useState('');
  const [fuentes, setFuentes] = useState('');

  const [urlUbicacion, setUrlUbicacion] = useState('');
  const [categoria, setCategoria] = useState('Monumentos');
  const [showCat, setShowCat] = useState(false);
  
  // ESTADOS PARA ARCHIVOS MULTIMEDIA
  const [imagenesUris, setImagenesUris] = useState([]);
  const [timelineUri, setTimelineUri] = useState(null);
  const [audioEsUri, setAudioEsUri] = useState(null);
  const [audioEsName, setAudioEsName] = useState('');
  const [audioEnUri, setAudioEnUri] = useState(null);
  const [audioEnName, setAudioEnName] = useState('');
  
  const [cargando, setCargando] = useState(false);

  const categorias = [
    { id: 'Museos', name: t('adminAddMonument.categories.museums') },
    { id: 'Iglesias', name: t('adminAddMonument.categories.churches') },
    { id: 'Monumentos', name: t('adminAddMonument.categories.monuments') },
    { id: 'Otros', name: t('adminAddMonument.categories.others') }
  ];

  const categoriaSeleccionadaNombre = categorias.find(c => c.id === categoria)?.name || categoria;

  // FUNCIÓN TRADUCTORA PLAN B (Detecta el idioma automáticamente)
  const translateText = async (text, targetLang) => {
    if (!text) return "";
    try {
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${TRANSLATION_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, target: targetLang }) // Sin "source", Google lo detecta solo
      });
      const data = await response.json();
      return data.data.translations[0].translatedText;
    } catch (error) {
      console.error("Error en traducción automática:", error);
      return text; // Si falla, guarda el original para que no se pierda el dato
    }
  };

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 3,
      quality: 0.7,
    });
    if (!result.canceled) {
      const uris = result.assets.slice(0, 3).map(asset => asset.uri);
      setImagenesUris(uris);
    }
  };

  const pickTimeline = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setTimelineUri(result.assets[0].uri);
  };

  const pickAudioEs = async () => {
    let result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
    if (!result.canceled && result.assets.length > 0) {
      setAudioEsUri(result.assets[0].uri);
      setAudioEsName(result.assets[0].name);
    }
  };

  const pickAudioEn = async () => {
    let result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
    if (!result.canceled && result.assets.length > 0) {
      setAudioEnUri(result.assets[0].uri);
      setAudioEnName(result.assets[0].name);
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

  const handleCrear = async () => {
    if (!nombre || !descripcion || imagenesUris.length === 0) {
      Alert.alert(t('adminAddMonument.errorTitle'), t('adminAddMonument.errorIncomplete'));
      return;
    }
    setCargando(true);
    
    try {
      let nuevoIdSecuencial = "#M001";
      const q = query(collection(db, "monuments"), orderBy("createdAt", "desc"), limit(1));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const ultimoDoc = snapshot.docs[0].data();
        if (ultimoDoc.monumentoId && ultimoDoc.monumentoId.startsWith("#M")) {
          const ultimoNumero = parseInt(ultimoDoc.monumentoId.replace("#M", ""));
          nuevoIdSecuencial = `#M${String(ultimoNumero + 1).padStart(3, '0')}`;
        }
      }

      let urlsDeImagenesSubidas = [];
      for (let uri of imagenesUris) {
        const url = await uploadFile(uri, 'monuments');
        urlsDeImagenesSubidas.push(url);
      }
      const timelineUrl = await uploadFile(timelineUri, 'timelines');
      const audioEsLink = await uploadFile(audioEsUri, 'audios_es');
      const audioEnLink = await uploadFile(audioEnUri, 'audios_en');

      // --- EJECUCIÓN DEL PLAN B: TRADUCCIÓN BIDIRECCIONAL ---
      
      // 1. Generamos la versión en Inglés
      const nombreEn = await translateText(nombre, 'en');
      const fraseEn = await translateText(frase, 'en');
      const descripcionEn = await translateText(descripcion, 'en');
      const leyendasEn = await translateText(leyendas, 'en');
      const fuentesEn = await translateText(fuentes, 'en');

      // 2. Generamos la versión en Español (Google detecta si el original era inglés)
      const nombreEs = await translateText(nombre, 'es');
      const fraseEs = await translateText(frase, 'es');
      const descripcionEs = await translateText(descripcion, 'es');
      const leyendasEs = await translateText(leyendas, 'es');
      const fuentesEs = await translateText(fuentes, 'es');

      const traducciones = {
        es: {
          nombre: nombreEs,
          frase: fraseEs,
          descripcion: descripcionEs,
          leyendas: leyendasEs,
          fuentes: fuentesEs
        },
        en: {
          nombre: nombreEn,
          frase: fraseEn,
          descripcion: descripcionEn,
          leyendas: leyendasEn,
          fuentes: fuentesEn
        }
      };
      
      // EL DOCUMENTO BASE (Ahora incluye las traducciones armadas)
      await addDoc(collection(db, "monuments"), {
        monumentoId: nuevoIdSecuencial,
        categoria,
        urlUbicacion,
        imagenesUrls: urlsDeImagenesSubidas,
        timelineUrl: timelineUrl || "",
        
        // Se mantienen en la raíz por compatibilidad
        nombre,
        frase,
        descripcion,
        leyendas,
        fuentes,
        
        // Estructura de traducciones inteligente
        traducciones: traducciones,
        
        audiosUrls: {
          es: audioEsLink || "",
          en: audioEnLink || ""
        },
        
        createdAt: new Date(),
        status: "activo",
        visitas: 0,
        creadoPor: "admin_sistema"
      });
      
      Alert.alert(t('adminAddMonument.successTitle'), `${t('adminAddMonument.successMessage')} ${nuevoIdSecuencial}`);
      router.replace('/admin-monuments');
      
    } catch (error) {
      console.error("Error al guardar:", error);
      Alert.alert(t('adminAddMonument.errorTitle'), t('adminAddMonument.errorSave'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>{t('adminAddMonument.title')}</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          
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
               <Text style={{color: colors.text}}>{categoriaSeleccionadaNombre}</Text>
               <Ionicons name={showCat ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
             </TouchableOpacity>
             {showCat && categorias.map(cat => (
               <TouchableOpacity key={cat.id} style={styles.option} onPress={() => {setCategoria(cat.id); setShowCat(false);}}>
                 <Text style={{color: colors.text}}>{cat.name}</Text>
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
          
          {/* BOTONES MULTIMEDIA */}
          <TouchableOpacity style={styles.fileButton} onPress={pickImages}>
            <Text style={{color: '#333'}}>{imagenesUris.length > 0 ? t('adminAddMonument.buttons.imagesLoaded', { count: imagenesUris.length }) : t('adminAddMonument.buttons.addImages')}</Text>
          </TouchableOpacity>
          {imagenesUris.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              {imagenesUris.map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.previewImageSmall} />
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.fileButton} onPress={pickTimeline}>
            <Text style={{color: '#333'}}>{timelineUri ? t('adminAddMonument.buttons.timelineLoaded') : t('adminAddMonument.buttons.addTimeline')}</Text>
          </TouchableOpacity>
          {timelineUri && <Image source={{ uri: timelineUri }} style={styles.previewImage} />}

          <TouchableOpacity style={styles.fileButton} onPress={pickAudioEs}>
            <Text style={{color: '#333'}}>{audioEsUri ? `ES: ${audioEsName} ✅` : t('adminAddMonument.buttons.addAudioEs')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.fileButton} onPress={pickAudioEn}>
            <Text style={{color: '#333'}}>{audioEnUri ? `EN: ${audioEnName} ✅` : t('adminAddMonument.buttons.addAudioEn')}</Text>
          </TouchableOpacity>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionItem} onPress={() => router.back()}>
              <Ionicons name="close-circle-outline" size={50} color="#FF4C4C" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={handleCrear} disabled={cargando}>
              {cargando ? <ActivityIndicator color="#4CAF50" /> : <Ionicons name="checkmark-circle-outline" size={50} color="#4CAF50" />}
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingBottom: 20, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  formCard: { padding: 20, borderRadius: 15, borderWidth: 1, elevation: 3 },
  inputWrapper: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  input: { borderBottomWidth: 2, paddingVertical: 8, fontSize: 16 },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 2, borderColor: '#4E97D1' },
  option: { padding: 10, borderBottomWidth: 1 },
  fileButton: { alignItems: 'center', padding: 15, backgroundColor: '#E0E0E0', borderRadius: 8, marginBottom: 10 },
  imagePreviewContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 15 },
  previewImageSmall: { width: 70, height: 70, borderRadius: 10 },
  previewImage: { width: 100, height: 100, marginBottom: 15, alignSelf: 'center', borderRadius: 10 },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  actionItem: { alignItems: 'center' },
});