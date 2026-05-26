import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ImageBackground, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const HORAS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTOS = ['00', '15', '30', '45'];

export default function AddSiteScreen() {
  const { date } = useLocalSearchParams(); 
  const { colors, theme } = useTheme();
  
  // 👇 1. Extraemos i18n para saber el idioma actual 👇
  const { t, i18n } = useTranslation();

  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [sitioSeleccionado, setSitioSeleccionado] = useState(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [minutoSeleccionado, setMinutoSeleccionado] = useState('');
  
  const [monumentos, setMonumentos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarMonumentos = async () => {
      // 👇 2. Determinamos el idioma (es o en) 👇
      const currentLang = i18n.language ? i18n.language.substring(0, 2) : 'es';

      try {
        const querySnapshot = await getDocs(collection(db, "monuments"));
        const monumentosTemp = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          let primeraImagen = 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=400'; 
          if (data.imagenesUrls && Array.isArray(data.imagenesUrls) && data.imagenesUrls.length > 0) primeraImagen = data.imagenesUrls[0];
          else if (data.image) primeraImagen = data.image;
          if (typeof primeraImagen === 'object' && primeraImagen.uri) primeraImagen = primeraImagen.uri;

          let calificacionDB = data.calificacionPromedio || data.promedio || data.rating || data.calificacion;
          let ratingFinal = calificacionDB ? Number(calificacionDB).toFixed(1) : t('addSite.newBadge', 'Nuevo');

          // 👇 3. LÓGICA DE TRADUCCIÓN INTELIGENTE PARA EL TÍTULO 👇
          const carpetaTraducciones = data.traducciones || {};
          const datosIdioma = carpetaTraducciones[currentLang] || data[currentLang] || data.es || data || {};

          let titleFinal = datosIdioma.nombre || datosIdioma.name || data.nombre || data.name || 'Sin nombre';

          monumentosTemp.push({
            id: doc.id,
            title: titleFinal, // Guardamos el título traducido
            category: data.category || data.categoria || 'Otros', 
            rating: ratingFinal, 
            image: primeraImagen
          });
        });

        setMonumentos(monumentosTemp);
      } catch (error) {
        console.error("Error al cargar monumentos:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarMonumentos();
    
    // 👇 4. Agregamos i18n.language para recargar al cambiar de idioma 👇
  }, [t, i18n.language]); 

  const abrirModalHora = (sitio) => {
    setSitioSeleccionado(sitio);
    setHoraSeleccionada(''); 
    setMinutoSeleccionado('');
    setModalVisible(true);
  };

  const confirmarAgendado = () => {
    if (!horaSeleccionada || !minutoSeleccionado) {
      alert(t('addSite.alerts.missingTime'));
      return;
    }
    const tiempoFinal = `${horaSeleccionada}:${minutoSeleccionado}`;
    setModalVisible(false);
    
    // SOLUCIÓN: Solo enviamos el ID y el tiempo. Nada de enlaces gigantes.
    router.replace({
      pathname: '/calendar',
      params: {
        nuevoSitioId: sitioSeleccionado.id,
        nuevoSitioTime: tiempoFinal,
        fechaObjetivo: date 
      }
    });
  };

  const monumentosFiltrados = monumentos.filter(lugar => lugar.title.toLowerCase().includes(search.toLowerCase()));
  const monumentosPorCategoria = monumentosFiltrados.reduce((grupos, lugar) => {
    const categoria = lugar.category;
    if (!grupos[categoria]) grupos[categoria] = [];
    grupos[categoria].push(lugar);
    return grupos;
  }, {});
  const categoriasDisponibles = Object.keys(monumentosPorCategoria);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ImageBackground source={require('../assets/images/header_design.png')} style={styles.headerBackground} resizeMode="cover">
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
             <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.logoWrapper}>
            <Image source={require('../assets/images/logo.png')} style={styles.logoImage} />
            <Text style={styles.logoText}>Histour</Text>
          </View>
          <View style={[styles.searchBarContainer, { backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E1E1E' }]}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput placeholder={t('addSite.searchPlaceholder')} placeholderTextColor="#999" style={[styles.searchInput, { color: colors.text }]} value={search} onChangeText={setSearch} />
          </View>
        </View>
      </ImageBackground>

      {cargando ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>
          {categoriasDisponibles.map((categoriaOriginal) => {
            const lugares = monumentosPorCategoria[categoriaOriginal];
            let catKey = 'others';
            const catLower = categoriaOriginal.toLowerCase();
            if (catLower.includes('museo')) catKey = 'museums';
            else if (catLower.includes('iglesia') || catLower.includes('templo')) catKey = 'churches';
            else if (catLower.includes('monumento')) catKey = 'monuments';

            return (
              <View key={categoriaOriginal} style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t(`adminAddMonument.categories.${catKey}`)}</Text>
                <View style={styles.gridRow}>
                  {lugares.map((lugar) => (
                    <TouchableOpacity key={lugar.id} style={styles.card} onPress={() => abrirModalHora(lugar)} activeOpacity={0.8}>
                      <ImageBackground source={{ uri: lugar.image }} style={styles.cardImage} imageStyle={{ borderRadius: 8 }}>
                        <View style={styles.ratingBadge}><Ionicons name="star" size={10} color="#FFFFFF" style={styles.starIcon} /><Text style={styles.ratingText}>{lugar.rating}</Text></View>
                        <View style={styles.cardTitleOverlay}><Text style={styles.cardTitleText} numberOfLines={1}>{lugar.title}</Text></View>
                      </ImageBackground>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme === 'light' ? '#FFFFFF' : colors.card }]}>
            <Ionicons name="time-outline" size={50} color="#4E97D1" style={{ marginBottom: 10 }} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('addSite.modal.title')}</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>{sitioSeleccionado?.title}</Text>
            <Text style={[styles.pickerLabel, { color: colors.text }]}>{t('addSite.modal.hourLabel')}</Text>
            <View style={[styles.pickerContainer, { backgroundColor: theme === 'light' ? '#F0F5FA' : '#121212' }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerScroll}>
                {HORAS.map(hora => <TouchableOpacity key={hora} style={[styles.pickerBubble, { backgroundColor: theme === 'light' ? '#FFFFFF' : '#2C2C2C', borderColor: theme === 'light' ? '#CCCCCC' : '#444444' }, horaSeleccionada === hora && styles.pickerBubbleActive]} onPress={() => setHoraSeleccionada(hora)}><Text style={[styles.pickerText, { color: theme === 'light' ? '#666666' : '#AAAAAA' }, horaSeleccionada === hora && styles.pickerTextActive]}>{hora}</Text></TouchableOpacity>)}
              </ScrollView>
            </View>
            <Text style={[styles.pickerLabel, { color: colors.text }]}>{t('addSite.modal.minuteLabel')}</Text>
            <View style={[styles.pickerContainer, { backgroundColor: theme === 'light' ? '#F0F5FA' : '#121212', marginBottom: 25 }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerScroll}>
                {MINUTOS.map(min => <TouchableOpacity key={min} style={[styles.pickerBubble, { backgroundColor: theme === 'light' ? '#FFFFFF' : '#2C2C2C', borderColor: theme === 'light' ? '#CCCCCC' : '#444444' }, minutoSeleccionado === min && styles.pickerBubbleActive]} onPress={() => setMinutoSeleccionado(min)}><Text style={[styles.pickerText, { color: theme === 'light' ? '#666666' : '#AAAAAA' }, minutoSeleccionado === min && styles.pickerTextActive]}>{min}</Text></TouchableOpacity>)}
              </ScrollView>
            </View>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={[styles.modalButtonCancel, { borderColor: theme === 'light' ? '#999999' : '#666666' }]} onPress={() => setModalVisible(false)}><Text style={[styles.modalButtonCancelText, { color: theme === 'light' ? '#666666' : '#CCCCCC' }]}>{t('addSite.modal.cancelButton')}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonConfirm} onPress={confirmarAgendado}><Text style={styles.modalButtonConfirmText}>{t('addSite.modal.continueButton')}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, headerBackground: { width: '100%', height: 185 }, headerContent: { flex: 1, paddingTop: 35, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.15)' }, backButton: { position: 'absolute', top: 40, left: 20, zIndex: 10 }, logoWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 }, logoImage: { width: 36, height: 36, marginRight: 10, resizeMode: 'contain' }, logoText: { color: '#FFFFFF', fontSize: 30, fontWeight: 'bold', fontFamily: 'serif' }, searchBarContainer: { flexDirection: 'row', width: '85%', height: 42, borderRadius: 25, alignItems: 'center', paddingHorizontal: 15, borderWidth: 3, borderColor: '#4E97D1' }, searchIcon: { marginRight: 10 }, searchInput: { flex: 1, fontSize: 14 }, scrollArea: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }, sectionContainer: { marginBottom: 25 }, sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginLeft: 2, textTransform: 'capitalize' }, gridRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }, card: { width: '48%', height: 110, marginBottom: 15, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 }, cardImage: { width: '100%', height: '100%', justifyContent: 'space-between' }, ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4E97D1', paddingHorizontal: 6, paddingVertical: 3, borderTopLeftRadius: 8, borderBottomRightRadius: 8, alignSelf: 'flex-start' }, starIcon: { marginRight: 3 }, ratingText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }, cardTitleOverlay: { backgroundColor: 'rgba(0, 0, 0, 0.45)', paddingVertical: 5, paddingHorizontal: 8, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }, cardTitleText: { color: '#FFFFFF', fontSize: 12 }, modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }, modalContent: { width: '100%', borderRadius: 15, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 }, modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 }, modalSubtitle: { fontSize: 15, textAlign: 'center', marginBottom: 20, fontStyle: 'italic' }, pickerLabel: { alignSelf: 'flex-start', fontSize: 14, fontWeight: 'bold', marginBottom: 5 }, pickerContainer: { width: '100%', height: 50, marginBottom: 15, borderRadius: 10 }, pickerScroll: { alignItems: 'center', paddingHorizontal: 10 }, pickerBubble: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginHorizontal: 5 }, pickerBubbleActive: { backgroundColor: '#4E97D1', borderColor: '#4E97D1' }, pickerText: { fontSize: 14, fontWeight: 'bold' }, pickerTextActive: { color: '#FFFFFF' }, modalButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' }, modalButtonCancel: { flex: 1, paddingVertical: 12, marginRight: 10, borderRadius: 25, borderWidth: 2, alignItems: 'center' }, modalButtonCancelText: { fontWeight: 'bold', fontSize: 15 }, modalButtonConfirm: { flex: 1, paddingVertical: 12, marginLeft: 10, borderRadius: 25, backgroundColor: '#4E97D1', alignItems: 'center' }, modalButtonConfirmText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 }
});