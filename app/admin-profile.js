import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// 1. IMPORTACIONES DE FIREBASE
import { deleteUser, signOut } from 'firebase/auth';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function AdminProfileScreen() {
  const { colors, theme, setTheme } = useTheme(); 
  const { t } = useTranslation();

  // 2. ESTADOS PARA GUARDAR LA INFORMACIÓN DEL USUARIO
  const [username, setUsername] = useState('Cargando...');
  const [profilePicture, setProfilePicture] = useState(null);

  // 3. EFECTO PARA TRAER LOS DATOS AL ABRIR LA PANTALLA
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUsername(data.username || 'Administrador');
            setProfilePicture(data.profilePicture || null);
          }
        } catch (error) {
          console.error("Error al cargar datos del perfil:", error);
          setUsername('Error al cargar');
        }
      }
    };

    fetchUserData();
  }, []);

  // 4. LÓGICA DE CIERRE DE SESIÓN REAL CON FIREBASE
  const handleLogout = () => {
    const confirmarSalida = async () => {
      try {
        await signOut(auth);
        router.replace('/login');
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    };

    if (Platform.OS === 'web') {
      const salir = window.confirm(t('adminProfile.alerts.logoutMessage'));
      if (salir) confirmarSalida();
    } else {
      Alert.alert(
        t('adminProfile.alerts.logoutTitle'),
        t('adminProfile.alerts.logoutMessage'),
        [
          { text: t('adminProfile.alerts.cancel'), style: 'cancel' },
          { text: t('adminProfile.alerts.exit'), onPress: confirmarSalida }
        ]
      );
    }
  };

  const mostrarMenuTema = () => {
    if (Platform.OS === 'web') {
      setTheme(theme === 'light' ? 'dark' : 'light');
    } else {
      Alert.alert(
        t('adminProfile.alerts.themeTitle'),
        t('adminProfile.alerts.themeMessage'),
        [
          { text: t('adminProfile.alerts.themeLightOption'), onPress: () => setTheme('light') },
          { text: t('adminProfile.alerts.themeDarkOption'), onPress: () => setTheme('dark') },
          { text: t('adminProfile.alerts.cancel'), style: 'cancel' }
        ]
      );
    }
  };

  // 5. LÓGICA DE ELIMINACIÓN DE CUENTA REAL CON FIREBASE
  const handleEliminarCuenta = () => {
    const confirmarEliminacion = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          // Primero borramos sus datos de Firestore
          await deleteDoc(doc(db, "users", user.uid));
          // Luego borramos su acceso de Authentication
          await deleteUser(user);
          
          if (Platform.OS === 'web') {
            alert(t('adminProfile.alerts.deleteSuccessWeb') || "Cuenta eliminada con éxito.");
          } else {
            Alert.alert(t('adminProfile.alerts.deleteSuccessTitle'), t('adminProfile.alerts.deleteSuccessMessage'));
          }
          router.replace('/login');
        }
      } catch (error) {
        console.error("Error al eliminar cuenta:", error);
        // Si lleva mucho tiempo logueado, Firebase pide que vuelva a iniciar sesión por seguridad
        if (error.code === 'auth/requires-recent-login') {
          const msg = "Por seguridad, debes haber iniciado sesión recientemente para eliminar tu cuenta. Cierra sesión y vuelve a entrar.";
          if (Platform.OS === 'web') alert(msg); else Alert.alert("Aviso de Seguridad", msg);
        } else {
          const msgGen = "Ocurrió un error al eliminar tu cuenta. Inténtalo de nuevo.";
          if (Platform.OS === 'web') alert(msgGen); else Alert.alert("Error", msgGen);
        }
      }
    };

    if (Platform.OS === 'web') {
      const confirmar = window.confirm(t('adminProfile.alerts.deletePromptWeb'));
      if (confirmar) confirmarEliminacion();
    } else {
      Alert.alert(
        t('adminProfile.alerts.deleteTitle'),
        t('adminProfile.alerts.deleteMessage'),
        [
          { text: t('adminProfile.alerts.cancel'), style: 'cancel' },
          { 
            text: t('adminProfile.alerts.deleteConfirm'), 
            style: 'destructive',
            onPress: confirmarEliminacion
          }
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('adminProfile.headerTitle')}</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={[styles.logoutText, { color: colors.primary }]}>{t('adminProfile.logout')}</Text>
          </TouchableOpacity>
        </View>

        {/* 6. SECCIÓN DE PERFIL DINÁMICA */}
        <View style={styles.profileSection}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person-circle-outline" size={90} color={theme === 'light' ? '#333' : '#FFF'} />
          )}
          <View style={styles.profileInfo}>
            <Text style={[styles.username, { color: colors.primary }]}>{username}</Text>
            <Text style={[styles.roleLabel, { color: colors.text }]}>{t('adminProfile.roleAdmin')}</Text> 
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings" size={24} color={theme === 'light' ? '#000' : '#FFF'} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('adminProfile.settings.title')}</Text>
          </View>

          <TouchableOpacity style={styles.listItem} onPress={() => router.push('/language')}>
            <Text style={[styles.listText, { color: colors.primary }]}>{t('adminProfile.settings.language')}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.listItem} onPress={mostrarMenuTema}>
            <Text style={[styles.listText, { color: colors.primary }]}>{t('adminProfile.settings.theme')}</Text>
            <View style={styles.rightContent}>
              <Text style={[styles.listTextValue, { color: colors.text }]}>
                {theme === 'light' ? t('adminProfile.settings.themeLight') : t('adminProfile.settings.themeDark')}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.text} />
            </View>
          </TouchableOpacity>
          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.listItem} onPress={() => router.push('/edit-profile')}>
            <Text style={[styles.listText, { color: colors.primary }]}>{t('adminProfile.settings.editProfile')}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.separatorGrueso, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={styles.sectionContainerRow} onPress={() => router.push('/about')}>
          <View style={styles.rowLeft}>
            <Ionicons name="help-circle-outline" size={26} color={theme === 'light' ? '#000' : '#FFF'} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('adminProfile.about')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>

        <View style={[styles.separatorGrueso, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={styles.sectionContainerRow} onPress={handleEliminarCuenta}>
          <View style={styles.rowLeft}>
            <Ionicons name="trash-outline" size={24} color={theme === 'light' ? '#000' : '#FFF'} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('adminProfile.deleteAccount')}</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-dashboard')}>
          <Ionicons name="home" size={22} color="#FFFFFF" />
          <Text style={styles.navText}>{t('admin.principal')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={22} color="#FFFFFF" />
          <Text style={[styles.navText, styles.navTextActive]}>{t('admin.perfil')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-users')}>
          <Ionicons name="settings" size={22} color="#FFFFFF" />
          <Text style={styles.navText}>{t('admin.usuarios')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-monuments')}>
          <Ionicons name="library" size={22} color="#FFFFFF" />
          <Text style={styles.navText}>{t('admin.monumentos')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 25, paddingTop: 40, paddingBottom: 130 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  logoutText: { fontSize: 16, fontWeight: 'bold', textDecorationLine: 'underline' },
  profileSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  
  // 7. ESTILO NUEVO PARA LA FOTO
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  
  profileInfo: { marginLeft: 15 },
  username: { fontSize: 22, fontWeight: 'bold' },
  roleLabel: { fontSize: 15, marginTop: 2 },
  sectionContainer: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionIcon: { marginRight: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  listText: { fontSize: 16, fontWeight: '600' },
  rightContent: { flexDirection: 'row', alignItems: 'center' },
  listTextValue: { fontSize: 16, fontWeight: '600', marginRight: 5 },
  separator: { height: 1, width: '100%' },
  separatorGrueso: { height: 1.5, width: '100%', marginVertical: 15 },
  sectionContainerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#0A2342', height: 90, paddingBottom: 20, position: 'absolute', bottom: 0, width: '100%' },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navText: { fontSize: 9, color: '#FFFFFF', textAlign: 'center', marginTop: 4, fontWeight: '400' },
  navTextActive: { fontWeight: 'bold' }
});