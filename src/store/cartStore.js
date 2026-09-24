import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { productImage } from '../lib/format';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/**
 * Cart, persisted in localStorage so it survives refreshes. Prices here are for
 * display only — the server re-prices every order from the database.
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { productId, name, slug, price, image, stock, quantity, issue }

      /** Adds a product; returns the quantity actually added (limited by stock). */
      add(product, quantity = 1) {
        const existing = get().items.find((i) => i.productId === product.id);
        const current = existing?.quantity || 0;
        const next = clamp(current + quantity, 0, product.stock);
        const added = next - current;
        if (added <= 0) return 0;

        const line = {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: productImage(product),
          stock: product.stock,
          quantity: next,
          issue: null,
        };
        set({
          items: existing
            ? get().items.map((i) => (i.productId === product.id ? line : i))
            : [...get().items, line],
        });
        return added;
      },

      setQuantity(productId, quantity) {
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity: clamp(quantity, 1, Math.max(1, i.stock)) } : i,
          ),
        });
      },

      remove(productId) {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      clear() {
        set({ items: [] });
      },

      /** Applies live price/stock from POST /api/cart/validate. */
      sync(results) {
        const byId = new Map(results.map((r) => [r.productId, r]));
        set({
          items: get().items.map((item) => {
            const r = byId.get(item.productId);
            if (!r) return item;
            if (!r.product) return { ...item, stock: 0, issue: 'No longer available' };
            return {
              ...item,
              name: r.product.name,
              slug: r.product.slug,
              price: r.product.price,
              image: productImage(r.product),
              stock: r.product.stock,
              quantity: r.product.stock > 0 ? Math.min(item.quantity, r.product.stock) : item.quantity,
              issue: r.product.stock === 0 ? 'Out of stock' : item.quantity > r.product.stock ? `Only ${r.product.stock} left — quantity adjusted` : null,
            };
          }),
        });
      },
    }),
    {
      name: 'jolique-cart',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const selectCartCount = (s) => s.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartSubtotal = (s) =>
  s.items.filter((i) => i.stock > 0).reduce((sum, i) => sum + i.price * i.quantity, 0);
export const selectCartHasIssues = (s) => s.items.some((i) => i.stock === 0 || i.quantity > i.stock);
