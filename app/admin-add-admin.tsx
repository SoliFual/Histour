import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
// 1. Importamos el traductor
import { useTranslation } from 'react-i18next';

export default function AdminAddAdminScreen() {
  const { colors, theme } = useTheme();

  // 2. Activamos el traductor
  const { t } = useTranslation();

  // ESTADOS PARA LOS CAMPOS DEL FORMULARIO
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // FUNCIÓN PARA SIMULAR EL REGISTRO
  const handleRegistrar = () => {
    if (!email || !password || !fullName || !username) {
      if (Platform.OS === 'web') alert(t('adminAddAdmin.alerts.incompleteWeb'));
      else Alert.alert(t('adminAddAdmin.alerts.incompleteTitle'), t('adminAddAdmin.alerts.incompleteMessage'));
      return;
    }

    // Inyectamos el nombre de usuario
    const mensajeExito = t('adminAddAdmin.alerts.successMessage', { username });

    if (Platform.OS === 'web') {
      alert(mensajeExito);
      router.replace('/admin-users'); 
    } else {
      Alert.alert(
        t('adminAddAdmin.alerts.successTitle'),
        mensajeExito,
        [{ text: t('adminAddAdmin.alerts.accept'), onPress: () => router.replace('/admin-users') }]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* ENCABEZADO AZUL */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/admin-users')}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('adminAddAdmin.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* LOGO HISTOUR REAL Y NOMBRE */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logoImage}
            resizeMode="contain" 
          />
          {/* El nombre de la app NO se traduce */}
          <Text style={[styles.logoText, { color: colors.primary }]}>HISTOUR</Text>
        </View>

        {/* TARJETA DE FORMULARIO */}
        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          
          {/* CAMPO: CORREO */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddAdmin.labels.email')}</Text>
            <View style={[styles.inputContainer, { borderBottomColor: colors.primary }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={t('adminAddAdmin.placeholders.email')}
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Ionicons name="mail-outline" size={20} color={colors.primary} />
            </View>
          </View>

          {/* CAMPO: CONTRASEÑA */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddAdmin.labels.password')}</Text>
            <View style={[styles.inputContainer, { borderBottomColor: colors.primary }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={t('adminAddAdmin.placeholders.password')}
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* CAMPO: NOMBRE COMPLETO */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddAdmin.labels.fullName')}</Text>
            <View style={[styles.inputContainer, { borderBottomColor: colors.primary }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={t('adminAddAdmin.placeholders.fullName')}
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
              />
              <Ionicons name="person-outline" size={20} color={colors.primary} />
            </View>
          </View>

          {/* CAMPO: NOMBRE DE USUARIO */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddAdmin.labels.username')}</Text>
            <View style={[styles.inputContainer, { borderBottomColor: colors.primary }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={t('adminAddAdmin.placeholders.username')}
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
              <Ionicons name="at-outline" size={20} color={colors.primary} />
            </View>
          </View>

          {/* BOTÓN DE REGISTRO */}
          <TouchableOpacity style={[styles.registerButton, { backgroundColor: colors.primary }]} onPress={handleRegistrar}>
            <Text style={styles.registerButtonText}>{t('adminAddAdmin.button')}</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingTop: 50, 
    paddingBottom: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  backButton: { position: 'absolute', left: 20, bottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 40, alignItems: 'center' },
  logoContainer: { 
    alignItems: 'center', 
    marginVertical: 20 
  },
  logoImage: { 
    width: 110, 
    height: 110,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  formCard: { 
    width: '100%', 
    padding: 25, 
    borderRadius: 20, 
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  inputWrapper: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderBottomWidth: 2, 
    paddingBottom: 5 
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 5 },
  registerButton: { 
    marginTop: 30, 
    paddingVertical: 15, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  registerButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' }
});