import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext'; // Conexión al tema global

const userData = {
  username: 'Fulanita102',
  lugaresFavoritos: 0,
};

export default function ProfileScreen() {
  const { theme, colors, setTheme } = useTheme(); 
  const [showThemeOptions, setShowThemeOptions] = useState(false);

  const handleLogout = () => router.replace('/login');

  // 👇 FUNCIÓN PARA ELIMINAR CUENTA (COMPATIBLE CON WEB Y CELULAR) 👇
  const handleEliminarCuenta = () => {
    if (Platform.OS === 'web') {
      // Confirmación nativa del navegador web
      const confirmarWeb = window.confirm('¿Estás seguro de querer eliminar tu cuenta?');
      if (confirmarWeb) {
        alert('Cuenta eliminada permanentemente.\nRedireccionando al inicio de sesión...');
        // [AQUÍ IRÁ LA PETICIÓN A LA BASE DE DATOS EN EL FUTURO]
        router.replace('/login');
      }
    } else {
      // Confirmación nativa para Android y iOS
      Alert.alert(
        'Eliminar Cuenta',
        '¿Estás seguro de querer eliminar tu cuenta?',
        [
          {
            text: 'Cancelar',
            style: 'cancel', // Solo cierra la ventana
          },
          {
            text: 'Aceptar',
            style: 'destructive', // Pone el texto en rojo en sistemas compatibles
            onPress: () => {
              // [AQUÍ IRÁ LA PETICIÓN A LA BASE DE DATOS EN EL FUTURO]
              router.replace('/login');
            },
          },
        ]
      );
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      
      {/* ENCABEZADO */}
      <View style={styles.topHeader}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Perfil</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={[styles.logoutText, { color: colors.primary }]}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* DETALLES DE USUARIO */}
      <View style={styles.userInfoContainer}>
        <Ionicons name="person-circle" size={100} color={theme === 'light' ? '#333333' : '#FFFFFF'} style={styles.avatar} />
        <View style={styles.userDetails}>
          <Text style={[styles.username, { color: colors.primary }]}>{userData.username}</Text>
          <Text style={[styles.userStat, { color: colors.primary }]}>Lugares favoritos: {userData.lugaresFavoritos}</Text>
        </View>
      </View>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      {/* SECCIÓN CONFIGURACIÓN */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="settings-sharp" size={28} color={theme === 'light' ? '#333333' : '#FFFFFF'} style={styles.sectionIcon} />
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Configuración</Text>
        </View>

        {/* 1. Botón Idioma */}
        <TouchableOpacity style={styles.listItem} onPress={() => router.push('/language')}>
          <Text style={[styles.listItemText, { color: colors.textSecondary }]}>Idioma seleccionado</Text>
          <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* 2. Botón Tema */}
        <TouchableOpacity style={styles.listItem} onPress={() => setShowThemeOptions(!showThemeOptions)}>
          <Text style={[styles.listItemText, { color: colors.textSecondary }]}>Tema de la aplicacion</Text>
          <View style={styles.themeSelector}>
            <Text style={[styles.listItemValue, { color: colors.textSecondary }]}>
              {theme === 'light' ? 'Claro' : 'Obscuro'}
            </Text>
            <Ionicons name={showThemeOptions ? "chevron-up" : "chevron-down"} size={22} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        {showThemeOptions && (
          <View style={styles.dropdown}>
            <TouchableOpacity style={styles.dropdownOption} onPress={() => {setTheme('light'); setShowThemeOptions(false);}}>
              <Text style={[styles.dropdownText, { color: theme === 'light' ? colors.primary : colors.textSecondary }]}>Claro</Text>
              {theme === 'light' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.dropdownOption} onPress={() => {setTheme('dark'); setShowThemeOptions(false);}}>
              <Text style={[styles.dropdownText, { color: theme === 'dark' ? colors.primary : colors.textSecondary }]}>Obscuro</Text>
              {theme === 'dark' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>
          </View>
        )}

        {/* 3. Botón Modificar Perfil */}
        <TouchableOpacity style={styles.listItem} onPress={() => router.push('/edit-profile')}>
          <Text style={[styles.listItemText, { color: colors.textSecondary }]}>Modificar perfil</Text>
          <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      {/* SECCIÓN ACERCA DE */}
      <TouchableOpacity style={styles.aboutContainer} onPress={() => router.push('/about')}>
        <View style={styles.sectionHeaderNoMargin}>
          <Ionicons name="help-circle" size={28} color={theme === 'light' ? '#333333' : '#FFFFFF'} style={styles.sectionIcon} />
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Acerca de la aplicacion</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
      </TouchableOpacity>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      {/* SECCIÓN: POLÍTICA DE PRIVACIDAD */}
      <TouchableOpacity style={styles.aboutContainer} onPress={() => router.push('/privacy-policy')}>
        <View style={styles.sectionHeaderNoMargin}>
          <Ionicons name="shield-checkmark" size={28} color={theme === 'light' ? '#333333' : '#FFFFFF'} style={styles.sectionIcon} />
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Política de Privacidad</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
      </TouchableOpacity>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      {/* SECCIÓN ELIMINAR CUENTA */}
      <TouchableOpacity style={styles.deleteContainer} onPress={handleEliminarCuenta}>
        <Ionicons name="trash" size={28} color={theme === 'light' ? '#333333' : '#FFFFFF'} style={styles.sectionIcon} />
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Eliminar Cuenta</Text>
      </TouchableOpacity>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 25, paddingTop: 50 },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  logoutText: { fontSize: 16, fontWeight: 'bold', textDecorationLine: 'underline' },
  userInfoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  avatar: { marginRight: 20, marginLeft: -5 },
  userDetails: { justifyContent: 'center' },
  username: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  userStat: { fontSize: 14, fontWeight: 'bold', marginBottom: 3 },
  separator: { height: 1, marginVertical: 15 },
  sectionContainer: { marginBottom: 5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionHeaderNoMargin: { flexDirection: 'row', alignItems: 'center' },
  sectionIcon: { marginRight: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingLeft: 38 },
  listItemText: { fontSize: 15, fontWeight: 'bold' },
  themeSelector: { flexDirection: 'row', alignItems: 'center' },
  listItemValue: { fontSize: 15, fontWeight: 'bold', marginRight: 2 },
  dropdown: { backgroundColor: 'rgba(78, 151, 209, 0.08)', borderRadius: 10, marginLeft: 38, marginTop: 5, padding: 5 },
  dropdownOption: { flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
  dropdownText: { fontSize: 15, fontWeight: 'bold' },
  aboutContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  deleteContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, marginBottom: 40 }
});