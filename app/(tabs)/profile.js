import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// 1. IMPORTACIONES DE FIREBASE Y FAVORITOS
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useFavorites } from '../../context/FavoritesContext';
import { auth, db } from '../../firebaseConfig';

export default function ProfileScreen() {
  const { theme, colors, setTheme } = useTheme(); 
  const [showThemeOptions, setShowThemeOptions] = useState(false);
  const { t } = useTranslation();
  
  // Extraemos los favoritos directamente del contexto global
  const { favorites } = useFavorites();

  // ESTADOS DEL USUARIO
  const [usuarioBD, setUsuarioBD] = useState(null);
  const [cargando, setCargando] = useState(true);

  // EFECTO: DESCARGAR LOS DATOS DEL PERFIL
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUsuarioBD(docSnap.data());
          }
        } catch (error) {
          console.error("Error al cargar datos del perfil:", error);
        }
      } else {
        setUsuarioBD(null);
      }
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Hubo un error al cerrar sesión.");
    }
  };

  const handleEliminarCuenta = () => {
    if (Platform.OS === 'web') {
      const confirmarWeb = window.confirm(t('userProfile.alerts.deletePromptWeb'));
      if (confirmarWeb) {
        alert(t('userProfile.alerts.deleteSuccessWeb'));
        router.replace('/login');
      }
    } else {
      Alert.alert(
        t('userProfile.alerts.deleteTitle'),
        t('userProfile.alerts.deletePrompt'),
        [
          { text: t('userProfile.alerts.cancel'), style: 'cancel' },
          {
            text: t('userProfile.alerts.accept'),
            style: 'destructive', 
            onPress: () => {
              router.replace('/login');
            },
          },
        ]
      );
    }
  };

  if (cargando) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      
      {/* ENCABEZADO */}
      <View style={styles.topHeader}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('userProfile.headerTitle')}</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={[styles.logoutText, { color: colors.primary }]}>{t('userProfile.logout')}</Text>
        </TouchableOpacity>
      </View>

      {/* DETALLES DE USUARIO REALES */}
      <View style={styles.userInfoContainer}>
        {usuarioBD?.profilePicture ? (
          <Image source={{ uri: usuarioBD.profilePicture }} style={styles.avatarImage} />
        ) : (
          <Ionicons name="person-circle" size={100} color={theme === 'light' ? '#333333' : '#FFFFFF'} style={styles.avatarIcon} />
        )}
        
        <View style={styles.userDetails}>
          <Text style={[styles.username, { color: colors.primary }]}>
            {usuarioBD?.username || 'Usuario'}
          </Text>
          <Text style={[styles.userStat, { color: colors.primary }]}>
            {t('userProfile.favoritePlaces', { count: favorites.length })}
          </Text>
        </View>
      </View>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      {/* SECCIÓN CONFIGURACIÓN */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name="settings-sharp" size={28} color={theme === 'light' ? '#333333' : '#FFFFFF'} style={styles.sectionIcon} />
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('userProfile.settings.title')}</Text>
        </View>

        <TouchableOpacity style={styles.listItem} onPress={() => router.push('/language')}>
          <Text style={[styles.listItemText, { color: colors.textSecondary }]}>{t('userProfile.settings.language')}</Text>
          <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.listItem} onPress={() => setShowThemeOptions(!showThemeOptions)}>
          <Text style={[styles.listItemText, { color: colors.textSecondary }]}>{t('userProfile.settings.theme')}</Text>
          <View style={styles.themeSelector}>
            <Text style={[styles.listItemValue, { color: colors.textSecondary }]}>
              {theme === 'light' ? t('userProfile.settings.themeLight') : t('userProfile.settings.themeDark')}
            </Text>
            <Ionicons name={showThemeOptions ? "chevron-up" : "chevron-down"} size={22} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        {showThemeOptions && (
          <View style={styles.dropdown}>
            <TouchableOpacity style={styles.dropdownOption} onPress={() => {setTheme('light'); setShowThemeOptions(false);}}>
              <Text style={[styles.dropdownText, { color: theme === 'light' ? colors.primary : colors.textSecondary }]}>
                {t('userProfile.settings.themeLight')}
              </Text>
              {theme === 'light' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.dropdownOption} onPress={() => {setTheme('dark'); setShowThemeOptions(false);}}>
              <Text style={[styles.dropdownText, { color: theme === 'dark' ? colors.primary : colors.textSecondary }]}>
                {t('userProfile.settings.themeDark')}
              </Text>
              {theme === 'dark' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.listItem} onPress={() => router.push('/edit-profile')}>
          <Text style={[styles.listItemText, { color: colors.textSecondary }]}>{t('userProfile.settings.editProfile')}</Text>
          <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      {/* SECCIÓN ACERCA DE */}
      <TouchableOpacity style={styles.aboutContainer} onPress={() => router.push('/about')}>
        <View style={styles.sectionHeaderNoMargin}>
          <Ionicons name="help-circle" size={28} color={theme === 'light' ? '#333333' : '#FFFFFF'} style={styles.sectionIcon} />
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('userProfile.about')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
      </TouchableOpacity>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      {/* SECCIÓN: POLÍTICA DE PRIVACIDAD */}
      <TouchableOpacity style={styles.aboutContainer} onPress={() => router.push('/privacy-policy')}>
        <View style={styles.sectionHeaderNoMargin}>
          <Ionicons name="shield-checkmark" size={28} color={theme === 'light' ? '#333333' : '#FFFFFF'} style={styles.sectionIcon} />
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('userProfile.privacyPolicy')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
      </TouchableOpacity>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      {/* SECCIÓN ELIMINAR CUENTA */}
      <TouchableOpacity style={styles.deleteContainer} onPress={handleEliminarCuenta}>
        <Ionicons name="trash" size={28} color={theme === 'light' ? '#333333' : '#FFFFFF'} style={styles.sectionIcon} />
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('userProfile.deleteAccount')}</Text>
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
  
  /* NUEVOS ESTILOS PARA LA FOTO */
  avatarIcon: { marginRight: 20, marginLeft: -5 },
  avatarImage: { width: 90, height: 90, borderRadius: 45, marginRight: 20, backgroundColor: '#DDDDDD' },
  
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