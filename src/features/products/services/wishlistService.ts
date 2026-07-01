import { API_ENDPOINTS } from "@/core/config/apiEndpoints";
import { tokenManager } from "@/features/auth/globals/tokenManager";
import { isSystemError } from "@/shared/types";
import { privateApiRequest } from "@/shared/utils/axiosPrivate";
import { productService, type BackendProduct } from "@/features/products/services/productService";
import type { Product } from "@/features/products/types";

type WishlistResponse = unknown;

const formatPrice = (value: unknown) => {
	const amount = typeof value === "number" ? value : Number(value);
	if (Number.isNaN(amount)) return "0.00 MAD";
	return `${amount.toFixed(2)} MAD`;
};

const resolveCategoryLabel = (category: unknown) => {
	if (category && typeof category === "object" && "label" in category && typeof category.label === "string") {
		return category.label;
	}

	if (typeof category === "string" && category.trim()) {
		return category;
	}

	return "Supplement";
};

const resolveImageUrl = (item: Partial<BackendProduct> & { image?: string | null }) => {
	const raw = item.imageUrl || item.image || "";
	if (!raw) return "";
	if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
	return raw.startsWith("/") ? raw : `/${raw}`;
};

const mapLikeProduct = (item: Partial<BackendProduct> & { image?: string | null; category?: unknown }): Product | null => {
	if (!item.id || !item.name) return null;

	return {
		id: item.id,
		name: item.name,
		createdAt: item.createdAt,
		category: resolveCategoryLabel(item.category),
		price: formatPrice(item.price),
		flavor: "Pure & clean",
		badge: "Formulated",
		theme: "emerald",
		image: resolveImageUrl(item),
		description: item.description || "",
		stock: typeof item.stockQuantity === "number" ? item.stockQuantity : undefined,
	};
};

const extractItems = (response: WishlistResponse): unknown[] => {
	if (Array.isArray(response)) return response;
	if (response && typeof response === "object" && "items" in response && Array.isArray((response as { items?: unknown[] }).items)) {
		return (response as { items: unknown[] }).items;
	}
	return [];
};

const unwrapWishlistProduct = (entry: unknown): Product | null => {
	if (!entry) return null;

	if (typeof entry === "string") {
		return null;
	}

	if (typeof entry === "object") {
		const maybeEntry = entry as Record<string, unknown>;
		if (maybeEntry.product && typeof maybeEntry.product === "object") {
			const mapped = mapLikeProduct(maybeEntry.product as Partial<BackendProduct> & { image?: string | null; category?: unknown });
			if (mapped) return mapped;
			if (typeof maybeEntry.product === "object" && "id" in maybeEntry.product && typeof maybeEntry.product.id === "string") {
				return null;
			}
		}

		const direct = mapLikeProduct(maybeEntry as Partial<BackendProduct> & { image?: string | null; category?: unknown });
		if (direct) return direct;
	}

	return null;
};

export const wishlistService = {
	getWishlists: async (): Promise<Product[]> => {
		if (!tokenManager.getAccessToken()) {
			return [];
		}

		const response = await privateApiRequest<WishlistResponse>(
			{
				url: API_ENDPOINTS.WISHLISTS.ROOT,
				method: "GET",
			},
			{ ignoreErrors: true },
		);

		if (isSystemError(response)) {
			console.error("Wishlist API returned system error:", response);
			return [];
		}

		const items = extractItems(response);
		const resolved: Product[] = [];

		for (const entry of items) {
			const mapped = unwrapWishlistProduct(entry);
			if (mapped) {
				resolved.push(mapped);
				continue;
			}

			if (typeof entry === "string") {
				const product = await productService.getProductById(entry);
				if (product) {
					resolved.push(product);
				}
				continue;
			}

			if (entry && typeof entry === "object") {
				const candidate = entry as Record<string, unknown>;
				const productId =
					(typeof candidate.productId === "string" && candidate.productId) ||
					(typeof candidate.product === "string" && candidate.product) ||
					(typeof candidate.id === "string" ? candidate.id : null);

				if (productId) {
					const product = await productService.getProductById(productId);
					if (product) {
						resolved.push(product);
					}
				}
			}
		}

		return resolved;
	},

	addWishlist: async (productId: string): Promise<boolean> => {
		if (!tokenManager.getAccessToken()) {
			return true;
		}

		const response = await privateApiRequest<unknown>(
			{
				url: API_ENDPOINTS.WISHLISTS.DETAILS(productId),
				method: "POST",
			},
			{ ignoreErrors: true },
		);

		if (isSystemError(response)) {
			console.error(`Failed to add wishlist item ${productId}:`, response);
			return false;
		}

		return true;
	},

	removeWishlist: async (productId: string): Promise<boolean> => {
		if (!tokenManager.getAccessToken()) {
			return true;
		}

		const response = await privateApiRequest<unknown>(
			{
				url: API_ENDPOINTS.WISHLISTS.DETAILS(productId),
				method: "DELETE",
			},
			{ ignoreErrors: true },
		);

		if (isSystemError(response)) {
			console.error(`Failed to remove wishlist item ${productId}:`, response);
			return false;
		}

		return true;
	},
};
