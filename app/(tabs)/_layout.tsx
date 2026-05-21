import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
// 👇 Importamos el detector de Área Segura 👇
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const { colors, theme } = useTheme();
  
  // 👇 Obtenemos las medidas exactas de tu celular físico 👇
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4E97D1',
        tabBarInactiveTintColor: '#999999',
        
        tabBarStyle: {
          backgroundColor: theme === 'light' ? '#FFFFFF' : '#121212',
          borderTopColor: theme === 'light' ? '#EAEAEA' : '#333333',
          
          // 👇 LA MAGIA: Sumamos la medida exacta de tus botones + 10 puntitos extra de colchón
          paddingBottom: insets.bottom + 10, 
          
          // La altura total se calcula sola en base al padding
          height: 60 + insets.bottom, 
          paddingTop: 10,
        },
        tabBarShowLabel: false, 
      }}
    >
      <Tabs.Screen 
        name="calendar" 
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="map" size={28} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="index" 
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="favorites" 
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="star" size={28} color={color} />,
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />,
        }} 
      />
    </Tabs>
  );
}