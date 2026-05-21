import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RecoverScreen() {
  const [email, setEmail] = useState('');
  
  // Guardamos el mensaje y también el "tipo" (error o éxito) para saber de qué color pintarlo
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // Puede ser 'error' o 'success'

  const handleRecover = () => {
    // 1. Limpiamos mensajes anteriores
    setMessage('');
    setMessageType('');

    // 2. Validar que no esté vacío
    if (!email) {
      setMessage("Por favor ingresa tu correo electrónico.");
      setMessageType('error');
      return;
    }

    // 3. Validar formato del correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Ingresa un correo electrónico válido (ejemplo: usuario@correo.com).");
      setMessageType('error');
      return;
    }

    // Si todo está bien, simulamos que enviamos el correo
    console.log("Enviando correo de recuperación a:", email);
    setMessage("¡Listo! Si el correo está registrado, recibirás un enlace para cambiar tu contraseña.");
    setMessageType('success');
    
    // Opcional: Después de 3 segundos, lo regresamos al login automáticamente
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
        <Text style={styles.screenTitle}>Recuperar contraseña</Text>
        <Text style={styles.instructions}>
          Ingresa el correo electrónico asociado a tu cuenta y te enviaremos las instrucciones para restablecer tu contraseña.
        </Text>
        
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="correo@gmail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* MENSAJE DINÁMICO: Cambia a rojo o verde dependiendo de qué pase */}
        {message ? (
          <View style={messageType === 'error' ? styles.errorContainer : styles.successContainer}>
            <Text style={messageType === 'error' ? styles.errorText : styles.successText}>
              {message}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.recoverButton} onPress={handleRecover}>
          <Text style={styles.recoverButtonText}>Enviar enlace</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLinkContainer} onPress={handleGoToLogin}>
          <Text style={styles.loginLinkText}>
            ¿Recordaste tu contraseña? <Text style={styles.loginLinkTextBold}>Inicia sesión</Text>
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
  // ESTILOS PARA ERROR (ROJO)
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
  // ESTILOS PARA ÉXITO (VERDE)
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