import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function AdminAddMonumentScreen() {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();

  const [nombre, setNombre] = useState('');
  const [frase, setFrase] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [leyendas, setLeyendas] = useState('');
  const [urlUbicacion, setUrlUbicacion] = useState('');
  const [fuentes, setFuentes] = useState('');
  const [categoria, setCategoria] = useState('Monumentos');
  const [showCat, setShowCat] = useState(false);

  const categorias = ['Museos', 'Iglesias', 'Monumentos', 'Otros'];

  const handleCrear = () => {
    if (!nombre || !descripcion) {
      Alert.alert(t('adminAddMonument.alerts.incompleteTitle'), t('adminAddMonument.alerts.incompleteMessage'));
      return;
    }
    Alert.alert(t('adminAddMonument.alerts.successTitle'), t('adminAddMonument.alerts.successMessage', { name: nombre }));
    router.replace('/admin-monuments');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>{t('adminAddMonument.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          
          {/* CAMPO: NOMBRE */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.name')}</Text>
            <TextInput style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]} value={nombre} onChangeText={setNombre} />
          </View>

          {/* CAMPO: FRASE DESCRIPTIVA */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddMonument.labels.phrase')}</Text>
            <TextInput style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]} value={frase} onChangeText={setFrase} />
          </View>

          {/* CAMPO: CATEGORÍA (Desplegable simple) */}
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
              <Text style={[styles.actionText, { color: colors.text }]}>{t('adminAddMonument.buttons.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={handleCrear}>
              <Ionicons name="checkmark-circle-outline" size={50} color="#4CAF50" />
              <Text style={[styles.actionText, { color: colors.text }]}>{t('adminAddMonument.buttons.save')}</Text>
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
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 },
  actionItem: { alignItems: 'center' },
  actionText: { marginTop: 5, fontWeight: '600', fontSize: 14 }
});