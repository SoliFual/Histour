import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// 1. IMPORTACIONES DE FIREBASE
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function AdminUsersScreen() {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();

  // 2. ESTADOS PARA LOS DATOS REALES Y LA CARGA
  const [administradores, setAdministradores] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 3. EFECTO PARA OBTENER TODOS LOS USUARIOS AL ABRIR LA PANTALLA
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const adminsTemp = [];
        const usersTemp = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Estructuramos los datos que vienen de Firebase
          const usuarioEstructurado = {
            id: data.userId || '#---',
            username: data.username || 'Sin nombre',
            role: data.rol,
            foto: data.profilePicture || null,
          };

          // Los separamos según su rol
          if (data.rol === 'admin') {
            adminsTemp.push(usuarioEstructurado);
          } else {
            usersTemp.push(usuarioEstructurado);
          }
        });

        setAdministradores(adminsTemp);
        setUsuarios(usersTemp);
      } catch (error) {
        console.error("Error al obtener la lista de usuarios:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchUsuarios();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>{t('admin.usuarios')}</Text>
      </View>

      <View style={styles.mainContent}>
        
        {/* MIENTRAS CARGA, MOSTRAMOS LA RUEDITA */}
        {cargando ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.text, marginTop: 10 }}>Cargando usuarios...</Text>
          </View>
        ) : (
          <>
            {/* SECCIÓN DE ADMINISTRADORES */}
            <View style={styles.sectionContainer}>
              <TouchableOpacity style={styles.sectionHeader} onPress={() => router.push('/admin-list-admins')}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('adminUsers.admins')}</Text>
                <Ionicons name="chevron-forward" size={24} color={colors.text} />
              </TouchableOpacity>
              <View style={[styles.cardContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ScrollView style={styles.innerScroll} showsVerticalScrollIndicator={true}>
                  {administradores.length === 0 ? (
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay administradores registrados.</Text>
                  ) : (
                    administradores.map((admin, index) => (
                      <View key={index} style={[styles.userRow, index === administradores.length - 1 ? { borderBottomWidth: 0 } : { borderBottomColor: colors.border }]}>
                        
                        {/* VALIDACIÓN DE FOTO DE PERFIL */}
                        {admin.foto ? (
                          <Image source={{ uri: admin.foto }} style={styles.userPhoto} />
                        ) : (
                          <Ionicons name="person-circle-outline" size={50} color={theme === 'light' ? '#CCC' : '#555'} style={styles.placeholderPhoto} />
                        )}

                        <View style={styles.userInfo}>
                          <Text style={[styles.usernameText, { color: colors.text }]}>{admin.username}</Text>
                          <Text style={[styles.roleText, { color: colors.primary }]}>{t('adminUsers.roleAdmin')}</Text>
                        </View>
                        <View style={styles.rightInfo}>
                          <Text style={[styles.idText, { color: colors.text }]}>ID: {admin.id}</Text>
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>
            </View>

            {/* SECCIÓN DE USUARIOS (TURISTAS) */}
            <View style={styles.sectionContainer}>
              <TouchableOpacity style={styles.sectionHeader} onPress={() => router.push('/admin-list-users')}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('adminUsers.users')}</Text>
                <Ionicons name="chevron-forward" size={24} color={colors.text} />
              </TouchableOpacity>
              <View style={[styles.cardContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ScrollView style={styles.innerScroll} showsVerticalScrollIndicator={true}>
                  {usuarios.length === 0 ? (
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay usuarios registrados.</Text>
                  ) : (
                    usuarios.map((usuario, index) => (
                      <View key={index} style={[styles.userRow, index === usuarios.length - 1 ? { borderBottomWidth: 0 } : { borderBottomColor: colors.border }]}>
                        
                        {/* VALIDACIÓN DE FOTO DE PERFIL */}
                        {usuario.foto ? (
                          <Image source={{ uri: usuario.foto }} style={styles.userPhoto} />
                        ) : (
                          <Ionicons name="person-circle-outline" size={50} color={theme === 'light' ? '#CCC' : '#555'} style={styles.placeholderPhoto} />
                        )}

                        <View style={styles.userInfo}>
                          <Text style={[styles.usernameText, { color: colors.text }]}>{usuario.username}</Text>
                          <Text style={[styles.roleText, { color: colors.textSecondary }]}>{t('adminUsers.roleUser')}</Text>
                        </View>
                        <View style={styles.rightInfo}>
                          <Text style={[styles.idText, { color: colors.text }]}>ID: {usuario.id}</Text>
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>
            </View>
          </>
        )}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-dashboard')}>
          <Ionicons name="home" size={22} color="#FFFFFF" />
          <Text style={styles.navText}>{t('admin.principal')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/admin-profile')}>
          <Ionicons name="person" size={22} color="#FFFFFF" />
          <Text style={styles.navText}>{t('admin.perfil')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="settings" size={22} color="#FFFFFF" />
          <Text style={[styles.navText, styles.navTextActive]}>{t('admin.usuarios')}</Text>
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
  header: { paddingTop: 50, paddingBottom: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000000' },
  mainContent: { flex: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 130 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionContainer: { flex: 1, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  cardContainer: { flex: 1, borderWidth: 1, borderRadius: 15, overflow: 'hidden' },
  innerScroll: { flex: 1 },
  emptyText: { textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15, borderBottomWidth: 1 },
  userPhoto: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  placeholderPhoto: { marginRight: 15 },
  userInfo: { flex: 1 },
  usernameText: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  roleText: { fontSize: 13, fontWeight: '600' },
  rightInfo: { alignItems: 'flex-end', justifyContent: 'center' },
  idText: { fontSize: 12, fontWeight: '500' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#0A2342', height: 90, paddingBottom: 20, position: 'absolute', bottom: 0, width: '100%' },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navText: { fontSize: 9, color: '#FFFFFF', textAlign: 'center', marginTop: 4, fontWeight: '400' },
  navTextActive: { fontWeight: 'bold' }
});