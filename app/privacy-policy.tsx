import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext'; // prettier-ignore

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      
      {/* Botón de regreso */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.primary }]}>Política de Privacidad</Text>

      {/* 1. Información General */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>1. Información General</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          La presente Política de Privacidad establece los términos en que el equipo de desarrollo de Histour usa y protege la información proporcionada por sus usuarios. Esta aplicación ha sido desarrollada como un proyecto de carácter académico y tecnológico. Estamos fuertemente comprometidos con la seguridad de los datos de nuestra comunidad de usuarios.
        </Text>
      </View>

      {/* 2. Información Recogida */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>2. Información que es recogida</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          Nuestra aplicación podrá recoger información personal básica indispensable para su funcionamiento, la cual incluye:
        </Text>
        <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Nombre y apellido.</Text>
        <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Nombre de usuario.</Text>
        <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Dirección de correo electrónico.</Text>
        <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Preferencias dentro de la app (como el idioma seleccionado, el tema claro/oscuro y los lugares históricos marcados como "Favoritos").</Text>
      </View>

      {/* 3. Uso de la Información */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>3. Uso de la información recogida</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          Histour emplea la información exclusivamente con el fin de proporcionar la mejor experiencia de usuario posible, particularmente para mantener un registro activo y personalizar la navegación por la riqueza cultural y las rutas históricas de Jalisco. Los datos ingresados en este prototipo no son compartidos con terceros, vendidos, ni utilizados para fines de lucro o marketing externo.
        </Text>
      </View>

      {/* 4. Control de Información */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>4. Control de su información personal</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          En cualquier momento usted puede gestionar el uso de su información personal. Como usuario, tiene el derecho y la libertad de actualizar sus datos, modificar sus credenciales de acceso o solicitar la eliminación definitiva de su cuenta directamente desde el menú de Configuración en su Perfil.
        </Text>
      </View>

      {/* 5. Contacto */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>5. Contacto y Responsables</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          Para cualquier duda, sugerencia o aclaración sobre esta política de privacidad y el tratamiento de datos, puede contactar al equipo desarrollador a través de los siguientes correos electrónicos:
        </Text>
        <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• natalia.diaz4304@alumnos.udg.mx</Text>
        <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• sofia.fuentes4280@alumnos.udg.mx</Text>
        <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• stephanie.salgado4193@alumnos.udg.mx</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, paddingTop: 50 },
  backButton: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 25 },
  section: { marginBottom: 25 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  text: { fontSize: 15, lineHeight: 22, textAlign: 'justify' },
  bulletPoint: { fontSize: 15, lineHeight: 22, paddingLeft: 10, marginTop: 5 }
});