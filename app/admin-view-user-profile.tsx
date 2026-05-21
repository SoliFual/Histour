import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function AdminViewUserProfileScreen() {
  const { colors, theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.avatarSection}>
        <View style={[styles.avatarCircle, { borderColor: theme === 'light' ? '#333' : '#FFF' }]}>
          <Ionicons name="person" size={70} color={theme === 'light' ? '#333' : '#FFF'} />
        </View>
        <Text style={[styles.usernameText, { color: colors.primary }]}>CarlosDev</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.fieldWrapper}>
          <Text style={[styles.fieldLabel, { color: colors.primary }]}>Nombre:</Text>
          <Text style={[styles.fieldValue, { color: colors.primary }]}>Carlos Martínez Ruiz</Text>
        </View>
        <View style={styles.fieldWrapper}>
          <Text style={[styles.fieldLabel, { color: colors.primary }]}>Correo:</Text>
          <Text style={[styles.fieldValue, { color: colors.primary }]}>carlos.dev@histour.mx</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 25, paddingTop: 50 },
  header: { marginBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 40 },
  avatarCircle: { width: 130, height: 130, borderRadius: 65, borderWidth: 5, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  usernameText: { fontSize: 24, fontWeight: 'bold' },
  infoContainer: { paddingHorizontal: 10 },
  fieldWrapper: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)', paddingBottom: 10, marginBottom: 20 },
  fieldLabel: { fontSize: 14, fontWeight: 'bold', width: 100 },
  fieldValue: { flex: 1, fontSize: 14 }
});