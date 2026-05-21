import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // 👇 Lógica de simulación de roles (Etapa 1) 👇
  const handleLogin = () => {
    // Convertimos el correo a minúsculas y quitamos espacios por si acaso
    const correoIngresado = email.trim().toLowerCase();

    if (correoIngresado === 'sofia.fuentes4280@alumnos.udg.mx' && password === '12345678') {
      // Es administradora
      router.replace('/admin-dashboard');
    } else {
      // Es usuario normal
      router.replace('/(tabs)');
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      setIsGoogleLoading(false); 
      router.replace('/(tabs)'); 
    }, 2000);
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
        
        <Text style={styles.screenTitle}>Iniciar sesión</Text>
        
        <Text style={styles.label}>Ingresa tu correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="correo@gmail.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Ingresa tu contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />
        
        <TouchableOpacity onPress={() => router.push('/recover')}>
          <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>o</Text>

        <TouchableOpacity 
          style={styles.googleButton} 
          onPress={handleGoogleLogin}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <ActivityIndicator size="small" color="#47525E" />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#47525E" style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>Continuar con Google</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerContainer} onPress={() => router.push('/register')}>
          <Text style={styles.registerText}>
            ¿No tienes cuenta? <Text style={styles.registerTextBold}>Regístrate</Text>
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
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 25,
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
    marginBottom: 15,
    backgroundColor: '#FAFAFA',
  },
  forgotPassword: {
    color: '#4E97D1',
    fontSize: 13,
    textAlign: 'right',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#4E97D1',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    color: '#A0A0A0',
    marginVertical: 12,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 25,
    height: 48,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: '#47525E',
    fontSize: 15,
    fontWeight: '600',
  },
  registerContainer: {
    marginTop: 10,
  },
  registerText: {
    textAlign: 'center',
    color: '#47525E',
    fontSize: 14,
  },
  registerTextBold: {
    color: '#4E97D1',
    fontWeight: 'bold',
  }
});