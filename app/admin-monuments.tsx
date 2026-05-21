import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Datos de prueba con monumentos reales para la app Histour
const MOCK_MONUMENTOS = [
  { id: '#M001', name: 'Catedral de Guadalajara', image: 'https://images.unsplash.com/photo-1583089892943-e02e52f17d5c?q=80&w=200&auto=format&fit=crop' },
  { id: '#M002', name: 'Hospicio Cabañas', image: 'https://images.unsplash.com/photo-1629807402636-218a5628b5e9?q=80&w=200&auto=format&fit=crop' },
  { id: '#M003', name: 'Teatro Degollado', image: 'https://images.unsplash.com/photo-1572986427301-1628d0034a6e?q=80&w=200&auto=format&fit=crop' },
  { id: '#M004', name: 'Arcos de Guadalajara', image: 'https://images.unsplash.com/photo-1571216503932-512b9d7cd229?q=80&w=200&auto=format&fit=crop' },
  { id: '#M005', name: 'Rotonda de los Jaliscienses Ilustres', image: 'https://images.unsplash.com/photo-1605650117004-9d58700ba3f2?q=80&w=200&auto=format&fit=crop' },
];

export default function AdminMonumentsScreen() {
  const { colors, theme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [menuActivo, setMenuActivo] = useState<string | null>(null);
  const [monumentos, setMonumentos] = useState(MOCK_MONUMENTOS);

  // Filtro que busca tanto por nombre como por ID
  const monumentosFiltrados = monumentos.filter(monumento => 
    monumento.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    monumento.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMenu = (id: string) => {
    if (menuActivo === id) setMenuActivo(null);
    else setMenuActivo(id);
  };

  const handleVer = (name: string) => {
    setMenuActivo(null);
    router.push('/admin-view-monument'); 
  };

  const handleModificar = (name: string) => {
    setMenuActivo(null);
    // 👇 Habilitamos la navegación aquí
    router.push('/admin-modify-monument'); 
  };

  const handleEliminar = (id: string, name: string) => {
    setMenuActivo(null);

    const ejecutarEliminacion = () => {
      setMonumentos(prev => prev.filter(monumento => monumento.id !== id));
      if (Platform.OS === 'web') alert(`El monumento "${name}" ha sido eliminado.`);
      else Alert.alert('Eliminado', `El monumento "${name}" ha sido eliminado.`);
    };

    if (Platform.OS === 'web') {
      const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el monumento "${name}"?`);
      if (confirmar) ejecutarEliminacion();
    } else {
      Alert.alert(
        'Eliminar Monumento',
        `¿Estás seguro de que deseas eliminar permanentemente el monumento "${name}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sí, Eliminar', style: 'destructive', onPress: ejecutarEliminacion }
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* ENCABEZADO AZUL */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Gestión de monumentos</Text>
      </View>

      <View style={styles.mainContent}>
        <View style={[styles.cardContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          
          {/* BUSCADOR */}
          <View style={[styles.searchContainer, { borderBottomColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput 
              style={[styles.searchInput, { color: colors.text }]} 
              placeholder="Buscar por nombre o ID..." 
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

          {/* LISTA SCROLLEABLE */}
          <ScrollView 
            style={styles.innerScroll} 
            showsVerticalScrollIndicator={true} 
            indicatorStyle={theme === 'light' ? 'black' : 'white'}
          >
            {monumentosFiltrados.map((monumento) => (
              <View 
                key={monumento.id} 
                style={[
                  styles.monumentoRow, 
                  { borderBottomColor: colors.border }, 
                  menuActivo === monumento.id ? { zIndex: 9999, elevation: 10 } : { zIndex: 1, elevation: 1 }
                ]}
              >
                {/* IMAGEN DEL MONUMENTO */}
                <Image source={{ uri: monumento.image }} style={styles.monumentoPhoto} />
                
                {/* INFO DEL MONUMENTO */}
                <View style={styles.monumentoInfo}>
                  <Text style={[styles.monumentoNameText, { color: colors.text }]} numberOfLines={2}>
                    {monumento.name}
                  </Text>
                  <Text style={[styles.idText, { color: colors.textSecondary }]}>ID: {monumento.id}</Text>
                </View>

                {/* BOTÓN 3 PUNTITOS */}
                <TouchableOpacity style={styles.dotsButton} onPress={() => toggleMenu(monumento.id)}>
                  <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
                </TouchableOpacity>

                {/* MENÚ DESPLEGABLE (VER, MODIFICAR, ELIMINAR) */}
                {menuActivo === monumento.id && (
                  <View style={[styles.dropdownMenu, { backgroundColor: theme === 'light' ? '#FFFFFF' : '#162133', borderColor: colors.border }]}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleVer(monumento.name)}>
                      <Text style={[styles.menuText, { color: colors.text }]}>Ver</Text>
                    </TouchableOpacity>
                    
                    <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
                    
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleModificar(monumento.name)}>
                      <Text style={[styles.menuText, { color: colors.text }]}>Modificar</Text>
                    </TouchableOpacity>
                    
                    <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
                    
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleEliminar(monumento.id, monumento.name)}>
                      <Text style={styles.menuTextDanger}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
            
            {monumentosFiltrados.length === 0 && (
              <Text style={[styles.noResults, { color: colors.textSecondary }]}>No se encontraron monumentos.</Text>
            )}
          </ScrollView>

          {/* BOTÓN AGREGAR MONUMENTO */}
          <TouchableOpacity 
            style={[styles.addButton, { borderTopColor: colors.border }]} 
            onPress={() => router.push('/admin-add-monument')} // 👈 Cambia el alert por esto
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.text} />
            <Text style={[styles.addButtonText, { color: colors.text }]}>Agregar monumento</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PANEL INFERIOR OSCURO */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-dashboard')}>
          <Ionicons name="home" size={22} color="#FFFFFF" />
          <Text style={styles.navText}>Principal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-profile')}>
          <Ionicons name="person" size={22} color="#FFFFFF" />
          <Text style={styles.navText}>Usuario</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-users')}>
          <Ionicons name="settings" size={22} color="#FFFFFF" />
          <Text style={styles.navText}>Gestión de{'\n'}Usuarios</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="library" size={22} color="#FFFFFF" />
          <Text style={[styles.navText, styles.navTextActive]}>Gestión de{'\n'}Monumentos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingBottom: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000000' },
  mainContent: { flex: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  cardContainer: { flex: 1, borderWidth: 1, borderRadius: 15, overflow: 'visible', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  innerScroll: { flex: 1, overflow: 'visible' }, 
  monumentoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1, position: 'relative' },
  monumentoPhoto: { width: 60, height: 45, borderRadius: 8, marginRight: 15, backgroundColor: '#E0E0E0' },
  monumentoInfo: { flex: 1, justifyContent: 'center' },
  monumentoNameText: { fontSize: 15, fontWeight: '600', marginBottom: 2, paddingRight: 10 },
  idText: { fontSize: 12 },
  dotsButton: { padding: 5 },
  dropdownMenu: { position: 'absolute', right: 40, top: 35, width: 130, borderWidth: 1, borderRadius: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  menuItem: { paddingVertical: 12, paddingHorizontal: 15 },
  menuDivider: { height: 1, width: '100%' },
  menuText: { fontSize: 14, fontWeight: '500' },
  menuTextDanger: { fontSize: 14, fontWeight: '500', color: '#FF4C4C' },
  noResults: { textAlign: 'center', padding: 20, fontSize: 14 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderTopWidth: 1 },
  addButtonText: { fontSize: 16, fontWeight: '600', marginLeft: 10 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#0A2342', height: 75, paddingBottom: 10 },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navText: { fontSize: 9, color: '#FFFFFF', textAlign: 'center', marginTop: 4, fontWeight: '400' },
  navTextActive: { fontWeight: 'bold' }
});