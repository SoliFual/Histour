import React, { createContext, useContext, useState } from 'react';

// Creamos el contexto
const FavoritesContext = createContext<any>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  // Aquí guardaremos la lista de lugares favoritos
  const [favorites, setFavorites] = useState<any[]>([]);

  // Función para agregar o quitar un lugar de favoritos
  const toggleFavorite = (site: any) => {
    setFavorites((currentFavorites) => {
      // Verificamos si el lugar ya está en la lista
      const exists = currentFavorites.find(item => item.title === site.title);
      if (exists) {
        // Si ya está, lo quitamos (lo filtramos)
        return currentFavorites.filter(item => item.title !== site.title);
      } else {
        // Si no está, lo agregamos a la lista con un rating por defecto
        return [...currentFavorites, { ...site, rating: '5.0' }];
      }
    });
  };

  // Función para saber si un lugar es favorito (para pintar el corazón)
  const isFavorite = (title: string) => {
    return favorites.some(item => item.title === title);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Hook personalizado para usarlo fácilmente en cualquier pantalla
export const useFavorites = () => useContext(FavoritesContext);