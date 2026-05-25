import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// 1. IMPORTACIONES DE FIREBASE
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getCountFromServer, getDocs, query, setDoc, where } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function AdminAddAdminScreen() {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado para la ruedita de carga
  const [cargando, setCargando] = useState(false);

  const handleRegistrar = async () => {
    if (!email || !password || !fullName || !username) {
      if (Platform.OS === 'web') alert(t('adminAddAdmin.alerts.incompleteWeb'));
      else Alert.alert(t('adminAddAdmin.alerts.incompleteTitle'), t('adminAddAdmin.alerts.incompleteMessage'));
      return;
    }

    setCargando(true);

    try {
      // 1. VALIDACIÓN: COMPROBAR SI EL USERNAME YA EXISTE
      const usersCollectionRef = collection(db, "users");
      const q = query(usersCollectionRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Usamos la traducción que hicimos en el registro anterior
        const msgUsername = t('register.errors.usernameInUse') || "Este nombre de usuario ya está ocupado.";
        if (Platform.OS === 'web') alert(msgUsername);
        else Alert.alert("Error", msgUsername);
        
        setCargando(false);
        return; 
      }

      // 2. CREAR CUENTA EN FIREBASE AUTH
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 3. GENERAR ID AUTOMÁTICO (#001, #002...)
      const countSnapshot = await getCountFromServer(usersCollectionRef);
      const totalUsers = countSnapshot.data().count; 
      const formattedId = `#${String(totalUsers + 1).padStart(3, '0')}`;

      // 4. GUARDAR EN FIRESTORE (¡Ojo aquí! El rol es "admin")
      await setDoc(doc(db, "users", user.uid), {
        userId: formattedId,
        fullName: fullName,
        username: username,
        email: email,
        rol: "admin", // <--- Esto le dará acceso al panel de control
        profilePicture: "",
        createdAt: new Date()
      });

      // 5. MOSTRAR ÉXITO Y REDIRIGIR
      const mensajeExito = t('adminAddAdmin.alerts.successMessage', { username });

      if (Platform.OS === 'web') {
        alert(mensajeExito);
        router.replace('/admin-users'); 
      } else {
        Alert.alert(
          t('adminAddAdmin.alerts.successTitle'),
          mensajeExito,
          [{ text: t('adminAddAdmin.alerts.accept'), onPress: () => router.replace('/admin-users') }]
        );
      }

    } catch (error) {
      console.error("Error al registrar admin:", error);
      
      let errorMsg = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMsg = t('register.errors.emailInUse') || "Este correo ya está registrado.";
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = t('register.errors.invalidEmail') || "Correo inválido.";
      } else if (error.code === 'auth/weak-password') {
        errorMsg = t('register.errors.shortPassword') || "La contraseña debe tener al menos 8 caracteres.";
      }

      if (Platform.OS === 'web') alert(`Error: ${errorMsg}`);
      else Alert.alert("Error", errorMsg);

    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* ENCABEZADO AZUL */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/admin-users')} disabled={cargando}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('adminAddAdmin.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* LOGO HISTOUR */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logoImage}
            resizeMode="contain" 
          />
          <Text style={[styles.logoText, { color: colors.primary }]}>HISTOUR</Text>
        </View>

        {/* TARJETA DE FORMULARIO */}
        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          
          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddAdmin.labels.email')}</Text>
            <View style={[styles.inputContainer, { borderBottomColor: colors.primary }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={t('adminAddAdmin.placeholders.email')}
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!cargando}
              />
              <Ionicons name="mail-outline" size={20} color={colors.primary} />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddAdmin.labels.password')}</Text>
            <View style={[styles.inputContainer, { borderBottomColor: colors.primary }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={t('adminAddAdmin.placeholders.password')}
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!cargando}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={cargando}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddAdmin.labels.fullName')}</Text>
            <View style={[styles.inputContainer, { borderBottomColor: colors.primary }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={t('adminAddAdmin.placeholders.fullName')}
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
                editable={!cargando}
              />
              <Ionicons name="person-outline" size={20} color={colors.primary} />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('adminAddAdmin.labels.username')}</Text>
            <View style={[styles.inputContainer, { borderBottomColor: colors.primary }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={t('adminAddAdmin.placeholders.username')}
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!cargando}
              />
              <Ionicons name="at-outline" size={20} color={colors.primary} />
            </View>
          </View>

          {/* BOTÓN DINÁMICO DE REGISTRO */}
          <TouchableOpacity 
            style={[styles.registerButton, { backgroundColor: colors.primary }, cargando && { opacity: 0.7 }]} 
            onPress={handleRegistrar}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.registerButtonText}>{t('adminAddAdmin.button')}</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  backButton: { position: 'absolute', left: 20, bottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 40, alignItems: 'center' },
  logoContainer: { alignItems: 'center', marginVertical: 20 },
  logoImage: { width: 110, height: 110 },
  logoText: { fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  formCard: { width: '100%', padding: 25, borderRadius: 20, borderWidth: 1, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  inputWrapper: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, paddingBottom: 5 },
  input: { flex: 1, fontSize: 16, paddingVertical: 5 },
  registerButton: { marginTop: 30, paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  registerButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' }
});