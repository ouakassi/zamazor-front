import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/features/products/types";
import { cartService } from "@/features/cart/services/cartService";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { AuthStatus } from "@/features/auth/types";
import { parsePrice } from "@/shared/utils/price";

interface CartItem {
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
				const auth = useAuthStore.getState();
				if (auth.status === AuthStatus.Authenticated) {
					const saved = await cartService.addToCart(product.id, quantity);
					if (saved) {
						await get().syncWithBackend();
					}
					return;
				}

				const currentItems = get().items;
				const existingItemIndex = currentItems.findIndex((item) => item.product.id === product.id);

				if (existingItemIndex > -1) {
					const updatedItems = [...currentItems];
					updatedItems[existingItemIndex].quantity += quantity;
					set({ items: updatedItems });
				} else {
					set({ items: [...currentItems, { product, quantity }] });
				}
			},
			removeItem: async (productId) => {
				const auth = useAuthStore.getState();
				if (auth.status === AuthStatus.Authenticated) {
					const removed = await cartService.removeFromCart(productId);
					if (removed) {
						await get().syncWithBackend();
					}
					return;
				}

				set({ items: get().items.filter((item) => item.product.id !== productId) });
			},
			updateQuantity: async (productId, quantity) => {
				const auth = useAuthStore.getState();
				if (auth.status === AuthStatus.Authenticated) {
					const saved =
						quantity > 0
							? await cartService.updateCartItemQuantity(productId, quantity)
							: await cartService.removeFromCart(productId);
					if (saved) {
						await get().syncWithBackend();
					}
					return;
				}

				const currentItems = get().items;
				const updatedItems = currentItems
					.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
					.filter((item) => item.quantity > 0);
				set({ items: updatedItems });
			},
			clearCart: async () => {
				const auth = useAuthStore.getState();
				if (auth.status === AuthStatus.Authenticated) {
					const cleared = await cartService.clearCart();
					if (cleared) {
						set({ items: [] });
					}
					return;
				}

				set({ items: [] });
			},
			syncWithBackend: async () => {
				const auth = useAuthStore.getState();
				if (auth.status === AuthStatus.Authenticated) {
					const backendItems = await cartService.getCart();
					if (backendItems !== null) {
						set({ items: backendItems });
					}
				}
			},
			totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
			subtotal: () =>
				get().items.reduce((sum, item) => {
					if (!item || !item.product) {
						return sum;
					}
					return sum + parsePrice(item.product.price) * item.quantity;
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
