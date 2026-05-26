import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, ImageBackground, Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// IMPORTACIONES DE FIREBASE
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

const { width } = Dimensions.get('window');

export default function CalendarScreen() {
  const { colors, theme } = useTheme();
  const params = useLocalSearchParams();
  
  // 👇 1. Extraemos el traductor y el idioma actual 👇
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'es'; // 'es' o 'en'

  const fechaActual = new Date(); 
  const mesActualReal = fechaActual.getMonth();
  const anioActualReal = fechaActual.getFullYear();

  const [mesVisible, setMesVisible] = useState(mesActualReal);
  const [anioVisible, setAnioVisible] = useState(anioActualReal);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [itinerarioDia, setItinerarioDia] = useState([]);
  
  const [baseDeDatos, setBaseDeDatos] = useState({}); 
  const [datosCargados, setDatosCargados] = useState(false);

  const mesesTraducidos = t('calendar.months', { returnObjects: true });
  const diasTraducidos = t('calendar.days', { returnObjects: true });

  // CARGA DE ITINERARIOS
  useEffect(() => {
    const cargarItinerarios = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const querySnapshot = await getDocs(collection(db, "users", user.uid, "itinerarios"));
          const itinerariosFirebase = {};
          
          querySnapshot.forEach((documento) => {
            itinerariosFirebase[documento.id] = documento.data().lugares || [];
          });
          
          setBaseDeDatos(itinerariosFirebase);
        } catch (error) {
          console.error("Error al cargar itinerarios:", error);
        }
      }
      setDatosCargados(true); 
    };

    cargarItinerarios();
  }, []);

  // AGREGAR NUEVO SITIO AL CALENDARIO
  useEffect(() => {
    if (!datosCargados || !params.nuevoSitioId || !params.fechaObjetivo) return;

    const procesarNuevoSitio = async () => {
      const idSitio = Array.isArray(params.nuevoSitioId) ? params.nuevoSitioId[0] : params.nuevoSitioId;
      const fecha = Array.isArray(params.fechaObjetivo) ? params.fechaObjetivo[0] : params.fechaObjetivo;
      const time = Array.isArray(params.nuevoSitioTime) ? params.nuevoSitioTime[0] : params.nuevoSitioTime || '12:00';

      try {
        const sitioRef = doc(db, "monuments", idSitio);
        const sitioSnap = await getDoc(sitioRef);

        if (!sitioSnap.exists()) {
          console.log("No se encontró el sitio en la BD");
          return;
        }

        const data = sitioSnap.data();
        
        // 👇 2. LÓGICA BILINGÜE PARA EXTRAER LOS DATOS 👇
        const datosIdioma = data[currentLang] || data.es || data;

        // Buscamos el título en el idioma actual, si no, usamos el general
        const title = datosIdioma.nombre || datosIdioma.name || data.name || data.nombre || 'Sin nombre';
        
        // Buscamos la dirección en el idioma actual
        const address = datosIdioma.direccion || datosIdioma.address || datosIdioma.ubicacion || data.direccion || data.ubicacion || data.address || '';
        
        const urlMapa = data.urlUbicacion || data.urlMaps || data.mapa || '';

        let image = 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=400';
        if (data.imagenesUrls && Array.isArray(data.imagenesUrls) && data.imagenesUrls.length > 0) image = data.imagenesUrls[0];
        else if (data.image) image = data.image;
        if (typeof image === 'object' && image.uri) image = image.uri;

        const baseActualizada = { ...baseDeDatos };
        if (!baseActualizada[fecha]) baseActualizada[fecha] = [];

        const yaExiste = baseActualizada[fecha].some(lugar => lugar.id.includes(idSitio));
        
        if (!yaExiste) {
          const nuevoLugar = {
            id: idSitio + '-' + Date.now(), 
            title: title,
            url: urlMapa, 
            address: address, 
            time: time,
            checked: false, 
            image: image 
          };
          
          baseActualizada[fecha] = [...baseActualizada[fecha], nuevoLugar].sort((a, b) => a.time.localeCompare(b.time));
          
          setBaseDeDatos(baseActualizada);
          setItinerarioDia(baseActualizada[fecha]);
          setDiaSeleccionado(fecha);
          setSidebarVisible(true);

          const user = auth.currentUser;
          if (user) {
            const docRef = doc(db, "users", user.uid, "itinerarios", fecha);
            await setDoc(docRef, { lugares: baseActualizada[fecha] }, { merge: true });
          }
        } else {
          setItinerarioDia(baseActualizada[fecha]);
          setDiaSeleccionado(fecha);
          setSidebarVisible(true);
        }
      } catch (error) {
        console.error("Error al procesar el nuevo sitio:", error);
      }
    };

    procesarNuevoSitio();
  }, [datosCargados, params.nuevoSitioId, params.fechaObjetivo, params.nuevoSitioTime, currentLang]); 
  // ↑ Agregué currentLang a las dependencias para que recalcule si cambias de idioma.

  const toggleCheck = async (fecha, lugarId) => {
    const baseActualizada = { ...baseDeDatos };
    const indice = baseActualizada[fecha].findIndex(l => l.id === lugarId);
    
    if (indice !== -1) {
      baseActualizada[fecha][indice].checked = !baseActualizada[fecha][indice].checked;
      setBaseDeDatos(baseActualizada);
      setItinerarioDia([...baseActualizada[fecha]]);

      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid, "itinerarios", fecha);
        await setDoc(docRef, { lugares: baseActualizada[fecha] }, { merge: true });
      }
    }
  };

  const cambiarMes = (direccion) => {
    let nuevoMes = mesVisible + direccion;
    let nuevoAnio = anioVisible;
    if (nuevoMes > 11) { nuevoMes = 0; nuevoAnio++; } 
    else if (nuevoMes < 0) { nuevoMes = 11; nuevoAnio--; }
    setMesVisible(nuevoMes);
    setAnioVisible(nuevoAnio);
  };

  const obtenerDiasDelMes = () => {
    const diasEnMes = new Date(anioVisible, mesVisible + 1, 0).getDate();
    let primerDiaMes = new Date(anioVisible, mesVisible, 1).getDay() - 1;
    if (primerDiaMes === -1) primerDiaMes = 6; 
    const cuadricula = [];
    let diaActual = 1;

    for (let i = 0; i < 6; i++) { 
      const semana = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < primerDiaMes) semana.push(null);
        else if (diaActual > diasEnMes) semana.push(null);
        else { semana.push(diaActual); diaActual++; }
      }
      cuadricula.push(semana);
      if (diaActual > diasEnMes) break;
    }
    return cuadricula;
  };

  const abrirItinerario = (dia) => {
    if (!dia) return;
    const mesFormateado = String(mesVisible + 1).padStart(2, '0');
    const diaFormateado = String(dia).padStart(2, '0');
    const fechaString = `${anioVisible}-${mesFormateado}-${diaFormateado}`;
    
    const lugares = baseDeDatos[fechaString] ? [...baseDeDatos[fechaString]] : [];
    setItinerarioDia(lugares);
    setDiaSeleccionado(fechaString);
    setSidebarVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.calendarHeader, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => cambiarMes(-1)}>
          <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.monthYearText}>{mesesTraducidos[mesVisible]?.toUpperCase()} {anioVisible}</Text>
        <TouchableOpacity onPress={() => cambiarMes(1)}>
          <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={[styles.daysHeader, { backgroundColor: colors.primary }]}>
        {diasTraducidos.map((dia, index) => (
          <Text key={index} style={styles.dayOfWeekText}>{dia.substring(0, 3)}</Text> 
        ))}
      </View>

      <View style={styles.gridContainer}>
        {obtenerDiasDelMes().map((semana, indexSemana) => (
          <View key={indexSemana} style={styles.weekRow}>
            {semana.map((dia, indexDia) => {
              const mesF = String(mesVisible + 1).padStart(2, '0');
              const diaF = String(dia).padStart(2, '0');
              const tieneEventos = dia && baseDeDatos[`${anioVisible}-${mesF}-${diaF}`] && baseDeDatos[`${anioVisible}-${mesF}-${diaF}`].length > 0;
              
              return (
                <TouchableOpacity key={indexDia} style={[styles.dayCell, { borderColor: colors.border }]} onPress={() => abrirItinerario(dia)} disabled={!dia}>
                  <Text style={[styles.dayText, { color: colors.primary }]}>{dia || ''}</Text>
                  {tieneEventos && <View style={styles.eventDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <Modal visible={sidebarVisible} transparent={true} animationType="fade">
        <View style={styles.sidebarOverlay}>
          <View style={[styles.sidebar, { backgroundColor: theme === 'light' ? colors.primary : '#243B55' }]}>
            <View style={[styles.sidebarHeader, { borderBottomColor: theme === 'light' ? 'rgba(255,255,255,0.3)' : colors.border }]}>
              <Text style={[styles.sidebarTitle, { color: '#FFFFFF' }]}>
                {t('calendar.itinerary')} {diaSeleccionado ? diaSeleccionado.split('-').reverse().join('/') : ''}
              </Text>
              <TouchableOpacity onPress={() => setSidebarVisible(false)}><Ionicons name="close" size={28} color="#FFFFFF" /></TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} style={styles.itineraryList}>
              {itinerarioDia.length > 0 ? itinerarioDia.map((lugar) => (
                <View key={lugar.id} style={[styles.placeCard, { backgroundColor: theme === 'light' ? '#FFFFFF' : colors.background, borderColor: colors.border }]}>
                  <ImageBackground source={{ uri: lugar.image }} style={[styles.placeImage, { backgroundColor: '#DDDDDD' }]} imageStyle={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }} />
                  
                  <View style={styles.placeDetails}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={[styles.placeTitle, { color: theme === 'light' ? colors.text : '#FFFFFF' }]} numberOfLines={1}>{lugar.title}</Text>
                      
                      {lugar.address ? (
                        <Text style={[styles.placeAddress, { color: theme === 'light' ? '#666' : '#CCC' }]} numberOfLines={2}>
                          {lugar.address}
                        </Text>
                      ) : null}

                      {lugar.url ? (
                        <TouchableOpacity onPress={() => Linking.openURL(lugar.url)}>
                          <Text style={styles.placeUrl} numberOfLines={1}>📍 {lugar.url}</Text>
                        </TouchableOpacity>
                      ) : null}

                      <Text style={[styles.placeTime, { color: theme === 'light' ? colors.text : '#FFFFFF' }]}>{lugar.time}</Text>
                    </View>
                    
                    <TouchableOpacity 
                      style={[styles.checkbox, lugar.checked && styles.checkboxChecked]} 
                      onPress={() => toggleCheck(diaSeleccionado, lugar.id)}
                    >
                      {lugar.checked && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                    </TouchableOpacity>
                  </View>
                </View>
              )) : (
                <View style={styles.emptyStateContainer}>
                  <Text style={[styles.emptyStateText, { color: '#FFFFFF' }]}>{t('calendar.noEvents')}</Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: theme === 'light' ? '#FFFFFF' : colors.background }]} 
              onPress={() => { setSidebarVisible(false); router.push({ pathname: '/add-site', params: { date: diaSeleccionado } }); }}
            >
              <Ionicons name="add" size={24} color={colors.primary} />
              <Text style={[styles.addButtonText, { color: colors.primary }]}>{t('calendar.addButton')}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.sidebarBackdrop} onPress={() => setSidebarVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20 }, monthYearText: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF' }, daysHeader: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.3)' }, dayOfWeekText: { flex: 1, textAlign: 'center', color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }, gridContainer: { padding: 10 }, weekRow: { flexDirection: 'row', height: 70 }, dayCell: { flex: 1, borderBottomWidth: 1, borderRightWidth: 1, padding: 5, alignItems: 'flex-start' }, dayText: { fontSize: 14, fontWeight: 'bold' }, eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFD700', alignSelf: 'center', marginTop: 15 }, sidebarOverlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.5)' }, sidebar: { width: width * 0.8, height: '100%', padding: 20, paddingTop: 50, shadowColor: '#000', shadowOffset: { width: 5, height: 0 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10 }, sidebarBackdrop: { flex: 1 }, sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, paddingBottom: 10 }, sidebarTitle: { fontSize: 20, fontWeight: 'bold' }, itineraryList: { flex: 1 }, placeCard: { borderRadius: 8, marginBottom: 20, overflow: 'hidden' }, placeImage: { width: '100%', height: 120 }, placeDetails: { flexDirection: 'row', padding: 15, justifyContent: 'space-between', alignItems: 'center' }, placeTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 }, placeAddress: { fontSize: 12, marginBottom: 5 }, placeUrl: { fontSize: 12, color: '#4E97D1', textDecorationLine: 'underline', marginBottom: 8 }, placeTime: { fontSize: 14, fontWeight: 'bold' }, checkbox: { width: 26, height: 26, borderWidth: 2, borderColor: '#4E97D1', borderRadius: 4, justifyContent: 'center', alignItems: 'center' }, checkboxChecked: { backgroundColor: '#4E97D1' }, emptyStateContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 50 }, emptyStateText: { textAlign: 'center', fontSize: 16, opacity: 0.8 }, addButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, borderRadius: 8, marginTop: 10 }, addButtonText: { fontSize: 16, fontWeight: 'bold', marginLeft: 5 }
});