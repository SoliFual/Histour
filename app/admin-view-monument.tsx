import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function AdminViewMonumentScreen() {
  const { colors, theme } = useTheme();

  // DATOS SIMULADOS DEL MONUMENTO
  const monumentoMock = {
    nombre: 'Teatro Degollado',
    anio: '1866',
    descripcion: 'Edificio histórico de estilo neoclásico, actualmente sede de la Orquesta Filarmónica de Jalisco y escenario de importantes eventos culturales.',
    audio: 'audio_historia_teatro.mp3',
    lineaTiempo: 'linea_tiempo_degollado.pdf',
    fuentes: 'Instituto Nacional de Antropología e Historia (INAH), Archivo Histórico de Jalisco.'
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* ENCABEZADO CON EL NOMBRE DEL MONUMENTO */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {monumentoMock.nombre}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Modo de solo lectura. Los datos no pueden ser modificados.
          </Text>

          {/* CAMPO: NOMBRE */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Nombre del monumento</Text>
            <TextInput
              style={[styles.input, { color: colors.textSecondary, borderBottomColor: colors.border }]}
              value={monumentoMock.nombre}
              editable={false} 
            />
          </View>

          {/* CAMPO: AÑO */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Año de creación</Text>
            <TextInput
              style={[styles.input, { color: colors.textSecondary, borderBottomColor: colors.border }]}
              value={monumentoMock.anio}
              editable={false}
            />
          </View>

          {/* CAMPO: DESCRIPCIÓN */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Texto descriptivo</Text>
            <TextInput
              style={[styles.input, { color: colors.textSecondary, borderBottomColor: colors.border }]}
              value={monumentoMock.descripcion}
              multiline
              editable={false}
            />
          </View>

          {/* CAMPO: ARCHIVOS DE AUDIO */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Archivos de audio</Text>
            <View style={[styles.fileButton, { borderBottomColor: colors.border }]}>
              <Ionicons name="volume-medium-outline" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, marginLeft: 10 }}>{monumentoMock.audio}</Text>
            </View>
          </View>

          {/* CAMPO: LÍNEA DE TIEMPO */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Línea de tiempo</Text>
            <View style={[styles.fileButton, { borderBottomColor: colors.border }]}>
              <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, marginLeft: 10 }}>{monumentoMock.lineaTiempo}</Text>
            </View>
          </View>

          {/* CAMPO: FUENTES HISTÓRICAS */}
          {/* 👇 Se agregó paddingBottom y se quitó el marginBottom para pegar la línea al margen 👇 */}
          <View style={[styles.inputWrapper, { marginBottom: 0 }]}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Fuentes históricas</Text>
            <TextInput
              style={[
                styles.input, 
                { color: colors.textSecondary, borderBottomColor: colors.border, paddingBottom: 35 }
              ]}
              value={monumentoMock.fuentes}
              multiline
              editable={false}
            />
          </View>

        </View>
      </ScrollView>

      {/* PANEL INFERIOR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-dashboard')}><Ionicons name="home" size={22} color="#FFFFFF" /><Text style={styles.navText}>Principal</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-profile')}><Ionicons name="person" size={22} color="#FFFFFF" /><Text style={styles.navText}>Usuario</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-users')}><Ionicons name="settings" size={22} color="#FFFFFF" /><Text style={styles.navText}>Gestión de Usuarios</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-monuments')}><Ionicons name="library" size={22} color="#FFFFFF" /><Text style={[styles.navText, styles.navTextActive]}>Gestión de Monumentos</Text></TouchableOpacity>
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
  fileButton: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingVertical: 10 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#0A2342', height: 75, paddingBottom: 10, position: 'absolute', bottom: 0, width: '100%' },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navText: { fontSize: 9, color: '#FFFFFF', textAlign: 'center', marginTop: 4 },
  navTextActive: { fontWeight: 'bold' }
});