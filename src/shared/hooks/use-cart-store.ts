import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/core/config/productsData";
import { cartService } from "@/features/cart/services/cartService";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { AuthStatus } from "@/features/auth/types";

export interface CartItem {
	product: Product;
	quantity: number;
}

interface CartStore {
	items: CartItem[];
	addItem: (product: Product, quantity?: number) => void;
	removeItem: (productId: string) => void;
	updateQuantity: (productId: string, quantity: number) => void;
	clearCart: () => void;
	syncWithBackend: () => Promise<void>;
	totalItems: () => number;
	subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
	persist(
		(set, get) => ({
			items: [],
			addItem: async (product, quantity = 1) => {
				const currentItems = get().items;
				const existingItemIndex = currentItems.findIndex((item) => item.product.id === product.id);

				if (existingItemIndex > -1) {
					const updatedItems = [...currentItems];
					updatedItems[existingItemIndex].quantity += quantity;
					set({ items: updatedItems });
				} else {
					set({ items: [...currentItems, { product, quantity }] });
				}

				// Sync with backend if authenticated
				const auth = useAuthStore.getState();
				if (auth.status === AuthStatus.Authenticated) {
					await cartService.addToCart(product.id, quantity);
				}
			},
			removeItem: async (productId) => {
				set({ items: get().items.filter((item) => item.product.id !== productId) });

				// Sync with backend if authenticated
				const auth = useAuthStore.getState();
				if (auth.status === AuthStatus.Authenticated) {
					await cartService.removeFromCart(productId);
				}
			},
			updateQuantity: async (productId, quantity) => {
				const currentItems = get().items;
				const updatedItems = currentItems
					.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
					.filter((item) => item.quantity > 0);
				set({ items: updatedItems });

				// Sync with backend if authenticated: call updateCartItemQuantity
				const auth = useAuthStore.getState();
				if (auth.status === AuthStatus.Authenticated) {
					if (quantity > 0) {
						await cartService.updateCartItemQuantity(productId, quantity);
					} else {
						await cartService.removeFromCart(productId);
					}
				}
			},
			clearCart: async () => {
				set({ items: [] });

				// Sync with backend if authenticated
				const auth = useAuthStore.getState();
				if (auth.status === AuthStatus.Authenticated) {
					await cartService.clearCart();
				}
			},
			syncWithBackend: async () => {
				const auth = useAuthStore.getState();
				if (auth.status === AuthStatus.Authenticated) {
					const backendItems = await cartService.getCart();
					if (backendItems) {
						set({ items: backendItems });
					}
				}
			},
			totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
			subtotal: () =>
				get().items.reduce((sum, item) => {
					if (!item || !item.product || typeof item.product.price !== "string") {
						return sum;
					}
					const priceNum = parseFloat(item.product.price.replace(/[^0-9.]/g, ""));
					return isNaN(priceNum) ? sum : sum + priceNum * item.quantity;
				}, 0),
		}),
		{
			name: "zamazor-cart-storage",
		}
	)
);

// Subscribe to authentication status changes to clear the cart on logout
useAuthStore.subscribe((state) => {
	if (state.status === AuthStatus.Unauthenticated) {
		useCartStore.setState({ items: [] });
	}
});
