import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// 1. Importamos el traductor
import { useTranslation } from 'react-i18next';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errorMessage, setErrorMessage] = useState('');

  // 2. Activamos el traductor
  const { t } = useTranslation();

  const handleRegister = () => {
    // 0. Limpiamos cualquier error previo
    setErrorMessage('');

    // 1. Validar que ningún campo esté vacío
    if (!name || !username || !email || !password || !confirmPassword) {
      setErrorMessage(t('register.errors.emptyFields'));
      return; 
    }

    // 2. NUEVA VALIDACIÓN: Obligar a poner al menos un nombre y un apellido
    const palabrasDelNombre = name.trim().split(/\s+/);
    if (palabrasDelNombre.length < 2) {
      setErrorMessage(t('register.errors.missingLastName'));
      return;
    }

    // 3. Validar que el correo sea válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage(t('register.errors.invalidEmail'));
      return;
    }

    // 4. Validar: Contraseña de mínimo 8 caracteres
    if (password.length < 8) {
      setErrorMessage(t('register.errors.shortPassword'));
      return;
    }

    // 5. Validar que las contraseñas sean idénticas
    if (password !== confirmPassword) {
      setErrorMessage(t('register.errors.passwordMismatch'));
      return;
    }

    // Si pasa todo, ¡registramos!
    console.log("Registrando usuario:", { name, username, email, password });
    router.replace('/(tabs)');
  };

  const handleGoToLogin = () => {
    router.replace('/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
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
          <Text style={styles.screenTitle}>{t('register.title')}</Text>
          
          <Text style={styles.label}>{t('register.labels.fullName')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('register.placeholders.fullName')}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>{t('register.labels.username')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('register.placeholders.username')}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Text style={styles.label}>{t('register.labels.email')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('register.placeholders.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>{t('register.labels.password')}</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />

          <Text style={styles.label}>{t('register.labels.confirmPassword')}</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
          />

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>{t('register.button')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLinkContainer} onPress={handleGoToLogin}>
            <Text style={styles.loginLinkText}>
              {t('register.loginPrompt')} <Text style={styles.loginLinkTextBold}>{t('register.loginLink')}</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  appName: {
    fontSize: 26,
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
    marginBottom: 20,
    textAlign: 'left',
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
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  errorContainer: {
    backgroundColor: '#FDECEA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 13,
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: '#4E97D1',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 15,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLinkContainer: {
    marginTop: 5,
    alignItems: 'center',
    marginBottom: 20,
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