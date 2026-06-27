import { privateApiRequest } from "@/shared/utils/axiosPrivate";
import { isSystemError } from "@/shared/types";
import { type Product } from "@/core/config/productsData";
import { productService } from "@/features/products/services/productService";

export interface BackendCartItem {
	id: string; // cart item ID
	product: {
		id: string;
		name: string;
		price: number;
		imageUrl: string | null;
	};
	quantity: number;
}

export interface BackendCart {
	id: string;
	items: BackendCartItem[];
}

export const cartService = {
	getCart: async (): Promise<{ product: Product; quantity: number }[] | null> => {
		try {
			const response = await privateApiRequest<BackendCart>({
				url: "/carts",
				method: "GET",
			});

			if (isSystemError(response)) {
				console.warn("Cart API returned system error, using client-side cart fallback.");
				return null;
			}

			if (response && response.items) {
				const mappedItems = await Promise.all(
					response.items.map(async (item) => {
						const product = await productService.getProductById(item.product.id);
						return {
							product: product || {
								id: item.product.id,
								name: item.product.name,
								category: "Supplement",
								price: `${item.product.price.toFixed(2)} MAD`,
								flavor: "Pure & clean",
								badge: "Stack",
								theme: "emerald",
								image: item.product.imageUrl || "",
							},
							quantity: item.quantity,
						};
					})
				);
				return mappedItems;
			}
			return null;
		} catch (error) {
			console.warn("Failed to fetch cart from API, falling back to local state:", error);
			return null;
		}
	},

	addToCart: async (productId: string, quantity: number): Promise<boolean> => {
		try {
			const response = await privateApiRequest<unknown>({
				url: "/carts/items",
				method: "POST",
				data: { productId, quantity },
			});

			if (isSystemError(response)) {
				console.warn("Failed to add to API cart, operating in local-only mode.");
				return false;
			}

			return true;
		} catch (error) {
			console.warn("Add to cart API call failed, falling back to local storage:", error);
			return false;
		}
	},

	removeFromCart: async (productId: string): Promise<boolean> => {
		try {
			// First get cart to resolve the itemId for this productId
			const cart = await privateApiRequest<BackendCart>({
				url: "/carts",
				method: "GET",
			});

			if (isSystemError(cart) || !cart || !cart.items) {
				return false;
			}

			const item = cart.items.find((i) => i.product && i.product.id === productId);
			if (!item) {
				console.warn(`Product ${productId} not found in backend cart during deletion.`);
				return false;
			}

			const response = await privateApiRequest<unknown>({
				url: `/carts/items/${item.id}`,
				method: "DELETE",
			});

			if (isSystemError(response)) {
				console.warn("Failed to remove item from API cart, operating in local-only mode.");
				return false;
			}

			return true;
		} catch (error) {
			console.warn("Remove from cart API call failed, falling back to local storage:", error);
			return false;
		}
	},

	updateCartItemQuantity: async (productId: string, quantity: number): Promise<boolean> => {
		try {
			const response = await privateApiRequest<unknown>({
				url: `/carts/items/${productId}`,
				method: "PUT",
				data: { quantity },
			});

			if (isSystemError(response)) {
				console.warn("Failed to update cart item quantity on API, operating in local-only mode.");
				return false;
			}

			return true;
		} catch (error) {
			console.warn("Update cart item quantity API call failed, falling back to local storage:", error);
			return false;
		}
	},

	clearCart: async (): Promise<boolean> => {
		try {
			const response = await privateApiRequest<unknown>({
				url: "/carts",
				method: "DELETE",
			});

			if (isSystemError(response)) {
				console.warn("Failed to clear cart on API, operating in local-only mode.");
				return false;
			}

			return true;
		} catch (error) {
			console.warn("Clear cart API call failed, falling back to local storage:", error);
			return false;
		}
	},
};
