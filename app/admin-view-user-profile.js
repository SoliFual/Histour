import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router'; // <-- Importamos para atrapar el ID
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// 1. IMPORTACIONES DE FIREBASE
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function AdminViewUserProfileScreen() {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();

  // 2. ATRAPAMOS EL UID DEL TURISTA
  const { uid } = useLocalSearchParams();

  // 3. ESTADOS PARA GUARDAR LA INFORMACIÓN Y CONTROLAR LA CARGA
  const [perfilInfo, setPerfilInfo] = useState(null);
  const [cargando, setCargando] = useState(true);

  // 4. EFECTO PARA BUSCAR AL TURISTA EN FIRESTORE
  useEffect(() => {
    const fetchUserData = async () => {
      if (!uid) {
        setCargando(false);
        return;
      }

      try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setPerfilInfo({
            username: data.username || 'Sin usuario',
            nombre: data.fullName || 'Sin nombre',
            correo: data.email || 'Sin correo',
            foto: data.profilePicture || null
          });
        }
      } catch (error) {
        console.error("Error al obtener el perfil del turista:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchUserData();
  }, [uid]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      
      {/* 1. ENCABEZADO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* PANTALLA DE CARGA */}
      {cargando ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 10 }}>Cargando perfil...</Text>
        </View>
      ) : !perfilInfo ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
          <Ionicons name="warning-outline" size={50} color="#E74C3C" />
          <Text style={{ color: colors.text, marginTop: 10, fontSize: 16 }}>No se pudo cargar la información.</Text>
        </View>
      ) : (
        <>
          {/* 2. SECCIÓN DEL AVATAR */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatarCircle, { borderColor: theme === 'light' ? '#333' : '#FFF' }]}>
              {perfilInfo.foto ? (
                <Image source={{ uri: perfilInfo.foto }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={70} color={theme === 'light' ? '#333' : '#FFF'} />
              )}
            </View>
            <Text style={[styles.usernameText, { color: colors.primary }]}>{perfilInfo.username}</Text>
          </View>

          {/* 3. INFORMACIÓN DEL TURISTA */}
          <View style={styles.infoContainer}>
            <View style={styles.fieldWrapper}>
              <Text style={[styles.fieldLabel, { color: colors.primary }]}>{t('adminViewUserProfile.labels.name')}</Text>
              <Text style={[styles.fieldValue, { color: colors.primary }]}>{perfilInfo.nombre}</Text>
            </View>
            <View style={styles.fieldWrapper}>
              <Text style={[styles.fieldLabel, { color: colors.primary }]}>{t('adminViewUserProfile.labels.email')}</Text>
              <Text style={[styles.fieldValue, { color: colors.primary }]}>{perfilInfo.correo}</Text>
            </View>
          </View>
        </>
      )}
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 25, paddingTop: 50 },
  header: { marginBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 40 },
  avatarCircle: { 
    width: 130, 
    height: 130, 
    borderRadius: 65, 
    borderWidth: 5, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15,
    overflow: 'hidden' // <-- Clave para el recorte circular de la foto
  },
  avatarImage: { width: '100%', height: '100%' }, // <-- Estilo para la imagen
  usernameText: { fontSize: 24, fontWeight: 'bold' },
  infoContainer: { paddingHorizontal: 10 },
  fieldWrapper: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)', paddingBottom: 10, marginBottom: 20 },
  fieldLabel: { fontSize: 14, fontWeight: 'bold', width: 100 },
  fieldValue: { flex: 1, fontSize: 14 }
});