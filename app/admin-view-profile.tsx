import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
// 1. Importamos el traductor
import { useTranslation } from 'react-i18next';

export default function AdminViewProfileScreen() {
  const { colors, theme } = useTheme();

  // 2. Activamos el traductor
  const { t } = useTranslation();

  // DATOS DE PRUEBA (Simulando la información del usuario que seleccionamos)
  const perfilInfo = {
    username: 'Fulanita102',
    nombre: 'Fulanita Perez Lopez',
    correo: 'fulanita@gmail.com',
    rol: 'Administrador', // Este dato luego vendrá de tu base de datos
    id: '#001'
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      
      {/* 1. ENCABEZADO (Solo la flecha de regreso y el título) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
          {/* Título traducido */}
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('adminViewProfile.title')}</Text>
        </TouchableOpacity>
      </View>

      {/* 2. SECCIÓN DEL AVATAR (Sin opción de cambiar foto) */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatarCircle, { borderColor: theme === 'light' ? '#333333' : '#FFFFFF' }]}>
          {/* Usamos un ícono de persona en lugar de cámara porque es solo lectura */}
          <Ionicons name="person" size={80} color={theme === 'light' ? '#333333' : '#FFFFFF'} />
        </View>
        
        <Text style={[styles.usernameText, { color: colors.primary }]}>{perfilInfo.username}</Text>
      </View>

      {/* 3. INFORMACIÓN DEL USUARIO (Sin íconos de editar) */}
      <View style={styles.infoContainer}>
        
        <View style={styles.fieldWrapper}>
          <Text style={[styles.fieldLabel, { color: colors.primary }]}>{t('adminViewProfile.labels.userId')}</Text>
          <Text style={[styles.fieldValue, { color: colors.primary }]}>{perfilInfo.id}</Text>
        </View>

        <View style={styles.fieldWrapper}>
          <Text style={[styles.fieldLabel, { color: colors.primary }]}>{t('adminViewProfile.labels.name')}</Text>
          <Text style={[styles.fieldValue, { color: colors.primary }]}>{perfilInfo.nombre}</Text>
        </View>

        <View style={styles.fieldWrapper}>
          <Text style={[styles.fieldLabel, { color: colors.primary }]}>{t('adminViewProfile.labels.email')}</Text>
          <Text style={[styles.fieldValue, { color: colors.primary }]}>{perfilInfo.correo}</Text>
        </View>

        <View style={styles.fieldWrapper}>
          <Text style={[styles.fieldLabel, { color: colors.primary }]}>{t('adminViewProfile.labels.role')}</Text>
          <Text style={[styles.fieldValue, { color: colors.primary }]}>{perfilInfo.rol}</Text>
        </View>

      </View>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 25, 
    paddingTop: 50 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 50 
  },
  backButton: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginLeft: 5 
  },
  avatarSection: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  avatarCircle: { 
    width: 150, 
    height: 150, 
    borderRadius: 75, 
    borderWidth: 6, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  usernameText: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  infoContainer: { 
    paddingHorizontal: 10, 
    paddingBottom: 40 
  },
  fieldWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(78, 151, 209, 0.3)', 
    paddingBottom: 8,
    marginBottom: 25 
  },
  fieldLabel: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    marginRight: 10,
    width: 140, 
  },
  fieldValue: { 
    flex: 1, 
    fontSize: 15, 
    fontWeight: '500', 
  }
});