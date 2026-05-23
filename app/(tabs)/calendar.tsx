import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, ImageBackground, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
// 1. Importamos el traductor
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

let DATABASE_GLOBAL = {
  '2026-05-19': [
    {
      id: '1',
      title: 'El Hospicio Cabañas',
      address: 'C. Cabañas 8, Las Fresas, 44360 Guadalajara, Jal.',
      url: 'https://maps.app.goo.gl/B2M7uXq5G8vHk8yP6',
      time: '16:00',
      checked: true,
      image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=600&auto=format&fit=crop'
    }
  ]
};

export default function CalendarScreen() {
  const { colors, theme } = useTheme();
  const params = useLocalSearchParams();
  
  // 2. Activamos el traductor
  const { t } = useTranslation();

  const fechaActual = new Date(); 
  const mesActualReal = fechaActual.getMonth();
  const anioActualReal = fechaActual.getFullYear();

  const [mesVisible, setMesVisible] = useState(mesActualReal);
  const [anioVisible, setAnioVisible] = useState(anioActualReal);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [itinerarioDia, setItinerarioDia] = useState([]);
  const [baseDeDatos, setBaseDeDatos] = useState(DATABASE_GLOBAL); 

  // Mapeo de traducciones para meses y días
  const mesesTraducidos = t('calendar.months', { returnObjects: true });
  const diasTraducidos = t('calendar.days', { returnObjects: true });

  useEffect(() => {
    if (params.nuevoSitioTitle && params.fechaObjetivo) {
      const fecha = Array.isArray(params.fechaObjetivo) ? params.fechaObjetivo[0] : params.fechaObjetivo;
      const title = Array.isArray(params.nuevoSitioTitle) ? params.nuevoSitioTitle[0] : params.nuevoSitioTitle;
      
      if (!DATABASE_GLOBAL[fecha]) DATABASE_GLOBAL[fecha] = [];

      const yaExiste = DATABASE_GLOBAL[fecha].some(lugar => lugar.title === title);
      
      if (!yaExiste) {
        const nuevoLugar = {
          id: String(params.nuevoSitioId) + Math.random().toString(),
          title: title,
          address: t('calendar.defaultAddress'), 
          url: 'https://maps.app.goo.gl/B2M7uXq5G8vHk8yP6', 
          time: Array.isArray(params.nuevoSitioTime) ? params.nuevoSitioTime[0] : params.nuevoSitioTime,
          checked: false,
          image: Array.isArray(params.nuevoSitioImage) ? params.nuevoSitioImage[0] : params.nuevoSitioImage
        };
        
        DATABASE_GLOBAL[fecha] = [...DATABASE_GLOBAL[fecha], nuevoLugar].sort((a, b) => a.time.localeCompare(b.time));
      }
      setBaseDeDatos({ ...DATABASE_GLOBAL });
      setItinerarioDia([...DATABASE_GLOBAL[fecha]]);
      setDiaSeleccionado(fecha);
      setSidebarVisible(true);
    }
  }, [params.nuevoSitioTitle, params.fechaObjetivo, params.nuevoSitioTime]); 

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
        <Text style={styles.monthYearText}>{mesesTraducidos[mesVisible].toUpperCase()} {anioVisible}</Text>
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
                  <ImageBackground source={{ uri: lugar.image }} style={styles.placeImage} imageStyle={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }} />
                  <View style={styles.placeDetails}>
                    <Text style={[styles.placeTitle, { color: theme === 'light' ? colors.text : '#FFFFFF' }]}>{lugar.title}</Text>
                    <Text style={[styles.placeTime, { color: theme === 'light' ? colors.text : '#FFFFFF' }]}>{lugar.time}</Text>
                  </View>
                </View>
              )) : (
                <View style={styles.emptyStateContainer}>
                  <Text style={[styles.emptyStateText, { color: '#FFFFFF' }]}>{t('calendar.noEvents')}</Text>
                </View>
              )}
            </ScrollView>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: theme === 'light' ? '#FFFFFF' : colors.background }]} onPress={() => { setSidebarVisible(false); router.push({ pathname: '/add-site', params: { date: diaSeleccionado } }); }}>
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
  container: { flex: 1 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20 },
  monthYearText: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF' },
  daysHeader: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.3)' },
  dayOfWeekText: { flex: 1, textAlign: 'center', color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  gridContainer: { padding: 10 },
  weekRow: { flexDirection: 'row', height: 70 },
  dayCell: { flex: 1, borderBottomWidth: 1, borderRightWidth: 1, padding: 5, alignItems: 'flex-start' },
  dayText: { fontSize: 14, fontWeight: 'bold' },
  eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFD700', alignSelf: 'center', marginTop: 15 },
  
  sidebarOverlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.5)' },
  sidebar: { width: width * 0.8, height: '100%', padding: 20, paddingTop: 50, shadowColor: '#000', shadowOffset: { width: 5, height: 0 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10 },
  sidebarBackdrop: { flex: 1 },
  sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, paddingBottom: 10 },
  sidebarTitle: { fontSize: 20, fontWeight: 'bold' },
  itineraryList: { flex: 1 },
  placeCard: { borderRadius: 8, marginBottom: 20, overflow: 'hidden' },
  placeImage: { width: '100%', height: 120 },
  placeDetails: { flexDirection: 'row', padding: 15, justifyContent: 'space-between', alignItems: 'center' },
  placeTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  placeAddress: { fontSize: 10, marginBottom: 2 },
  placeUrl: { fontSize: 10, color: '#4E97D1', textDecorationLine: 'underline', marginBottom: 8 }, 
  placeTime: { fontSize: 14, fontWeight: 'bold' },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: '#4E97D1', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#4E97D1' },
  emptyStateContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 50 },
  emptyStateText: { textAlign: 'center', fontSize: 16, opacity: 0.8 },
  addButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, borderRadius: 8, marginTop: 10 },
  addButtonText: { fontSize: 16, fontWeight: 'bold', marginLeft: 5 }
});