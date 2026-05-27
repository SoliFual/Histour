import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// 1. IMPORTACIONES DE FIREBASE
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function RecoverScreen() {
  const [email, setEmail] = useState('');
  
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); 
  const [cargando, setCargando] = useState(false); // 👈 Nuevo estado de carga

  const { t } = useTranslation();

  const handleRecover = async () => {
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

    // 4. Lógica real con Firebase
    setCargando(true);
    try {
      // Firebase se encarga de enviar el correo automáticamente
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      
      setMessage(t('recover.successMessage'));
      setMessageType('success');
      
      // Después de 3.5 segundos, lo regresamos al login automáticamente
      setTimeout(() => {
        router.replace('/login');
      }, 3500);

    } catch (error) {
      console.error("Error al enviar correo de recuperación:", error);
      setMessageType('error');
      
      // Manejo de errores de Firebase
      if (error.code === 'auth/user-not-found') {
        setMessage("No hay ninguna cuenta registrada con este correo.");
      } else if (error.code === 'auth/invalid-email') {
        setMessage(t('recover.errors.invalidEmail'));
      } else {
        setMessage("Hubo un error al intentar enviar el correo. Inténtalo de nuevo más tarde.");
      }
    } finally {
      setCargando(false);
    }
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
          editable={!cargando} // 👈 Bloqueamos el input si está cargando
        />

        {/* MENSAJE DINÁMICO */}
        {message ? (
          <View style={messageType === 'error' ? styles.errorContainer : styles.successContainer}>
            <Text style={messageType === 'error' ? styles.errorText : styles.successText}>
              {message}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity 
          style={[styles.recoverButton, cargando && { opacity: 0.7 }]} 
          onPress={handleRecover}
          disabled={cargando} // 👈 Bloqueamos el botón para evitar doble envío
        >
          {cargando ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.recoverButtonText}>{t('recover.button')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLinkContainer} onPress={handleGoToLogin} disabled={cargando}>
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