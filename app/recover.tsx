import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// 1. Importamos el traductor
import { useTranslation } from 'react-i18next';

export default function RecoverScreen() {
  const [email, setEmail] = useState('');
  
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); 

  // 2. Activamos el traductor
  const { t } = useTranslation();

  const handleRecover = () => {
    // 1. Limpiamos mensajes anteriores
    setMessage('');
    setMessageType('');

    // 2. Validar que no esté vacío
    if (!email) {
      setMessage(t('recover.errors.emptyEmail'));
      setMessageType('error');
      return;
    }

    // 3. Validar formato del correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage(t('recover.errors.invalidEmail'));
      setMessageType('error');
      return;
    }

    // Si todo está bien, simulamos que enviamos el correo
    console.log("Enviando correo de recuperación a:", email);
    setMessage(t('recover.successMessage'));
    setMessageType('success');
    
    // Opcional: Después de 3.5 segundos, lo regresamos al login automáticamente
    setTimeout(() => {
      router.replace('/login');
    }, 3500);
  };

  const handleGoToLogin = () => {
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/images/logo.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={styles.appName}>HISTOUR</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.screenTitle}>{t('recover.title')}</Text>
        <Text style={styles.instructions}>
          {t('recover.instructions')}
        </Text>
        
        <Text style={styles.label}>{t('recover.labels.email')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('recover.placeholders.email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* MENSAJE DINÁMICO */}
        {message ? (
          <View style={messageType === 'error' ? styles.errorContainer : styles.successContainer}>
            <Text style={messageType === 'error' ? styles.errorText : styles.successText}>
              {message}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.recoverButton} onPress={handleRecover}>
          <Text style={styles.recoverButtonText}>{t('recover.button')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLinkContainer} onPress={handleGoToLogin}>
          <Text style={styles.loginLinkText}>
            {t('recover.loginPrompt')} <Text style={styles.loginLinkTextBold}>{t('recover.loginLink')}</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 45,
    height: 45,
    marginRight: 10,
  },
  appName: {
    fontSize: 28,
    color: '#4E97D1',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  formContainer: {
    width: '100%',
    maxWidth: 360,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'left',
  },
  instructions: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 25,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    color: '#47525E',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#FAFAFA',
  },
  errorContainer: {
    backgroundColor: '#FDECEA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 13,
    fontWeight: '500',
  },
  successContainer: {
    backgroundColor: '#E8F6F3',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#1ABC9C',
  },
  successText: {
    color: '#1ABC9C',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  recoverButton: {
    backgroundColor: '#4E97D1',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  recoverButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLinkContainer: {
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#47525E',
    fontSize: 14,
  },
  loginLinkTextBold: {
    color: '#4E97D1',
    fontWeight: 'bold',
  }
});