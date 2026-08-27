'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/database';
import { useToast } from './ToastProvider';
import { usePi } from './PiProvider';

interface FavoritesContextType {
  favoriteIds: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: Product) => Promise<void>;
  favoriteProducts: Product[];
}

const FavoritesContext = createContext<FavoritesContextType>({
  favoriteIds: [],
  isFavorite: () => false,
  toggleFavorite: async () => {},
  favoriteProducts: [],
});

export const useFavorites = () => useContext(FavoritesContext);

const FAVORITES_STORAGE_KEY = 'pimarket_favorites_v1';

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { showToast } = useToast();
  const { user } = usePi();

  // Load from local storage
  useEffect(() => {
    try {
      const savedIds = localStorage.getItem(FAVORITES_STORAGE_KEY);
      const savedProducts = localStorage.getItem(`${FAVORITES_STORAGE_KEY}_prods`);
      if (savedIds) setFavoriteIds(JSON.parse(savedIds));
      if (savedProducts) setFavoriteProducts(JSON.parse(savedProducts));
    } catch (e) {
      console.warn('Failed to load favorites from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
        localStorage.setItem(`${FAVORITES_STORAGE_KEY}_prods`, JSON.stringify(favoriteProducts));
      } catch (e) {
        console.warn('Failed to save favorites to localStorage', e);
      }
    }
  }, [favoriteIds, favoriteProducts, isLoaded]);

  // Sync with Supabase if user is logged in
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/favorites?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.favorites?.length) {
            const dbIds = data.favorites.map((f: any) => f.product_id);
            const dbProds = data.favorites.map((f: any) => f.product).filter(Boolean);
            setFavoriteIds((prev) => Array.from(new Set([...prev, ...dbIds])));
            setFavoriteProducts((prev) => {
              const map = new Map<string, Product>();
              prev.forEach((p) => map.set(p.id, p));
              dbProds.forEach((p: Product) => map.set(p.id, p));
              return Array.from(map.values());
            });
          }
        })
        .catch((err) => console.warn('Could not sync favorites with server', err));
    }
  }, [user?.id]);

  const isFavorite = useCallback((productId: string) => {
    return favoriteIds.includes(productId);
  }, [favoriteIds]);

  const toggleFavorite = useCallback(async (product: Product) => {
    const currentlyFav = favoriteIds.includes(product.id);

    if (currentlyFav) {
      setFavoriteIds((prev) => prev.filter((id) => id !== product.id));
      setFavoriteProducts((prev) => prev.filter((p) => p.id !== product.id));
      showToast('Retiré des favoris', 'info');

      if (user?.id) {
        fetch(`/api/favorites?userId=${user.id}&productId=${product.id}`, {
          method: 'DELETE',
        }).catch((e) => console.warn(e));
      }
    } else {
      setFavoriteIds((prev) => [...prev, product.id]);
      setFavoriteProducts((prev) => [...prev, product]);
      showToast('Ajouté à vos favoris !', 'success');

      if (user?.id) {
        fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, productId: product.id }),
        }).catch((e) => console.warn(e));
      }
    }
  }, [favoriteIds, user?.id, showToast]);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        isFavorite,
        toggleFavorite,
        favoriteProducts,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
