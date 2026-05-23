import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function AdminModifyMonumentScreen() {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();

  // ESTADOS ACTUALIZADOS
  const [nombre, setNombre] = useState('Teatro Degollado');
  const [frase, setFrase] = useState('Sede de la Orquesta Filarmónica.');
  const [categoria, setCategoria] = useState('Monumentos');
  const [showCat, setShowCat] = useState(false);
  const [leyendas, setLeyendas] = useState('Se dice que una sombra recorre los pasillos...');
  const [descripcion, setDescripcion] = useState('Edificio histórico de estilo neoclásico.');
  const [urlUbicacion, setUrlUbicacion] = useState('http://maps.google.com/...');
  const [fuentes, setFuentes] = useState('INAH, Archivo Histórico.');

  const categorias = ['Museos', 'Iglesias', 'Monumentos', 'Otros'];

  const handleGuardarCambios = () => {
    const mensaje = t('adminModifyMonument.alerts.successMessage', { name: nombre });
    if (Platform.OS === 'web') {
      alert(mensaje);
      router.replace('/admin-monuments');
    } else {
      Alert.alert(t('adminModifyMonument.alerts.successTitle'), mensaje, [
        { text: t('adminModifyMonument.alerts.accept'), onPress: () => router.replace('/admin-monuments') }
      ]);
    }
  };

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
          
          {/* CAMPO: NOMBRE */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.name')}</Text>
            <TextInput style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]} value={nombre} onChangeText={setNombre} />
          </View>

          {/* CAMPO: FRASE */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.phrase')}</Text>
            <TextInput style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]} value={frase} onChangeText={setFrase} />
          </View>

          {/* CAMPO: CATEGORÍA */}
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

          {/* CAMPO: LEYENDAS */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.legends')}</Text>
            <TextInput style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]} value={leyendas} onChangeText={setLeyendas} multiline />
          </View>

          {/* CAMPO: DESCRIPCIÓN */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.description')}</Text>
            <TextInput style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]} value={descripcion} onChangeText={setDescripcion} multiline />
          </View>

          {/* CAMPO: URL UBICACIÓN */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.locationUrl')}</Text>
            <TextInput style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]} value={urlUbicacion} onChangeText={setUrlUbicacion} />
          </View>

          {/* BOTONES ARCHIVOS */}
          <TouchableOpacity style={styles.fileButton}><Text>{t('adminAddMonument.buttons.addImages')}</Text></TouchableOpacity>
          <TouchableOpacity style={styles.fileButton}><Text>{t('adminAddMonument.buttons.addTimeline')}</Text></TouchableOpacity>
          <TouchableOpacity style={styles.fileButton}><Text>{t('adminAddMonument.buttons.addAudio')}</Text></TouchableOpacity>

          {/* CAMPO: FUENTES */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.historicalSources')}</Text>
            <TextInput style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]} value={fuentes} onChangeText={setFuentes} />
          </View>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionItem} onPress={() => router.back()}>
              <Ionicons name="close-circle-outline" size={50} color="#FF4C4C" />
              <Text style={[styles.actionText, { color: colors.text }]}>{t('adminModifyMonument.buttons.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={handleGuardarCambios}>
              <Ionicons name="checkmark-circle-outline" size={50} color="#4CAF50" />
              <Text style={[styles.actionText, { color: colors.text }]}>{t('adminModifyMonument.buttons.save')}</Text>
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
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 },
  actionItem: { alignItems: 'center' },
  actionText: { marginTop: 5, fontWeight: '600', fontSize: 14 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#0A2342', height: 75, paddingBottom: 10, position: 'absolute', bottom: 0, width: '100%' },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navText: { fontSize: 9, color: '#FFFFFF', textAlign: 'center', marginTop: 4 },
  navTextActive: { fontWeight: 'bold' }
});