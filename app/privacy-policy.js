import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
// 1. Importamos el traductor
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();
  
  // 2. Activamos el traductor
  const { t } = useTranslation();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      
      {/* Botón de regreso */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.primary }]}>{t('privacyPolicy.title')}</Text>

      {/* 1. Información General */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>{t('privacyPolicy.sections.general.title')}</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          {t('privacyPolicy.sections.general.content')}
        </Text>
      </View>

      {/* 2. Información Recogida */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>{t('privacyPolicy.sections.collected.title')}</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          {t('privacyPolicy.sections.collected.content')}
        </Text>
        <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>{t('privacyPolicy.sections.collected.bullets.name')}</Text>
        <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>{t('privacyPolicy.sections.collected.bullets.username')}</Text>
        <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>{t('privacyPolicy.sections.collected.bullets.email')}</Text>
        <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>{t('privacyPolicy.sections.collected.bullets.preferences')}</Text>
      </View>

      {/* 3. Uso de la Información */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>{t('privacyPolicy.sections.usage.title')}</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          {t('privacyPolicy.sections.usage.content')}
        </Text>
      </View>

      {/* 4. Control de Información */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>{t('privacyPolicy.sections.control.title')}</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          {t('privacyPolicy.sections.control.content')}
        </Text>
      </View>

      {/* 5. Contacto */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: colors.primary }]}>{t('privacyPolicy.sections.contact.title')}</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          {t('privacyPolicy.sections.contact.content')}
        </Text>
        {/* Los correos se quedan fijos, no se traducen */}
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