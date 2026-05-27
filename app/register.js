import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// 1. IMPORTACIONES DE FIREBASE (Agregamos query, where y getDocs para buscar el username)
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getCountFromServer, getDocs, query, setDoc, where } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
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
      // --- NUEVA VALIDACIÓN: COMPROBAR SI EL USERNAME YA EXISTE ---
      const usersCollectionRef = collection(db, "users");
      // Creamos una consulta buscando si algún documento tiene exactamente este username
      const q = query(usersCollectionRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      // Si querySnapshot NO está vacío, significa que el username ya lo tiene alguien más
      if (!querySnapshot.empty) {
        setErrorMessage(t('register.errors.usernameInUse'));
        setCargando(false); // Apagamos la ruedita
        return; // Detenemos el registro por completo
      }
      // -----------------------------------------------------------

      // 1. Crear el usuario en Firebase Authentication
      // (Si el correo ya existe, Firebase lo detecta aquí y nos manda al catch)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Consultar cuántos usuarios existen para generar el ID consecutivo
      const countSnapshot = await getCountFromServer(usersCollectionRef);
      const totalUsers = countSnapshot.data().count; 
      
      const formattedId = `#${String(totalUsers + 1).padStart(3, '0')}`;

      // 2. Guardar los datos en Firestore
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
      
      // Aquí atrapamos el error si el correo ya está registrado en Auth
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
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            editable={!cargando}
          />

          <Text style={styles.label}>{t('register.labels.confirmPassword')}</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            editable={!cargando}
          />

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
  errorContainer: { backgroundColor: '#FDECEA', padding: 10, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#E74C3C' },
  errorText: { color: '#E74C3C', fontSize: 13, fontWeight: '500' },
  registerButton: { backgroundColor: '#4E97D1', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 5, marginBottom: 15 },
  registerButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  loginLinkContainer: { marginTop: 5, alignItems: 'center', marginBottom: 20 },
  loginLinkText: { color: '#47525E', fontSize: 14 },
  loginLinkTextBold: { color: '#4E97D1', fontWeight: 'bold' }
});