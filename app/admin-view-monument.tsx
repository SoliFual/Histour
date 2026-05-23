import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function AdminViewMonumentScreen() {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();

  // DATOS SIMULADOS (Estructura actualizada)
  const monumentoMock = {
    nombre: 'Teatro Degollado',
    frase: 'Sede de la Orquesta Filarmónica.',
    categoria: 'Monumentos',
    leyendas: 'Se dice que una sombra recorre los pasillos...',
    descripcion: 'Edificio histórico de estilo neoclásico.',
    urlUbicacion: 'https://maps.app.goo.gl/teatro',
    fuentes: 'INAH, Archivo Histórico.',
    audio: 'historia_degollado.mp3',
    lineaTiempo: 'linea_tiempo.jpg'
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{monumentoMock.nombre}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>{t('adminViewMonument.readonlyMode')}</Text>

          {/* CAMPOS ACTUALIZADOS */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.name')}</Text>
            <TextInput style={[styles.input, { color: colors.textSecondary, borderBottomColor: colors.border }]} value={monumentoMock.nombre} editable={false} />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.phrase')}</Text>
            <TextInput style={[styles.input, { color: colors.textSecondary, borderBottomColor: colors.border }]} value={monumentoMock.frase} editable={false} />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.category')}</Text>
            <TextInput style={[styles.input, { color: colors.textSecondary, borderBottomColor: colors.border }]} value={monumentoMock.categoria} editable={false} />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.legends')}</Text>
            <TextInput style={[styles.input, { color: colors.textSecondary, borderBottomColor: colors.border }]} value={monumentoMock.leyendas} multiline editable={false} />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.description')}</Text>
            <TextInput style={[styles.input, { color: colors.textSecondary, borderBottomColor: colors.border }]} value={monumentoMock.descripcion} multiline editable={false} />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.locationUrl')}</Text>
            <TextInput style={[styles.input, { color: colors.textSecondary, borderBottomColor: colors.border }]} value={monumentoMock.urlUbicacion} editable={false} />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.historicalSources')}</Text>
            <TextInput style={[styles.input, { color: colors.textSecondary, borderBottomColor: colors.border }]} value={monumentoMock.fuentes} editable={false} />
          </View>

          {/* Archivos (Solo lectura) */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.audio')}</Text>
            <View style={styles.fileButton}><Text style={{color: colors.textSecondary}}>{monumentoMock.audio}</Text></View>
          </View>
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.timeline')}</Text>
            <View style={styles.fileButton}><Text style={{color: colors.textSecondary}}>{monumentoMock.lineaTiempo}</Text></View>
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
  fileButton: { borderBottomWidth: 1, paddingVertical: 10 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#0A2342', height: 75, paddingBottom: 10, position: 'absolute', bottom: 0, width: '100%' },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navText: { fontSize: 9, color: '#FFFFFF', textAlign: 'center', marginTop: 4 },
  navTextActive: { fontWeight: 'bold' }
});