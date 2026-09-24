import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getProductUnitPrice } from '../utils/productImages';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      total: 0,

      addItem: (product, quantity = 1) => {
        const { items } = get();
        const requestedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
        const existingItem = items.find(item => item.id === product.id);
        const nextQuantity = Math.min(
          Number(product.stock ?? Number.MAX_SAFE_INTEGER),
          (existingItem?.quantity || 0) + requestedQuantity,
        );

        if (nextQuantity <= 0) return;
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: nextQuantity }
                : item
            )
          });
        } else {
          set({
            items: [...items, { ...product, quantity: nextQuantity }]
          });
        }
        
        get().calculateTotal();
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter(item => item.id !== productId)
        });
        get().calculateTotal();
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set({
          items: get().items.map(item => item.id === productId
            ? { ...item, quantity: Math.min(quantity, Number(item.stock ?? quantity)) }
            : item)
        });
        get().calculateTotal();
      },

      clearCart: () => set({ items: [], total: 0 }),

      calculateTotal: () => {
        const total = get().items.reduce(
          (sum, item) => sum + (getProductUnitPrice(item) * item.quantity),
          0
        );
        set({ total });
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ 
        items: state.items, 
        total: state.total 
      }),
    }
  )
); 