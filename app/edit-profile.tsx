import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
// 1. Importamos el traductor
import { useTranslation } from 'react-i18next';

// VALORES INICIALES DE LA "BASE DE DATOS"
const valoresIniciales = {
  username: 'Fulanita102',
  nombre: 'Fulanita Perez',
  correo: 'Fulanita@gmail.com',
  password: '12345678',
};

export default function EditProfileScreen() {
  const { colors, theme } = useTheme();
  
  // 2. Activamos el traductor
  const { t } = useTranslation();

  // EL ANTÍDOTO CONTRA EL OJO DE EDGE
  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.innerHTML = `
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear,
        input[type="password"]::-webkit-credentials-auto-fill-button {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
      return () => { document.head.removeChild(style); };
    }
  }, []);

  // ESTADOS DEL FORMULARIO
  const [username, setUsername] = useState(valoresIniciales.username);
  const [nombre, setNombre] = useState(valoresIniciales.nombre);
  const [correo, setCorreo] = useState(valoresIniciales.correo);
  const [password, setPassword] = useState(valoresIniciales.password); 
  const [confirmPassword, setConfirmPassword] = useState(''); 

  // ESTADOS DE ERROR
  const [errorNombre, setErrorNombre] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [errorConfirmPassword, setErrorConfirmPassword] = useState('');

  // ESTADOS PARA MOSTRAR/OCULTAR CONTRASEÑA
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogout = () => {
    router.replace('/login');
  };

  const handleCambiarFoto = () => {
    if (Platform.OS === 'web') {
      const permiso = window.confirm(t('editProfile.alerts.galleryPromptWeb'));
      if (permiso) {
        alert(t('editProfile.alerts.galleryOpeningWeb'));
      }
    } else {
      Alert.alert(
        t('editProfile.alerts.galleryTitle'),
        t('editProfile.alerts.galleryPrompt'),
        [
          { text: t('editProfile.alerts.deny'), style: 'cancel' },
          { 
            text: t('editProfile.alerts.allow'), 
            onPress: () => Alert.alert(t('editProfile.alerts.galleryTitle'), t('editProfile.alerts.galleryOpening')) 
          }
        ]
      );
    }
  };

  const handleGuardarCambios = () => {
    setErrorNombre('');
    setErrorPassword('');
    setErrorConfirmPassword('');
    let todoCorrecto = true;

    const partesNombre = nombre.trim().split(/\s+/);
    if (partesNombre.length < 2) {
      setErrorNombre(t('editProfile.errors.nameMissing'));
      todoCorrecto = false;
    }

    if (password !== valoresIniciales.password) {
      if (password.length < 8) {
        setErrorPassword(t('editProfile.errors.passwordShort'));
        todoCorrecto = false;
      } else if (password !== confirmPassword) {
        setErrorConfirmPassword(t('editProfile.errors.passwordMismatch'));
        todoCorrecto = false;
      }
    }

    if (!todoCorrecto) return;

    const haCambiadoAlgo = 
      username !== valoresIniciales.username ||
      nombre !== valoresIniciales.nombre ||
      correo !== valoresIniciales.correo ||
      password !== valoresIniciales.password;

    if (!haCambiadoAlgo) {
      if (Platform.OS === 'web') {
        alert(t('editProfile.alerts.noChangesMessage'));
      } else {
        Alert.alert(t('editProfile.alerts.noChangesTitle'), t('editProfile.alerts.noChangesMessage'));
      }
      return;
    }

    if (Platform.OS === 'web') {
      const deAcuerdo = window.confirm(t('editProfile.alerts.confirmSavePrompt'));
      if (deAcuerdo) {
        alert(t('editProfile.alerts.saveSuccessWeb'));
        router.back();
      }
    } else {
      Alert.alert(
        t('editProfile.alerts.confirmSaveTitle'),
        t('editProfile.alerts.confirmSavePrompt'),
        [
          { text: t('editProfile.alerts.cancel'), style: 'cancel' },
          {
            text: t('editProfile.alerts.save'),
            onPress: () => {
              Alert.alert(
                t('editProfile.alerts.saveSuccessTitle'), 
                t('editProfile.alerts.saveSuccessMessage'),
                [{ text: 'OK', onPress: () => router.back() }] 
              );
            },
          },
        ]
      );
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      
      {/* ENCABEZADO */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('editProfile.headerTitle')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={[styles.logoutText, { color: colors.primary }]}>{t('editProfile.logout')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.avatarSection}>
        <TouchableOpacity 
          style={[styles.avatarCircle, { borderColor: theme === 'light' ? '#333333' : '#FFFFFF' }]}
          onPress={handleCambiarFoto}
        >
          <Ionicons name="camera" size={65} color={theme === 'light' ? '#333333' : '#FFFFFF'} />
        </TouchableOpacity>
        
        <View style={styles.usernameRow}>
          <TextInput 
            style={[styles.usernameInput, { color: colors.primary }]} 
            value={username} 
            onChangeText={setUsername} 
          />
          <Ionicons name="pencil" size={20} color={colors.primary} />
        </View>
      </View>

      <View style={styles.formContainer}>
        
        <View style={styles.fieldWrapper}>
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.primary }]}>{t('editProfile.labels.name')}</Text>
            <TextInput 
              style={[styles.fieldInput, { color: colors.primary }]} 
              value={nombre} 
              onChangeText={setNombre} 
              placeholder={t('editProfile.placeholders.name')}
              placeholderTextColor="#999"
            />
            <Ionicons name="pencil" size={18} color={colors.primary} />
          </View>
          {errorNombre !== '' && <Text style={styles.errorText}>{errorNombre}</Text>}
        </View>

        <View style={styles.fieldWrapper}>
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.primary }]}>{t('editProfile.labels.email')}</Text>
            <TextInput 
              style={[styles.fieldInput, { color: colors.primary }]} 
              value={correo} 
              onChangeText={setCorreo} 
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Ionicons name="pencil" size={18} color={colors.primary} />
          </View>
        </View>

        <View style={styles.fieldWrapper}>
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.primary }]}>{t('editProfile.labels.password')}</Text>
            <TextInput 
              style={[styles.fieldInput, { color: colors.primary }]} 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry={!showPassword} 
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.primary} />
            </TouchableOpacity>
            <Ionicons name="pencil" size={18} color={colors.primary} />
          </View>
          {errorPassword !== '' && <Text style={styles.errorText}>{errorPassword}</Text>}
        </View>

        {password !== valoresIniciales.password && (
          <View style={styles.fieldWrapper}>
            <View style={styles.fieldRow}>
              <Text style={[styles.fieldLabel, { color: colors.primary }]}>{t('editProfile.labels.confirmPassword')}</Text>
              <TextInput 
                style={[styles.fieldInput, { color: colors.primary }]} 
                value={confirmPassword} 
                onChangeText={setConfirmPassword} 
                secureTextEntry={!showConfirmPassword} 
                placeholder={t('editProfile.placeholders.confirmPassword')}
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color={colors.primary} />
              </TouchableOpacity>
              <Ionicons name="pencil" size={18} color={colors.primary} />
            </View>
            {errorConfirmPassword !== '' && <Text style={styles.errorText}>{errorConfirmPassword}</Text>}
          </View>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleGuardarCambios}>
          <Text style={styles.saveButtonText}>{t('editProfile.saveButton')}</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 25, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 50 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 5 },
  logoutText: { fontSize: 16, fontWeight: 'bold', textDecorationLine: 'underline' },
  avatarSection: { alignItems: 'center', marginBottom: 40 },
  avatarCircle: { width: 150, height: 150, borderRadius: 75, borderWidth: 6, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  usernameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  usernameInput: { fontSize: 26, fontWeight: 'bold', marginRight: 10, textAlign: 'center', padding: 0 },
  formContainer: { paddingHorizontal: 10, paddingBottom: 40 },
  fieldWrapper: { marginBottom: 25 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(78, 151, 209, 0.3)', paddingBottom: 5 },
  fieldLabel: { fontSize: 15, fontWeight: 'bold', marginRight: 5 },
  fieldInput: { flex: 1, fontSize: 15, fontWeight: 'bold', padding: 0 },
  eyeIcon: { marginRight: 8 }, 
  errorText: { color: '#FF4C4C', fontSize: 12, fontWeight: 'bold', marginTop: 5 },
  saveButton: { backgroundColor: '#4E97D1', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});