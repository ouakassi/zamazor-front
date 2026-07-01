import { privateApiRequest } from "@/shared/utils/axiosPrivate";
import { isSystemError } from "@/shared/types";
import { type Product } from "@/features/products/types";
import { productService } from "@/features/products/services/productService";
import { API_ENDPOINTS } from "@/core/config/apiEndpoints";

interface BackendCartItem {
	id: string; // cart item ID
	product: {
		id: string;
		name: string;
		price: number;
		imageUrl: string | null;
	};
	quantity: number;
}

interface BackendCart {
	id: string;
	items: BackendCartItem[];
}

function isMissingCartError(error: unknown) {
	return (
		isSystemError(error) &&
		error.status === 404 &&
		error.title.toLowerCase().includes("cart")
	);
}

export const cartService = {
	getCart: async (): Promise<{ product: Product; quantity: number }[] | null> => {
		try {
			const response = await privateApiRequest<BackendCart>(
				{
					url: API_ENDPOINTS.CARTS.ROOT,
					method: "GET",
				},
				{ ignoreErrors: true },
			);

			if (isSystemError(response)) {
				if (isMissingCartError(response)) {
					return [];
				}
				console.warn("Cart API returned system error.");
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
			console.warn("Failed to fetch cart from API:", error);
			return null;
		}
	},

	addToCart: async (productId: string, quantity: number): Promise<boolean> => {
		try {
			const response = await privateApiRequest<unknown>(
				{
					url: API_ENDPOINTS.CARTS.ITEMS,
					method: "POST",
					data: { productId, quantity },
				},
				{ ignoreErrors: true },
			);

			if (isSystemError(response)) {
				console.warn("Failed to add item to API cart.");
				return false;
			}

			return true;
		} catch (error) {
			console.warn("Add to cart API call failed:", error);
			return false;
		}
	},

	removeFromCart: async (productId: string): Promise<boolean> => {
		try {
			// First get cart to resolve the itemId for this productId
			const cart = await privateApiRequest<BackendCart>(
				{
					url: API_ENDPOINTS.CARTS.ROOT,
					method: "GET",
				},
				{ ignoreErrors: true },
			);

			if (isSystemError(cart) || !cart || !cart.items) {
				return false;
			}

			const item = cart.items.find((i) => i.product && i.product.id === productId);
			if (!item) {
				console.warn(`Product ${productId} not found in backend cart during deletion.`);
				return false;
			}

			const response = await privateApiRequest<unknown>(
				{
					url: API_ENDPOINTS.CARTS.ITEM_DETAILS(item.id),
					method: "DELETE",
				},
				{ ignoreErrors: true },
			);

			if (isSystemError(response)) {
				console.warn("Failed to remove item from API cart.");
				return false;
			}

			return true;
		} catch (error) {
			console.warn("Remove from cart API call failed:", error);
			return false;
		}
	},

	updateCartItemQuantity: async (productId: string, quantity: number): Promise<boolean> => {
		try {
			const cart = await privateApiRequest<BackendCart>(
				{
					url: API_ENDPOINTS.CARTS.ROOT,
					method: "GET",
				},
				{ ignoreErrors: true },
			);

			if (isSystemError(cart) || !cart || !cart.items) {
				return false;
			}

			const item = cart.items.find((i) => i.product && i.product.id === productId);
			if (!item) {
				console.warn(`Product ${productId} not found in backend cart during quantity update.`);
				return false;
			}

			const response = await privateApiRequest<unknown>(
				{
					url: API_ENDPOINTS.CARTS.ITEM_DETAILS(item.id),
					method: "PATCH",
					data: { quantity },
				},
				{ ignoreErrors: true },
			);

			if (isSystemError(response)) {
				console.warn("Failed to update cart item quantity on API.");
				return false;
			}

			return true;
		} catch (error) {
			console.warn("Update cart item quantity API call failed:", error);
			return false;
		}
	},

	clearCart: async (): Promise<boolean> => {
		try {
			const response = await privateApiRequest<unknown>(
				{
					url: API_ENDPOINTS.CARTS.ROOT,
					method: "DELETE",
				},
				{ ignoreErrors: true },
			);

			if (isSystemError(response)) {
				console.warn("Failed to clear cart on API.");
				return false;
			}

			return true;
		} catch (error) {
			console.warn("Clear cart API call failed:", error);
			return false;
		}
	},
};
