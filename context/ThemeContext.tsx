import React, { createContext, useContext, useState } from 'react';

// 1. Definimos los colores oficiales para cada modo
// Dentro de ThemeContext.tsx, actualiza el objeto Colors:
export const Colors = {
  light: {
    background: '#F5F6F8',
    card: '#FFFFFF',
    text: '#333333',
    textSecondary: '#2260A3',
    primary: '#4E97D1',
    border: '#E0E0E0',
  },
  dark: {
    background: '#0B121E', // Azul muy oscuro (Midnight Blue)
    card: '#162133',       // Azul marino profundo para tarjetas
    text: '#FFFFFF',
    textSecondary: '#82B5E0', 
    primary: '#4E97D1',
    border: '#253347',
  }
};

const ThemeContext = createContext({
  theme: 'light',
  colors: Colors.light,
  setTheme: (theme: string) => {},
});

export const ThemeProvider = ({ children }: any) => {
  const [theme, setThemeState] = useState('light');

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
  };

  const colors = theme === 'light' ? Colors.light : Colors.dark;

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);