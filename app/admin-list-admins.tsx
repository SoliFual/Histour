import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
// 1. Importamos el traductor
import { useTranslation } from 'react-i18next';

// 👇 Agregamos más usuarios de prueba para forzar a que aparezca la barra de scroll 👇
const MOCK_ADMINS = [
  { id: '#001', username: 'Fulanita102' },
  { id: '#005', username: 'AdminMaster' },
  { id: '#008', username: 'JefeProy' },
  { id: '#009', username: 'NataliaUX' },
  { id: '#011', username: 'CarlosAdmin' },
  { id: '#012', username: 'MariaSuper' },
  { id: '#014', username: 'LuisRoot' },
  { id: '#015', username: 'AnaAdmin' },
];

export default function AdminListAdminsScreen() {
  const { colors, theme } = useTheme();
  
  // 2. Activamos el traductor
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [menuActivo, setMenuActivo] = useState<string | null>(null);
  const [admins, setAdmins] = useState(MOCK_ADMINS);

  const administradoresFiltrados = admins.filter(admin => 
    admin.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    admin.id.includes(searchQuery)
  );

  const toggleMenu = (id: string) => {
    if (menuActivo === id) setMenuActivo(null);
    else setMenuActivo(id);
  };

  const handleVerPerfil = (username: string) => {
    setMenuActivo(null); 
    router.push('/admin-view-profile'); 
  };

  const handleEliminar = (id: string, username: string) => {
    setMenuActivo(null);

    const ejecutarEliminacion = () => {
      setAdmins(prev => prev.filter(admin => admin.id !== id));
      if (Platform.OS === 'web') alert(t('adminListAdmins.alerts.deleteSuccessWeb', { username }));
      else Alert.alert(t('adminListAdmins.alerts.deletedTitle'), t('adminListAdmins.alerts.deleteSuccess', { username }));
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

          <ScrollView 
            style={styles.innerScroll} 
            showsVerticalScrollIndicator={true} 
            indicatorStyle={theme === 'light' ? 'black' : 'white'}
          >
            {administradoresFiltrados.map((admin) => (
              <View key={admin.id} style={[styles.userRow, { borderBottomColor: colors.border }, menuActivo === admin.id ? { zIndex: 9999, elevation: 10 } : { zIndex: 1, elevation: 1 }]}>
                <Ionicons name="person-circle" size={45} color="#555555" style={styles.avatarIcon} />
                <View style={styles.userInfo}>
                  <Text style={[styles.usernameText, { color: colors.text }]}>{admin.username}</Text>
                  <Text style={[styles.idText, { color: colors.textSecondary }]}>ID: {admin.id}</Text>
                </View>
                <TouchableOpacity style={styles.dotsButton} onPress={() => toggleMenu(admin.id)}>
                  <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
                </TouchableOpacity>

                {menuActivo === admin.id && (
                  <View style={[styles.dropdownMenu, { backgroundColor: theme === 'light' ? '#FFFFFF' : '#162133', borderColor: colors.border }]}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleVerPerfil(admin.username)}>
                      <Text style={[styles.menuText, { color: colors.text }]}>{t('adminListUsers.viewProfile')}</Text>
                    </TouchableOpacity>
                    <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleEliminar(admin.id, admin.username)}>
                      <Text style={styles.menuTextDanger}>{t('adminListUsers.delete')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
            
            {administradoresFiltrados.length === 0 && (
              <Text style={[styles.noResults, { color: colors.textSecondary }]}>{t('adminListAdmins.noResults')}</Text>
            )}
          </ScrollView>

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
  innerScroll: { flex: 1 }, 
  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15, borderBottomWidth: 1, position: 'relative' },
  avatarIcon: { marginRight: 15 },
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