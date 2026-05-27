import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// IMPORTACIONES DE FIREBASE
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function AdminListAdminsScreen() {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  
  // 👇 Se quitó el <string | null> de TypeScript 👇
  const [menuActivo, setMenuActivo] = useState(null);
  
  const [admins, setAdmins] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarAdministradores();
  }, []);

  const cargarAdministradores = async () => {
    setCargando(true);
    try {
      const q = query(collection(db, "users"), where("rol", "==", "admin"));
      const querySnapshot = await getDocs(q);
      
      const adminsTemp = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        adminsTemp.push({
          uid: doc.id, 
          id: data.userId || '#---', 
          username: data.username || 'Sin usuario',
          foto: data.profilePicture || null
        });
      });

      setAdmins(adminsTemp);
    } catch (error) {
      console.error("Error al cargar admins:", error);
    } finally {
      setCargando(false);
    }
  };

  const administradoresFiltrados = admins.filter(admin => 
    admin.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    admin.id.includes(searchQuery)
  );

  // 👇 Se quitó el ": string" del parámetro uid 👇
  const toggleMenu = (uid) => {
    if (menuActivo === uid) setMenuActivo(null);
    else setMenuActivo(uid);
  };

  // 👇 Se quitó el ": string" del parámetro uid 👇
  const handleVerPerfil = (uid) => {
    setMenuActivo(null); 
    router.push({ 
      pathname: '/admin-view-profile', 
      params: { uid: uid } 
    }); 
  };

  // 👇 Se quitaron los ": string" de uid y username 👇
  const handleEliminar = (uid, username) => {
    setMenuActivo(null);

    const ejecutarEliminacion = async () => {
      try {
        await deleteDoc(doc(db, "users", uid));
        
        setAdmins(prev => prev.filter(admin => admin.uid !== uid));
        
        if (Platform.OS === 'web') alert(t('adminListAdmins.alerts.deleteSuccessWeb', { username }));
        else Alert.alert(t('adminListAdmins.alerts.deletedTitle'), t('adminListAdmins.alerts.deleteSuccess', { username }));
      } catch (error) {
        console.error("Error al eliminar admin:", error);
        Alert.alert("Error", "No se pudo eliminar al administrador.");
      }
    };

    if (Platform.OS === 'web') {
      const confirmar = window.confirm(t('adminListAdmins.alerts.deletePromptWeb', { username }));
      if (confirmar) ejecutarEliminacion();
    } else {
      Alert.alert(
        t('adminListAdmins.alerts.deleteTitle'),
        t('adminListAdmins.alerts.deletePrompt', { username }),
        [
          { text: t('adminListAdmins.alerts.cancel'), style: 'cancel' },
          { text: t('adminListAdmins.alerts.deleteConfirm'), style: 'destructive', onPress: ejecutarEliminacion }
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/admin-users')}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('adminUsers.admins')}</Text>
      </View>

      <View style={styles.mainContent}>
        <View style={[styles.cardContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          
          <View style={[styles.searchContainer, { borderBottomColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput 
              style={[styles.searchInput, { color: colors.text }]} 
              placeholder={t('admin.buscar')} 
              placeholderTextColor={colors.textSecondary} 
              value={searchQuery} 
              onChangeText={setSearchQuery} 
            />
          </View>

          {cargando ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <ScrollView 
              style={styles.innerScroll} 
              showsVerticalScrollIndicator={true} 
              indicatorStyle={theme === 'light' ? 'black' : 'white'}
            >
              {administradoresFiltrados.map((admin) => (
                <View key={admin.uid} style={[styles.userRow, { borderBottomColor: colors.border }, menuActivo === admin.uid ? { zIndex: 9999, elevation: 10 } : { zIndex: 1, elevation: 1 }]}>
                  
                  {/* VALIDACIÓN DE FOTO DE PERFIL */}
                  {admin.foto ? (
                    <Image source={{ uri: admin.foto }} style={styles.avatarImage} />
                  ) : (
                    <Ionicons name="person-circle" size={45} color="#555555" style={styles.avatarIcon} />
                  )}

                  <View style={styles.userInfo}>
                    <Text style={[styles.usernameText, { color: colors.text }]}>{admin.username}</Text>
                    <Text style={[styles.idText, { color: colors.textSecondary }]}>ID: {admin.id}</Text>
                  </View>
                  <TouchableOpacity style={styles.dotsButton} onPress={() => toggleMenu(admin.uid)}>
                    <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
                  </TouchableOpacity>

                  {/* MENÚ DESPLEGABLE */}
                  {menuActivo === admin.uid && (
                    <View style={[styles.dropdownMenu, { backgroundColor: theme === 'light' ? '#FFFFFF' : '#162133', borderColor: colors.border }]}>
                      <TouchableOpacity style={styles.menuItem} onPress={() => handleVerPerfil(admin.uid)}>
                        <Text style={[styles.menuText, { color: colors.text }]}>{t('adminListUsers.viewProfile')}</Text>
                      </TouchableOpacity>
                      <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
                      <TouchableOpacity style={styles.menuItem} onPress={() => handleEliminar(admin.uid, admin.username)}>
                        <Text style={styles.menuTextDanger}>{t('adminListUsers.delete')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
              
              {administradoresFiltrados.length === 0 && !cargando && (
                <Text style={[styles.noResults, { color: colors.textSecondary }]}>{t('adminListAdmins.noResults')}</Text>
              )}
            </ScrollView>
          )}

          <TouchableOpacity style={[styles.addButton, { borderTopColor: colors.border }]} onPress={() => router.push('/admin-add-admin')}>
            <Ionicons name="add-circle-outline" size={24} color={colors.text} />
            <Text style={[styles.addButtonText, { color: colors.text }]}>{t('adminListAdmins.addAdmin')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  backButton: { position: 'absolute', left: 20, bottom: 20, padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000000' },
  mainContent: { flex: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  cardContainer: { flex: 1, borderWidth: 1, borderRadius: 15, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  innerScroll: { flex: 1 }, 
  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15, borderBottomWidth: 1, position: 'relative' },
  avatarIcon: { marginRight: 15 },
  avatarImage: { width: 45, height: 45, borderRadius: 22.5, marginRight: 15 }, // Estilo para foto real
  userInfo: { flex: 1 },
  usernameText: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  idText: { fontSize: 12 },
  dotsButton: { padding: 5 },
  dropdownMenu: { position: 'absolute', right: 40, top: 35, width: 120, borderWidth: 1, borderRadius: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  menuItem: { paddingVertical: 10, paddingHorizontal: 15 },
  menuDivider: { height: 1, width: '100%' },
  menuText: { fontSize: 14, fontWeight: '500' },
  menuTextDanger: { fontSize: 14, fontWeight: '500', color: '#FF4C4C' },
  noResults: { textAlign: 'center', padding: 20, fontSize: 14 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderTopWidth: 1 },
  addButtonText: { fontSize: 16, fontWeight: '600', marginLeft: 10 }
});