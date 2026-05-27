import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Image, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// 1. IMPORTAMOS EXPO IMAGE PICKER
import * as ImagePicker from 'expo-image-picker';

// 2. IMPORTACIONES DE FIREBASE
import { signOut, updateEmail, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from '../firebaseConfig';

export default function EditProfileScreen() {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();

  const [cargando, setCargando] = useState(true); 
  const [guardando, setGuardando] = useState(false); 
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [datosOriginales, setDatosOriginales] = useState(null);

  const [username, setUsername] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState(''); 
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [profilePicture, setProfilePicture] = useState(null); 

  const [errorNombre, setErrorNombre] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [errorConfirmPassword, setErrorConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.innerHTML = `
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear,
        input[type="password"]::-webkit-credentials-auto-fill-button { display: none !important; }
      `;
      document.head.appendChild(style);
      return () => { document.head.removeChild(style); };
    }
  }, []);

  // CARGAMOS LOS DATOS
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setDatosOriginales(data);
            setUsername(data.username || '');
            setNombre(data.fullName || '');
            setCorreo(data.email || user.email || '');
            setProfilePicture(data.profilePicture || null); 
          }
        } catch (error) {
          console.error("Error al cargar perfil:", error);
        }
      }
      setCargando(false);
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // 👇 LÓGICA DE LA GALERÍA CON PERMISOS AVANZADOS 👇
  const handleCambiarFoto = async () => {
    // 1. Pedir permisos de la galería
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      // Verificamos si el sistema ya nos bloqueó la opción de preguntar
      if (!permissionResult.canAskAgain) {
        if (Platform.OS === 'web') {
          alert("Debes habilitar los permisos desde la configuración de tu navegador.");
        } else {
          Alert.alert(
            "Permiso necesario",
            "Has denegado el acceso a la galería permanentemente. Por favor, ve a los ajustes de tu teléfono para habilitarlo manualmente.",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Abrir Ajustes", onPress: () => Linking.openSettings() }
            ]
          );
        }
      } else {
        // El rechazo normal, la primera o segunda vez
        const msgPermiso = "Se requiere permiso para acceder a la galería y cambiar tu foto.";
        if (Platform.OS === 'web') alert(msgPermiso); else Alert.alert("Permiso Denegado", msgPermiso);
      }
      return;
    }

    // 2. Abrir la galería
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], 
      quality: 0.5,   
    });

    // 3. Subir la imagen
    if (!result.canceled) {
      setSubiendoFoto(true); 
      
      try {
        const user = auth.currentUser;
        const imageUri = result.assets[0].uri;

        const response = await fetch(imageUri);
        const blob = await response.blob();

        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        await updateDoc(doc(db, "users", user.uid), {
          profilePicture: downloadURL
        });

        setProfilePicture(downloadURL);
        
        const msgExito = "Tu foto de perfil se actualizó correctamente.";
        if (Platform.OS === 'web') alert(msgExito); else Alert.alert("¡Listo!", msgExito);

      } catch (error) {
        console.error("Error al subir foto:", error);
        const msgError = "Ocurrió un error al subir la imagen. Inténtalo de nuevo.";
        if (Platform.OS === 'web') alert(msgError); else Alert.alert("Error", msgError);
      } finally {
        setSubiendoFoto(false); 
      }
    }
  };

  const handleGuardarCambios = async () => {
    setErrorNombre('');
    setErrorPassword('');
    setErrorConfirmPassword('');
    let todoCorrecto = true;

    const partesNombre = nombre.trim().split(/\s+/);
    if (partesNombre.length < 2) {
      setErrorNombre(t('editProfile.errors.nameMissing'));
      todoCorrecto = false;
    }

    if (password.length > 0) {
      if (password.length < 8) {
        setErrorPassword(t('editProfile.errors.passwordShort'));
        todoCorrecto = false;
      } else if (password !== confirmPassword) {
        setErrorConfirmPassword(t('editProfile.errors.passwordMismatch'));
        todoCorrecto = false;
      }
    }

    if (!todoCorrecto) return;

    const haCambiadoAlgo = 
      username !== datosOriginales?.username ||
      nombre !== datosOriginales?.fullName ||
      correo !== datosOriginales?.email ||
      password.length > 0;

    if (!haCambiadoAlgo) {
      if (Platform.OS === 'web') alert(t('editProfile.alerts.noChangesMessage'));
      else Alert.alert(t('editProfile.alerts.noChangesTitle'), t('editProfile.alerts.noChangesMessage'));
      return;
    }

    setGuardando(true);
    try {
      const user = auth.currentUser;

      if (password.length > 0) {
        await updatePassword(user, password);
      }

      if (correo !== user.email) {
        await updateEmail(user, correo);
      }

      await updateDoc(doc(db, "users", user.uid), {
        fullName: nombre,
        username: username,
        email: correo
      });

      setDatosOriginales({ ...datosOriginales, fullName: nombre, username: username, email: correo });
      setPassword('');
      setConfirmPassword('');

      if (Platform.OS === 'web') {
        alert(t('editProfile.alerts.saveSuccessWeb') || "Cambios guardados con éxito.");
        router.back();
      } else {
        Alert.alert(
          t('editProfile.alerts.saveSuccessTitle'), 
          t('editProfile.alerts.saveSuccessMessage'),
          [{ text: 'OK', onPress: () => router.back() }] 
        );
      }

    } catch (error) {
      console.error("Error al guardar cambios:", error);
      if (error.code === 'auth/requires-recent-login') {
        const msg = "Por seguridad, para cambiar tu contraseña o correo debes haber iniciado sesión recientemente. Cierra sesión y vuelve a entrar.";
        if (Platform.OS === 'web') alert(msg); else Alert.alert("Aviso de Seguridad", msg);
      } else if (error.code === 'auth/email-already-in-use') {
        const msgEmail = t('register.errors.emailInUse') || "Este correo ya está en uso.";
        if (Platform.OS === 'web') alert(msgEmail); else Alert.alert("Error", msgEmail);
      } else {
        const msgGen = "Ocurrió un error al guardar. Inténtalo de nuevo.";
        if (Platform.OS === 'web') alert(msgGen); else Alert.alert("Error", msgGen);
      }
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={guardando}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{t('editProfile.headerTitle')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} disabled={guardando}>
          <Text style={[styles.logoutText, { color: colors.primary }]}>{t('editProfile.logout')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.avatarSection}>
        <TouchableOpacity 
          style={[styles.avatarCircle, { borderColor: theme === 'light' ? '#333333' : '#FFFFFF' }]}
          onPress={handleCambiarFoto}
          disabled={subiendoFoto}
        >
          {subiendoFoto ? (
            <ActivityIndicator size="large" color={theme === 'light' ? '#333333' : '#FFFFFF'} />
          ) : profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="camera" size={65} color={theme === 'light' ? '#333333' : '#FFFFFF'} />
          )}
        </TouchableOpacity>
        
        <View style={styles.usernameRow}>
          <TextInput 
            style={[styles.usernameInput, { color: colors.primary }]} 
            value={username} 
            onChangeText={setUsername} 
            editable={!guardando}
          />
          <Ionicons name="pencil" size={20} color={colors.primary} />
        </View>
      </View>

      <View style={styles.formContainer}>
        
        <View style={styles.fieldWrapper}>
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.primary }]}>{t('editProfile.labels.name')}</Text>
            <TextInput 
              style={[styles.fieldInput, { color: colors.primary }]} 
              value={nombre} 
              onChangeText={setNombre} 
              placeholder={t('editProfile.placeholders.name')}
              placeholderTextColor="#999"
              editable={!guardando}
            />
            <Ionicons name="pencil" size={18} color={colors.primary} />
          </View>
          {errorNombre !== '' && <Text style={styles.errorText}>{errorNombre}</Text>}
        </View>

        <View style={styles.fieldWrapper}>
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.primary }]}>{t('editProfile.labels.email')}</Text>
            <TextInput 
              style={[styles.fieldInput, { color: colors.primary }]} 
              value={correo} 
              onChangeText={setCorreo} 
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!guardando}
            />
            <Ionicons name="pencil" size={18} color={colors.primary} />
          </View>
        </View>

        <View style={styles.fieldWrapper}>
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.primary }]}>{t('editProfile.labels.password')}</Text>
            <TextInput 
              style={[styles.fieldInput, { color: colors.primary }]} 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry={!showPassword} 
              autoCapitalize="none"
              placeholder="•••••••• (Opcional)"
              placeholderTextColor="#999"
              editable={!guardando}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} disabled={guardando}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.primary} />
            </TouchableOpacity>
            <Ionicons name="pencil" size={18} color={colors.primary} />
          </View>
          {errorPassword !== '' && <Text style={styles.errorText}>{errorPassword}</Text>}
        </View>

        {password.length > 0 && (
          <View style={styles.fieldWrapper}>
            <View style={styles.fieldRow}>
              <Text style={[styles.fieldLabel, { color: colors.primary }]}>{t('editProfile.labels.confirmPassword')}</Text>
              <TextInput 
                style={[styles.fieldInput, { color: colors.primary }]} 
                value={confirmPassword} 
                onChangeText={setConfirmPassword} 
                secureTextEntry={!showConfirmPassword} 
                placeholder={t('editProfile.placeholders.confirmPassword')}
                placeholderTextColor="#999"
                autoCapitalize="none"
                editable={!guardando}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon} disabled={guardando}>
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color={colors.primary} />
              </TouchableOpacity>
              <Ionicons name="pencil" size={18} color={colors.primary} />
            </View>
            {errorConfirmPassword !== '' && <Text style={styles.errorText}>{errorConfirmPassword}</Text>}
          </View>
        )}

        <TouchableOpacity 
          style={[styles.saveButton, guardando && { opacity: 0.7 }]} 
          onPress={handleGuardarCambios}
          disabled={guardando}
        >
          {guardando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>{t('editProfile.saveButton')}</Text>
          )}
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 25, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 50 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 5 },
  logoutText: { fontSize: 16, fontWeight: 'bold', textDecorationLine: 'underline' },
  avatarSection: { alignItems: 'center', marginBottom: 40 },
  avatarCircle: { 
    width: 150, 
    height: 150, 
    borderRadius: 75, 
    borderWidth: 6, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20,
    overflow: 'hidden' 
  },
  avatarImage: { width: '100%', height: '100%' },
  usernameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  usernameInput: { fontSize: 26, fontWeight: 'bold', marginRight: 10, textAlign: 'center', padding: 0 },
  formContainer: { paddingHorizontal: 10, paddingBottom: 40 },
  fieldWrapper: { marginBottom: 25 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(78, 151, 209, 0.3)', paddingBottom: 5 },
  fieldLabel: { fontSize: 15, fontWeight: 'bold', marginRight: 5 },
  fieldInput: { flex: 1, fontSize: 15, fontWeight: 'bold', padding: 0 },
  eyeIcon: { marginRight: 8 }, 
  errorText: { color: '#FF4C4C', fontSize: 12, fontWeight: 'bold', marginTop: 5 },
  saveButton: { backgroundColor: '#4E97D1', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});