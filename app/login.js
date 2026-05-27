import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// IMPORTACIONES DE EXPO PARA GOOGLE
import * as AuthSession from 'expo-auth-session'; // <-- IMPORTANTE: Nueva importación para el proxy
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

// IMPORTACIONES DE FIREBASE
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // 👇 NUEVO ESTADO PARA EL OJITO DE LA CONTRASEÑA 👇
  const [showPassword, setShowPassword] = useState(false);

  const { t } = useTranslation();

  // 👇 CONFIGURACIÓN DE GOOGLE ACTUALIZADA CON EL PROXY 👇
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '998189882000-qqmbtcsts2qnmpgbm0qg9qon62ah9rm4.apps.googleusercontent.com',
    iosClientId: '998189882000-qqmbtcsts2qnmpgbm0qg9qon62ah9rm4.apps.googleusercontent.com',
    androidClientId: '998189882000-qqmbtcsts2qnmpgbm0qg9qon62ah9rm4.apps.googleusercontent.com',
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }), // <-- Esta línea soluciona el bloqueo
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      iniciarSesionConCredencialGoogle(credential);
    } else if (response?.type === 'error') {
      setErrorMessage("Error al conectar con Google.");
      setIsGoogleLoading(false);
    }
  }, [response]);

  const iniciarSesionConCredencialGoogle = async (credential) => {
    setIsGoogleLoading(true);
    setErrorMessage('');
    try {
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.rol === 'admin') {
          router.replace('/admin-dashboard');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        await setDoc(docRef, {
          username: user.displayName || 'Usuario de Google',
          email: user.email,
          profilePicture: user.photoURL || '',
          rol: 'user' 
        });
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error("Error iniciando sesión con Google en Firebase:", error);
      setErrorMessage(t('login.errors.generalError') + error.message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    setErrorMessage('');
    const correoIngresado = email.trim().toLowerCase();

    if (!correoIngresado || !password) {
      setErrorMessage(t('login.errors.emptyFields'));
      return;
    }

    setCargando(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, correoIngresado, password);
      const user = userCredential.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.rol === 'admin') {
          router.replace('/admin-dashboard');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        setErrorMessage(t('login.errors.profileNotFound'));
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      if (error.code === 'auth/invalid-email') {
        setErrorMessage(t('login.errors.invalidEmail'));
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        setErrorMessage(t('login.errors.wrongCredentials'));
      } else {
        setErrorMessage(t('login.errors.generalError') + error.message);
      }
    } finally {
      setCargando(false);
    }
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
        
        <Text style={styles.screenTitle}>{t('login.title')}</Text>
        
        <Text style={styles.label}>{t('login.labels.email')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('login.placeholders.email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!cargando && !isGoogleLoading}
        />

        <Text style={styles.label}>{t('login.labels.password')}</Text>
        
        {/* 👇 CONTENEDOR MODIFICADO PARA EL OJITO 👇 */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword} // Aquí se usa el estado para ocultar/mostrar
            editable={!cargando && !isGoogleLoading}
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#A0A0A0" />
          </TouchableOpacity>
        </View>
        {/* 👆 FIN DEL CONTENEDOR DE CONTRASEÑA 👆 */}
        
        <TouchableOpacity onPress={() => router.push('/recover')} disabled={cargando || isGoogleLoading}>
          <Text style={styles.forgotPassword}>{t('login.forgotPassword')}</Text>
        </TouchableOpacity>

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <TouchableOpacity 
          style={[styles.loginButton, cargando && { opacity: 0.7 }]} 
          onPress={handleLogin}
          disabled={cargando || isGoogleLoading}
        >
          {cargando ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginButtonText}>{t('login.loginButton')}</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.orText}>{t('login.orText')}</Text>

        <TouchableOpacity 
          style={styles.googleButton} 
          onPress={() => {
            setIsGoogleLoading(true);
            promptAsync(); 
          }}
          disabled={!request || isGoogleLoading || cargando}
        >
          {isGoogleLoading ? (
            <ActivityIndicator size="small" color="#47525E" />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#47525E" style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>{t('login.googleButton')}</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerContainer} onPress={() => router.push('/register')} disabled={cargando || isGoogleLoading}>
          <Text style={styles.registerText}>
            {t('login.registerPrompt')} <Text style={styles.registerTextBold}>{t('login.registerLink')}</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  logo: { width: 45, height: 45, marginRight: 10 },
  appName: { fontSize: 28, color: '#4E97D1', fontWeight: 'bold', letterSpacing: 2 },
  formContainer: { width: '100%', maxWidth: 360 },
  screenTitle: { fontSize: 26, fontWeight: 'bold', color: '#333333', marginBottom: 25, textAlign: 'left' },
  label: { fontSize: 14, color: '#47525E', marginBottom: 6, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 15, backgroundColor: '#FAFAFA' },
  
  // 👇 NUEVOS ESTILOS PARA LA CONTRASEÑA 👇
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, backgroundColor: '#FAFAFA', marginBottom: 15 },
  passwordInput: { flex: 1, padding: 12, fontSize: 16 },
  eyeIcon: { padding: 12 },
  // 👆 FIN NUEVOS ESTILOS 👆

  forgotPassword: { color: '#4E97D1', fontSize: 13, textAlign: 'right', marginBottom: 20 },
  errorContainer: { backgroundColor: '#FDECEA', padding: 10, borderRadius: 8, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#E74C3C' },
  errorText: { color: '#E74C3C', fontSize: 13, fontWeight: '500' },
  loginButton: { backgroundColor: '#4E97D1', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  loginButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  orText: { textAlign: 'center', color: '#A0A0A0', marginVertical: 12, fontSize: 14 },
  googleButton: { flexDirection: 'row', borderWidth: 1, borderColor: '#CCCCCC', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', marginBottom: 25, height: 48 },
  googleIcon: { marginRight: 10 },
  googleButtonText: { color: '#47525E', fontSize: 15, fontWeight: '600' },
  registerContainer: { marginTop: 10 },
  registerText: { textAlign: 'center', color: '#47525E', fontSize: 14 },
  registerTextBold: { color: '#4E97D1', fontWeight: 'bold' }
});