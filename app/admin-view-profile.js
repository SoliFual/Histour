import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router'; // <-- Importación CLAVE
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// 1. IMPORTACIONES DE FIREBASE
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function AdminViewProfileScreen() {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();

  // 2. ATRAPAMOS EL ID DEL USUARIO SELECCIONADO
  const { uid } = useLocalSearchParams();

  // 3. ESTADOS PARA GUARDAR LA INFORMACIÓN Y CONTROLAR LA CARGA
  const [perfilInfo, setPerfilInfo] = useState(null);
  const [cargando, setCargando] = useState(true);

  // 4. EFECTO PARA BUSCAR AL USUARIO EN FIRESTORE
  useEffect(() => {
    const fetchUserData = async () => {
      // Si por alguna razón llegamos aquí sin un ID, nos salimos
      if (!uid) {
        console.error("No se recibió ningún UID.");
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
            rol: data.rol === 'admin' ? 'Administrador' : 'Usuario',
            id: data.userId || '#---',
            foto: data.profilePicture || null // Extraemos la foto también
          });
        } else {
          console.log("No se encontró el documento de este usuario.");
        }
      } catch (error) {
        console.error("Error al obtener el perfil:", error);
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('adminViewProfile.title')}</Text>
        </TouchableOpacity>
      </View>

      {/* PANTALLA DE CARGA MIENTRAS BUSCAMOS EN LA BASE DE DATOS */}
      {cargando ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 10 }}>Cargando perfil...</Text>
        </View>
      ) : !perfilInfo ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
          <Ionicons name="warning-outline" size={50} color="#E74C3C" />
          <Text style={{ color: colors.text, marginTop: 10, fontSize: 16 }}>No se pudo cargar la información del usuario.</Text>
        </View>
      ) : (
        <>
          {/* 2. SECCIÓN DEL AVATAR DINÁMICA */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatarCircle, { borderColor: theme === 'light' ? '#333333' : '#FFFFFF' }]}>
              {/* Si tiene foto la mostramos, sino, ponemos el ícono por defecto */}
              {perfilInfo.foto ? (
                <Image source={{ uri: perfilInfo.foto }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={80} color={theme === 'light' ? '#333333' : '#FFFFFF'} />
              )}
            </View>
            
            <Text style={[styles.usernameText, { color: colors.primary }]}>{perfilInfo.username}</Text>
          </View>

          {/* 3. INFORMACIÓN DEL USUARIO */}
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
        </>
      )}
      
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
    marginBottom: 20,
    overflow: 'hidden' // <-- IMPORTANTÍSIMO: Corta la foto para que no se salga del círculo
  },
  avatarImage: {
    width: '100%',
    height: '100%' // <-- Hace que la foto ocupe todo el círculo
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