import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// 1. IMPORTACIONES DE FIREBASE
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function AdminListUsersScreen() {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  
  // 👇 Se quitó el <string | null> de TypeScript 👇
  const [menuActivo, setMenuActivo] = useState(null);
  
  // 2. ESTADOS REALES PARA USUARIOS Y CARGA
  const [users, setUsers] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 3. EFECTO PARA CARGAR TURISTAS DESDE FIRESTORE
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      // Hacemos una consulta solo buscando los que tengan rol 'user'
      const q = query(collection(db, "users"), where("rol", "==", "user"));
      const querySnapshot = await getDocs(q);
      
      const usersTemp = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersTemp.push({
          uid: doc.id, // El UID real de Firebase
          id: data.userId || '#---', // El consecutivo
          username: data.username || 'Sin usuario',
          foto: data.profilePicture || null
        });
      });

      setUsers(usersTemp);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setCargando(false);
    }
  };

  const usuariosFiltrados = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.id.includes(searchQuery)
  );

  // 👇 Se quitó el ": string" del parámetro uid 👇
  const toggleMenu = (uid) => {
    if (menuActivo === uid) setMenuActivo(null);
    else setMenuActivo(uid);
  };

  // 👇 Se quitaron los ": string" de uid y username 👇
  const handleEliminar = (uid, username) => {
    setMenuActivo(null);
    
    const ejecutar = async () => {
      try {
        await deleteDoc(doc(db, "users", uid));
        setUsers(prev => prev.filter(u => u.uid !== uid));
        
        if (Platform.OS === 'web') alert(t('adminListUsers.alerts.deleteSuccessWeb', { username }));
        else Alert.alert(t('adminListUsers.alerts.deletedTitle'), t('adminListUsers.alerts.deleteSuccess', { username }));
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        Alert.alert("Error", "No se pudo eliminar al usuario.");
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(t('adminListUsers.alerts.deletePromptWeb', { username }))) ejecutar();
    } else {
      Alert.alert(t('adminListUsers.alerts.deleteTitle'), t('adminListUsers.alerts.deletePrompt', { username }), [
        { text: t('adminListUsers.alerts.cancel'), style: 'cancel' },
        { text: t('adminListUsers.alerts.deleteConfirm'), style: 'destructive', onPress: ejecutar }
      ]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/admin-users')}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('adminListUsers.title')}</Text>
      </View>

      <View style={styles.mainContent}>
        <View style={[styles.cardContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.searchContainer, { borderBottomColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput 
                style={[styles.searchInput, { color: colors.text }]} 
                placeholder={t('adminListUsers.searchPlaceholder')} 
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
          </View>

          {cargando ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <ScrollView 
              showsVerticalScrollIndicator={true} 
              indicatorStyle={theme === 'light' ? 'black' : 'white'}
            >
              {usuariosFiltrados.map((u) => (
                <View key={u.uid} style={[styles.userRow, { borderBottomColor: colors.border }, menuActivo === u.uid ? { zIndex: 10 } : { zIndex: 1 }]}>
                  
                  {/* VALIDACIÓN DE FOTO DE PERFIL */}
                  {u.foto ? (
                    <Image source={{ uri: u.foto }} style={styles.userPhoto} />
                  ) : (
                    <Ionicons name="person-circle" size={45} color="#555555" style={{ marginRight: 15 }} />
                  )}

                  <View style={styles.userInfo}>
                    <Text style={[styles.usernameText, { color: colors.text }]}>{u.username}</Text>
                    <Text style={[styles.idText, { color: colors.textSecondary }]}>ID: {u.id}</Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleMenu(u.uid)}>
                    <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
                  </TouchableOpacity>

                  {/* MENÚ DESPLEGABLE */}
                  {menuActivo === u.uid && (
                    <View style={[styles.dropdownMenu, { backgroundColor: theme === 'light' ? '#FFF' : '#162133', borderColor: colors.border }]}>
                      {/* ENLACE CON EL UID AL PERFIL */}
                      <TouchableOpacity 
                        style={styles.menuItem} 
                        onPress={() => { 
                          setMenuActivo(null); 
                          router.push({ pathname: '/admin-view-profile', params: { uid: u.uid } }); 
                        }}
                      >
                        <Text style={{ color: colors.text }}>{t('adminListUsers.viewProfile')}</Text>
                      </TouchableOpacity>
                      
                      <View style={{ height: 1, backgroundColor: colors.border }} />
                      
                      <TouchableOpacity style={styles.menuItem} onPress={() => handleEliminar(u.uid, u.username)}>
                        <Text style={{ color: '#FF4C4C' }}>{t('adminListUsers.delete')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}

              {usuariosFiltrados.length === 0 && !cargando && (
                <Text style={{ textAlign: 'center', padding: 20, color: colors.textSecondary }}>No se encontraron usuarios.</Text>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  backButton: { position: 'absolute', left: 20, bottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  mainContent: { flex: 1, padding: 20 },
  cardContainer: { flex: 1, borderWidth: 1, borderRadius: 15, overflow: 'hidden' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15 },
  userRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, position: 'relative' },
  userPhoto: { width: 45, height: 45, borderRadius: 22.5, marginRight: 15 },
  userInfo: { flex: 1 },
  usernameText: { fontSize: 16, fontWeight: 'bold' },
  idText: { fontSize: 12 },
  dropdownMenu: { position: 'absolute', right: 40, top: 35, width: 120, borderWidth: 1, borderRadius: 5, elevation: 5, zIndex: 1000 },
  menuItem: { padding: 12 }
});