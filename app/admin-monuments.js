import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// IMPORTACIONES DE FIREBASE
import { collection, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function AdminMonumentsScreen() {
  const { colors, theme } = useTheme();
  // Extraemos i18n para saber en qué idioma está la app en este momento
  const { t, i18n } = useTranslation(); 

  const [searchQuery, setSearchQuery] = useState('');
  
  // 👇 Se quitó el <string | null> 👇
  const [menuActivo, setMenuActivo] = useState(null);
  
  const [monumentos, setMonumentos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Variable para saber si estamos en 'en' o 'es'
  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'es';

  // CARGAR LOS MONUMENTOS REALES DE FIREBASE
  useEffect(() => {
    try {
      const q = query(collection(db, "monuments"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const monumentosData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            firestoreId: doc.id,
            displayId: data.monumentoId || 'N/A',
            // Guardamos todo el mapa de traducciones para usarlo después
            traducciones: data.traducciones || null, 
            fallbackName: data.nombre || 'Sin nombre',
            image: data.imagenesUrls && data.imagenesUrls.length > 0 ? data.imagenesUrls[0] : 'https://via.placeholder.com/150'
          };
        });
        setMonumentos(monumentosData);
        setCargando(false);
      }, (error) => {
        console.error("Error al escuchar Firebase:", error);
        alert("Error de permisos o conexión con Firebase. Revisa la consola.");
        setCargando(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error general en el useEffect:", error);
      setCargando(false);
    }
  }, []);

  // FUNCIÓN PARA OBTENER EL NOMBRE EN EL IDIOMA ACTUAL
  const getTranslatedName = (monumento) => {
    if (monumento.traducciones && monumento.traducciones[currentLang] && monumento.traducciones[currentLang].nombre) {
      return monumento.traducciones[currentLang].nombre;
    }
    return monumento.fallbackName; // Si algo falla, mostramos el nombre original
  };

  // FILTRADO DINÁMICO (Busca usando el nombre traducido)
  const monumentosFiltrados = monumentos.filter(monumento => {
    const translatedName = getTranslatedName(monumento);
    return translatedName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           monumento.displayId.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // 👇 Se quitó el ": string" 👇
  const toggleMenu = (id) => {
    if (menuActivo === id) setMenuActivo(null);
    else setMenuActivo(id);
  };

  // 👇 Se quitó el ": string" 👇
  const handleVer = (firestoreId) => {
    setMenuActivo(null);
    router.push({ pathname: '/admin-view-monument', params: { id: firestoreId } }); 
  };

  // 👇 Se quitó el ": string" 👇
  const handleModificar = (firestoreId) => {
    setMenuActivo(null);
    router.push({ pathname: '/admin-modify-monument', params: { id: firestoreId } }); 
  };

  // 👇 Se quitaron los ": string" 👇
  const handleEliminar = (firestoreId, name) => {
    setMenuActivo(null);
    const ejecutarEliminacion = async () => {
      try {
        await deleteDoc(doc(db, "monuments", firestoreId));
        if (Platform.OS === 'web') alert(t('adminMonuments.alerts.deleteSuccessWeb', { name }));
        else Alert.alert(t('adminMonuments.alerts.deletedTitle'), t('adminMonuments.alerts.deleteSuccess', { name }));
      } catch (error) {
        console.error("Error al eliminar:", error);
        Alert.alert("Error", "No se pudo eliminar el monumento.");
      }
    };

    if (Platform.OS === 'web') {
      const confirmar = window.confirm(t('adminMonuments.alerts.deletePromptWeb', { name }));
      if (confirmar) ejecutarEliminacion();
    } else {
      Alert.alert(
        t('adminMonuments.alerts.deleteTitle'),
        t('adminMonuments.alerts.deletePrompt', { name }),
        [
          { text: t('adminMonuments.alerts.cancel'), style: 'cancel' },
          { text: t('adminMonuments.alerts.deleteConfirm'), style: 'destructive', onPress: ejecutarEliminacion }
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>{t('admin.monumentos')}</Text>
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
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {cargando ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <ScrollView style={styles.innerScroll} showsVerticalScrollIndicator={true} indicatorStyle={theme === 'light' ? 'black' : 'white'}>
              {monumentosFiltrados.map((monumento) => {
                // Obtenemos el nombre dinámico para pintar la fila
                const translatedName = getTranslatedName(monumento);

                return (
                  <View key={monumento.firestoreId} style={[styles.monumentoRow, { borderBottomColor: colors.border }, menuActivo === monumento.firestoreId ? { zIndex: 9999 } : { zIndex: 1 }]}>
                    <Image source={{ uri: monumento.image }} style={styles.monumentoPhoto} />
                    <View style={styles.monumentoInfo}>
                      <Text style={[styles.monumentoNameText, { color: colors.text }]} numberOfLines={2}>
                        {translatedName}
                      </Text>
                      <Text style={[styles.idText, { color: colors.textSecondary }]}>ID: {monumento.displayId}</Text>
                    </View>
                    <TouchableOpacity style={styles.dotsButton} onPress={() => toggleMenu(monumento.firestoreId)}>
                      <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
                    </TouchableOpacity>
                    
                    {menuActivo === monumento.firestoreId && (
                      <View style={[styles.dropdownMenu, { backgroundColor: theme === 'light' ? '#FFFFFF' : '#162133', borderColor: colors.border }]}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleVer(monumento.firestoreId)}>
                          <Text style={[styles.menuText, { color: colors.text }]}>{t('admin.ver')}</Text>
                        </TouchableOpacity>
                        <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleModificar(monumento.firestoreId)}>
                          <Text style={[styles.menuText, { color: colors.text }]}>{t('admin.modificar')}</Text>
                        </TouchableOpacity>
                        <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleEliminar(monumento.firestoreId, translatedName)}>
                          <Text style={styles.menuTextDanger}>{t('admin.eliminar')}</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
              {monumentosFiltrados.length === 0 && <Text style={[styles.noResults, { color: colors.textSecondary }]}>{t('adminMonuments.noResults')}</Text>}
            </ScrollView>
          )}

          <TouchableOpacity style={[styles.addButton, { borderTopColor: colors.border }]} onPress={() => router.push('/admin-add-monument')}>
            <Ionicons name="add-circle-outline" size={24} color={colors.text} />
            <Text style={[styles.addButtonText, { color: colors.text }]}>{t('admin.agregar_monumento')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-dashboard')}><Ionicons name="home" size={22} color="#FFFFFF" /><Text style={styles.navText}>{t('admin.principal')}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-profile')}><Ionicons name="person" size={22} color="#FFFFFF" /><Text style={styles.navText}>{t('admin.perfil')}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-users')}><Ionicons name="settings" size={22} color="#FFFFFF" /><Text style={styles.navText}>{t('admin.usuarios')}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Ionicons name="library" size={22} color="#FFFFFF" /><Text style={[styles.navText, styles.navTextActive]}>{t('admin.monumentos')}</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingBottom: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000000' },
  mainContent: { flex: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 130 },
  cardContainer: { flex: 1, borderWidth: 1, borderRadius: 15, overflow: 'visible', elevation: 3 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  innerScroll: { flex: 1, overflow: 'visible' }, 
  monumentoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1 },
  monumentoPhoto: { width: 60, height: 45, borderRadius: 8, marginRight: 15, backgroundColor: '#E0E0E0' },
  monumentoInfo: { flex: 1, justifyContent: 'center' },
  monumentoNameText: { fontSize: 15, fontWeight: '600', marginBottom: 2, paddingRight: 10 },
  idText: { fontSize: 12 },
  dotsButton: { padding: 5 },
  dropdownMenu: { position: 'absolute', right: 40, top: 35, width: 130, borderWidth: 1, borderRadius: 5, elevation: 5 },
  menuItem: { paddingVertical: 12, paddingHorizontal: 15 },
  menuDivider: { height: 1, width: '100%' },
  menuText: { fontSize: 14, fontWeight: '500' },
  menuTextDanger: { fontSize: 14, fontWeight: '500', color: '#FF4C4C' },
  noResults: { textAlign: 'center', padding: 20, fontSize: 14 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderTopWidth: 1 },
  addButtonText: { fontSize: 16, fontWeight: '600', marginLeft: 10 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#0A2342', height: 90, paddingBottom: 20, position: 'absolute', bottom: 0, width: '100%' },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navText: { fontSize: 9, color: '#FFFFFF', textAlign: 'center', marginTop: 4, fontWeight: '400' },
  navTextActive: { fontWeight: 'bold' }
});