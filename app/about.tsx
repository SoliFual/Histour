import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext'; // prettier-ignore

export default function AboutScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Botón de regreso */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.primary }]}>Acerca de Histour</Text>

      {/* Descripción y Valor */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>¿Qué es Histour?</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          Histour es una aplicación diseñada para transformar la manera en que exploras lugares históricos. 
          Nuestra app resuelve el problema de la falta de información accesible y guiada, ofreciendo 
          una experiencia inmersiva para descubrir la riqueza cultural de Guadalajara de forma intuitiva.
        </Text>
      </View>

      {/* Versión */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>Versión</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>v1.0.0</Text>
      </View>

      {/* Créditos y Licencias */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>Créditos y Licencias</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          © 2026 Histour App. Todos los derechos reservados. 
          Este software utiliza librerías de código abierto bajo licencia MIT.
        </Text>
      </View>

      {/* Contacto */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>Contacto del equipo</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>• natalia.diaz4304@alumnos.udg.mx</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>• sofia.fuentes4280@alumnos.udg.mx</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>• stephanie.salgado4193@alumnos.udg.mx</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, paddingTop: 50 },
  backButton: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  section: { marginBottom: 25 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  text: { fontSize: 16, lineHeight: 22 }
});