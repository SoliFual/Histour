import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const MOCK_USUARIOS = [
  { id: '#001', username: 'Fulanita102', role: 'Administrador', foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' },
  { id: '#005', username: 'AdminMaster', role: 'Administrador', foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop' },
  { id: '#008', username: 'JefeProy', role: 'Administrador', foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop' },
  { id: '#009', username: 'NataliaUX', role: 'Administrador', foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop' },
  { id: '#002', username: 'CarlosDev', role: 'Usuario', foto: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop' },
  { id: '#003', username: 'AnaMaria', role: 'Usuario', foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop' },
  { id: '#004', username: 'Pedro99', role: 'Usuario', foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop' },
  { id: '#006', username: 'SofiaGdl', role: 'Usuario', foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop' },
  { id: '#007', username: 'LaloTours', role: 'Usuario', foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop' },
  { id: '#010', username: 'VisitanteX', role: 'Usuario', foto: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=150&auto=format&fit=crop' },
];

export default function AdminUsersScreen() {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();

  const administradores = MOCK_USUARIOS.filter(user => user.role === 'Administrador');
  const usuarios = MOCK_USUARIOS.filter(user => user.role === 'Usuario');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>{t('admin.usuarios')}</Text>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.sectionContainer}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => router.push('/admin-list-admins')}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('adminUsers.admins')}</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={[styles.cardContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ScrollView style={styles.innerScroll} showsVerticalScrollIndicator={true}>
              {administradores.map((admin, index) => (
                <View key={index} style={[styles.userRow, index === administradores.length - 1 ? { borderBottomWidth: 0 } : { borderBottomColor: colors.border }]}>
                  <Image source={{ uri: admin.foto }} style={styles.userPhoto} />
                  <View style={styles.userInfo}>
                    <Text style={[styles.usernameText, { color: colors.text }]}>{admin.username}</Text>
                    <Text style={[styles.roleText, { color: colors.primary }]}>{t('adminUsers.roleAdmin')}</Text>
                  </View>
                  <View style={styles.rightInfo}>
                    <Text style={[styles.idText, { color: colors.text }]}>ID: {admin.id}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => router.push('/admin-list-users')}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('adminUsers.users')}</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={[styles.cardContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ScrollView style={styles.innerScroll} showsVerticalScrollIndicator={true}>
              {usuarios.map((usuario, index) => (
                <View key={index} style={[styles.userRow, index === usuarios.length - 1 ? { borderBottomWidth: 0 } : { borderBottomColor: colors.border }]}>
                  <Image source={{ uri: usuario.foto }} style={styles.userPhoto} />
                  <View style={styles.userInfo}>
                    <Text style={[styles.usernameText, { color: colors.text }]}>{usuario.username}</Text>
                    <Text style={[styles.roleText, { color: colors.textSecondary }]}>{t('adminUsers.roleUser')}</Text>
                  </View>
                  <View style={styles.rightInfo}>
                    <Text style={[styles.idText, { color: colors.text }]}>ID: {usuario.id}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
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
  sectionContainer: { flex: 1, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  cardContainer: { flex: 1, borderWidth: 1, borderRadius: 15, overflow: 'hidden' },
  innerScroll: { flex: 1 },
  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15, borderBottomWidth: 1 },
  userPhoto: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
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