import React, { createContext, useContext, useEffect, useState } from 'react';
// IMPORTACIONES DE FIREBASE
import { onAuthStateChanged } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

// Creamos el contexto
const FavoritesContext = createContext<any>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  // Aquí guardaremos la lista de lugares favoritos de forma persistente
  const [favorites, setFavorites] = useState<any[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  // EFECTO: Escucha el estado de la sesión y descarga los favoritos automáticos desde Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const querySnapshot = await getDocs(collection(db, "users", user.uid, "favoritos"));
          const favoritosFirebase: any[] = [];
          
          querySnapshot.forEach((documento) => {
            favoritosFirebase.push(documento.data());
          });
          
          setFavorites(favoritosFirebase);
        } catch (error) {
          console.error("Error al cargar los favoritos desde Firebase:", error);
        }
      } else {
        // Si el usuario cierra sesión, limpiamos el estado local
        setFavorites([]);
      }
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  // Función para agregar o quitar un lugar de favoritos en la BD y de forma local
  const toggleFavorite = async (site: any) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Debes iniciar sesión para poder guardar tus lugares favoritos.");
      return;
    }

    // Usamos el id del sitio como llave primaria; si no existe, generamos una basada en el título
    const sitioId = site.id || site.title.replace(/\s+/g, '_').toLowerCase();

    // Verificamos si ya existe comparando identificadores o títulos
    const exists = favorites.some(item => (site.id ? item.id === site.id : item.title === site.title));
    const docRef = doc(db, "users", user.uid, "favoritos", sitioId);

    if (exists) {
      // CASO 1: Ya es favorito, procedemos a eliminarlo
      setFavorites((currentFavorites) => 
        currentFavorites.filter(item => (site.id ? item.id !== site.id : item.title !== site.title))
      );

      try {
        await deleteDoc(docRef);
      } catch (error) {
        console.error("Error al eliminar de Firestore:", error);
      }
    } else {
      // CASO 2: No es favorito, procedemos a crearlo
      const nuevoFavorito = {
        id: site.id || sitioId,
        title: site.title,
        image: site.image,
        rating: site.rating || '5.0'
      };

      setFavorites((currentFavorites) => [...currentFavorites, nuevoFavorito]);

      try {
        await setDoc(docRef, nuevoFavorito);
      } catch (error) {
        console.error("Error al guardar en Firestore:", error);
      }
    }
  };

  // Función para saber si un lugar es favorito (compara de forma segura por ID o por título)
  const isFavorite = (identificador: string) => {
    return favorites.some(item => item.id === identificador || item.title === identificador);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, cargando }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Hook personalizado para usarlo fácilmente en cualquier pantalla
export const useFavorites = () => useContext(FavoritesContext);