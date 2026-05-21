import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function AdminAddMonumentScreen() {
  const { colors, theme } = useTheme();

  // ESTADOS DEL FORMULARIO
  const [nombre, setNombre] = useState('');
  const [anio, setAnio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fuentes, setFuentes] = useState('');

  const handleCrear = () => {
    // Validación básica
    if (!nombre || !anio || !descripcion) {
      if (Platform.OS === 'web') alert('Por favor, completa los campos principales.');
      else Alert.alert('Campos incompletos', 'Nombre, año y descripción son obligatorios.');
      return;
    }

    // Simulación de envío
    const mensaje = `Monumento "${nombre}" guardado correctamente (Simulación).`;
    if (Platform.OS === 'web') {
      alert(mensaje);
      router.replace('/admin-monuments');
    } else {
      Alert.alert('Éxito', mensaje, [{ text: 'Aceptar', onPress: () => router.replace('/admin-monuments') }]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* ENCABEZADO */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Agregar monumento</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          
          {/* CAMPO: NOMBRE */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Nombre del monumento</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Teatro Degollado"
              placeholderTextColor="#999"
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
              placeholder="Ej: 1866"
              placeholderTextColor="#999"
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
              placeholder="Escribe la historia aquí..."
              placeholderTextColor="#999"
            />
          </View>

          {/* CAMPO: ARCHIVOS DE AUDIO (SIMULADO) */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Archivos de audio</Text>
            <TouchableOpacity style={[styles.fileButton, { borderBottomColor: colors.primary }]}>
              <Ionicons name="mic-outline" size={20} color={colors.primary} />
              <Text style={{ color: '#999', marginLeft: 10 }}>Subir archivo .mp3</Text>
            </TouchableOpacity>
          </View>

          {/* CAMPO: GUÍA DE TERRITORIO (SIMULADO) */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Guía de territorio</Text>
            <TouchableOpacity style={[styles.fileButton, { borderBottomColor: colors.primary }]}>
              <Ionicons name="map-outline" size={20} color={colors.primary} />
              <Text style={{ color: '#999', marginLeft: 10 }}>Subir archivo .pdf / .jpg</Text>
            </TouchableOpacity>
          </View>

          {/* CAMPO: FUENTES HISTÓRICAS */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Fuentes históricas</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]}
              value={fuentes}
              onChangeText={setFuentes}
              placeholder="Libros, sitios web, etc."
              placeholderTextColor="#999"
            />
          </View>

          {/* BOTONES DE ACCIÓN (ESTILO ICONO COMO EN TU IMAGEN) */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionItem} onPress={() => router.back()}>
              <Ionicons name="close-circle-outline" size={50} color="#FF4C4C" />
              <Text style={[styles.actionText, { color: colors.text }]}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleCrear}>
              <Ionicons name="checkmark-circle-outline" size={50} color="#4CAF50" />
              <Text style={[styles.actionText, { color: colors.text }]}>Crear</Text>
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
  header: { paddingTop: 50, paddingBottom: 20, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  formCard: { padding: 20, borderRadius: 15, borderWidth: 1, elevation: 3 },
  inputWrapper: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  input: { borderBottomWidth: 2, paddingVertical: 8, fontSize: 16 },
  fileButton: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, paddingVertical: 10 },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30, paddingBottom: 10 },
  actionItem: { alignItems: 'center' },
  actionText: { marginTop: 5, fontWeight: '600', fontSize: 14 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#0A2342', height: 75, paddingBottom: 10, position: 'absolute', bottom: 0, width: '100%' },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navText: { fontSize: 9, color: '#FFFFFF', textAlign: 'center', marginTop: 4 },
  navTextActive: { fontWeight: 'bold' }
});