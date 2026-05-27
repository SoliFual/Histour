import { Ionicons } from '@expo/vector-icons'; // 👇 IMPORTAMOS LOS ICONOS 👇
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// 1. IMPORTACIONES DE FIREBASE
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getCountFromServer, getDocs, query, setDoc, where } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 👇 ESTADOS PARA LOS OJITOS DE LAS CONTRASEÑAS 👇
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState('');
  const [cargando, setCargando] = useState(false); 

  const { t } = useTranslation();

  const handleRegister = async () => {
    setErrorMessage('');

    if (!name || !username || !email || !password || !confirmPassword) {
      setErrorMessage(t('register.errors.emptyFields'));
      return; 
    }

    const palabrasDelNombre = name.trim().split(/\s+/);
    if (palabrasDelNombre.length < 2) {
      setErrorMessage(t('register.errors.missingLastName'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage(t('register.errors.invalidEmail'));
      return;
    }

    if (password.length < 8) {
      setErrorMessage(t('register.errors.shortPassword'));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(t('register.errors.passwordMismatch'));
      return;
    }

    setCargando(true); 

    try {
      // --- VALIDACIÓN: COMPROBAR SI EL USERNAME YA EXISTE ---
      const usersCollectionRef = collection(db, "users");
      const q = query(usersCollectionRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setErrorMessage(t('register.errors.usernameInUse'));
        setCargando(false);
        return; 
      }
      // -----------------------------------------------------------

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const countSnapshot = await getCountFromServer(usersCollectionRef);
      const totalUsers = countSnapshot.data().count; 
      
      const formattedId = `#${String(totalUsers + 1).padStart(3, '0')}`;

      await setDoc(doc(db, "users", user.uid), {
        userId: formattedId,       
        fullName: name,
        username: username,
        email: email,
        rol: "user", 
        profilePicture: "",        
        createdAt: new Date()
      });

      console.log(`¡Usuario registrado con éxito con el ID ${formattedId}!`);
      router.replace('/(tabs)');

    } catch (error) {
      console.error("Error al registrar:", error);
      
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage(t('register.errors.emailInUse'));
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage(t('register.errors.invalidEmail'));
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage(t('register.errors.shortPassword'));
      } else {
        setErrorMessage("Error Firebase: " + error.message);
      }
    } finally {
      setCargando(false); 
    }
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
            editable={!cargando}
          />

          <Text style={styles.label}>{t('register.labels.username')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('register.placeholders.username')}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!cargando}
          />

          <Text style={styles.label}>{t('register.labels.email')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('register.placeholders.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!cargando}
          />

          <Text style={styles.label}>{t('register.labels.password')}</Text>
          {/* 👇 CONTENEDOR DE CONTRASEÑA 1 👇 */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!cargando}
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#A0A0A0" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{t('register.labels.confirmPassword')}</Text>
          {/* 👇 CONTENEDOR DE CONTRASEÑA 2 👇 */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              editable={!cargando}
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={22} color="#A0A0A0" />
            </TouchableOpacity>
          </View>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity 
            style={[styles.registerButton, cargando && { opacity: 0.7 }]} 
            onPress={handleRegister}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.registerButtonText}>{t('register.button')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLinkContainer} onPress={handleGoToLogin} disabled={cargando}>
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
  scrollContainer: { flexGrow: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 40 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  logo: { width: 40, height: 40, marginRight: 10 },
  appName: { fontSize: 26, color: '#4E97D1', fontWeight: 'bold', letterSpacing: 2 },
  formContainer: { width: '100%', maxWidth: 360 },
  screenTitle: { fontSize: 24, fontWeight: 'bold', color: '#333333', marginBottom: 20, textAlign: 'left' },
  label: { fontSize: 14, color: '#47525E', marginBottom: 6, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12, backgroundColor: '#FAFAFA' },
  
  // 👇 ESTILOS DE LOS OJITOS 👇
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, backgroundColor: '#FAFAFA', marginBottom: 12 },
  passwordInput: { flex: 1, padding: 12, fontSize: 16 },
  eyeIcon: { padding: 12 },
  
  errorContainer: { backgroundColor: '#FDECEA', padding: 10, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#E74C3C' },
  errorText: { color: '#E74C3C', fontSize: 13, fontWeight: '500' },
  registerButton: { backgroundColor: '#4E97D1', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 5, marginBottom: 15 },
  registerButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  loginLinkContainer: { marginTop: 5, alignItems: 'center', marginBottom: 20 },
  loginLinkText: { color: '#47525E', fontSize: 14 },
  loginLinkTextBold: { color: '#4E97D1', fontWeight: 'bold' }
});