import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Datos de prueba para usuarios (Agregamos varios para que se vea el scroll)
const MOCK_USERS = [
  { id: '#002', username: 'CarlosDev', foto: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop' },
  { id: '#003', username: 'AnaMaria', foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop' },
  { id: '#004', username: 'Pedro99', foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop' },
  { id: '#006', username: 'SofiaGdl', foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop' },
  { id: '#007', username: 'LaloTours', foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop' },
  { id: '#010', username: 'VisitanteX', foto: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=150&auto=format&fit=crop' },
  { id: '#012', username: 'TuristaLibre', foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop' },
];

export default function AdminListUsersScreen() {
  const { colors, theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuActivo, setMenuActivo] = useState<string | null>(null);
  const [users, setUsers] = useState(MOCK_USERS);

  const usuariosFiltrados = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.id.includes(searchQuery)
  );

  const toggleMenu = (id: string) => {
    if (menuActivo === id) setMenuActivo(null);
    else setMenuActivo(id);
  };

  const handleEliminar = (id: string, username: string) => {
    setMenuActivo(null);
    const ejecutar = () => {
      setUsers(prev => prev.filter(u => u.id !== id));
      if (Platform.OS === 'web') alert(`Usuario ${username} eliminado.`);
      else Alert.alert('Eliminado', `Usuario ${username} eliminado.`);
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`¿Eliminar permanentemente a ${username}?`)) ejecutar();
    } else {
      Alert.alert('Eliminar Usuario', `¿Eliminar a ${username}?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: ejecutar }
      ]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/admin-users')}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Usuarios</Text>
      </View>

      <View style={styles.mainContent}>
        <View style={[styles.cardContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.searchContainer, { borderBottomColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput 
                style={[styles.searchInput, { color: colors.text }]} 
                placeholder="Buscar usuario o ID..." 
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={true} 
            indicatorStyle={theme === 'light' ? 'black' : 'white'}
          >
            {usuariosFiltrados.map((u) => (
              <View key={u.id} style={[styles.userRow, { borderBottomColor: colors.border }, menuActivo === u.id ? { zIndex: 10 } : { zIndex: 1 }]}>
                <Image source={{ uri: u.foto }} style={styles.userPhoto} />
                <View style={styles.userInfo}>
                  <Text style={[styles.usernameText, { color: colors.text }]}>{u.username}</Text>
                  <Text style={[styles.idText, { color: colors.textSecondary }]}>ID: {u.id}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleMenu(u.id)}>
                  <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
                </TouchableOpacity>

                {menuActivo === u.id && (
                  <View style={[styles.dropdownMenu, { backgroundColor: theme === 'light' ? '#FFF' : '#162133', borderColor: colors.border }]}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuActivo(null); router.push('/admin-view-user-profile'); }}>
                      <Text style={{ color: colors.text }}>Ver perfil</Text>
                    </TouchableOpacity>
                    <View style={{ height: 1, backgroundColor: colors.border }} />
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleEliminar(u.id, u.username)}>
                      <Text style={{ color: '#FF4C4C' }}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
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