import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function AdminModifyMonumentScreen() {
  const { colors, theme } = useTheme();

  // ESTADOS DEL FORMULARIO (Pre-llenados con datos actuales)
  const [nombre, setNombre] = useState('Teatro Degollado');
  const [anio, setAnio] = useState('1866');
  const [descripcion, setDescripcion] = useState('Edificio histórico de estilo neoclásico, sede de la Orquesta Filarmónica de Jalisco.');
  const [fuentes, setFuentes] = useState('Instituto Nacional de Antropología e Historia (INAH).');

  const handleGuardarCambios = () => {
    // Simulación de actualización
    const mensaje = `Los cambios en "${nombre}" han sido guardados correctamente.`;
    
    if (Platform.OS === 'web') {
      alert(mensaje);
      router.replace('/admin-monuments');
    } else {
      Alert.alert('Éxito', mensaje, [
        { text: 'Aceptar', onPress: () => router.replace('/admin-monuments') }
      ]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* ENCABEZADO FIJO: MODIFICAR MONUMENTO */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modificar monumento</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Edita los campos necesarios y presiona "Guardar".
          </Text>

          {/* CAMPO: NOMBRE */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Nombre del monumento</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]}
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          {/* CAMPO: AÑO */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Año de creación</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]}
              value={anio}
              onChangeText={setAnio}
              keyboardType="numeric"
            />
          </View>

          {/* CAMPO: DESCRIPCIÓN */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Texto descriptivo</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]}
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
            />
          </View>

          {/* CAMPO: AUDIO (SIMULADO) */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Archivos de audio</Text>
            <TouchableOpacity style={[styles.fileButton, { borderBottomColor: colors.primary }]}>
              <Ionicons name="mic-outline" size={20} color={colors.primary} />
              <Text style={{ color: colors.text, marginLeft: 10 }}>audio_historia_V1.mp3</Text>
              <Ionicons name="swap-horizontal" size={16} color={colors.textSecondary} style={{marginLeft: 'auto'}} />
            </TouchableOpacity>
          </View>

          {/* CAMPO: LÍNEA DE TIEMPO (SIMULADO) */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Línea de tiempo</Text>
            <TouchableOpacity style={[styles.fileButton, { borderBottomColor: colors.primary }]}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
              <Text style={{ color: colors.text, marginLeft: 10 }}>linea_tiempo_actualizada.pdf</Text>
              <Ionicons name="swap-horizontal" size={16} color={colors.textSecondary} style={{marginLeft: 'auto'}} />
            </TouchableOpacity>
          </View>

          {/* CAMPO: FUENTES HISTÓRICAS */}
          <View style={[styles.inputWrapper, { marginBottom: 0 }]}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Fuentes históricas</Text>
            <TextInput
              style={[
                styles.input, 
                { color: colors.text, borderBottomColor: colors.primary, paddingBottom: 20 }
              ]}
              value={fuentes}
              onChangeText={setFuentes}
              multiline
            />
          </View>

          {/* BOTONES DE ACCIÓN (Cancelar y Guardar) */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionItem} onPress={() => router.back()}>
              <Ionicons name="close-circle-outline" size={50} color="#FF4C4C" />
              <Text style={[styles.actionText, { color: colors.text }]}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleGuardarCambios}>
              <Ionicons name="checkmark-circle-outline" size={50} color="#4CAF50" />
              <Text style={[styles.actionText, { color: colors.text }]}>Guardar</Text>
            </TouchableOpacity>
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
  header: { paddingTop: 50, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  backButton: { position: 'absolute', left: 20, bottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  formCard: { padding: 20, borderRadius: 15, borderWidth: 1, elevation: 3 },
  infoText: { fontSize: 12, fontStyle: 'italic', marginBottom: 20, textAlign: 'center' },
  inputWrapper: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  input: { borderBottomWidth: 2, paddingVertical: 8, fontSize: 16 },
  fileButton: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, paddingVertical: 10 },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 },
  actionItem: { alignItems: 'center' },
  actionText: { marginTop: 5, fontWeight: '600', fontSize: 14 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#0A2342', height: 75, paddingBottom: 10, position: 'absolute', bottom: 0, width: '100%' },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navText: { fontSize: 9, color: '#FFFFFF', textAlign: 'center', marginTop: 4 },
  navTextActive: { fontWeight: 'bold' }
});