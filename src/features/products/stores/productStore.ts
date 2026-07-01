import { create } from "zustand";
import { type Product } from "@/features/products/types";
import { productService } from "../services/productService";

interface ProductStore {
	products: Product[];
	loading: boolean;
	error: string | null;
	fetchProducts: (force?: boolean) => Promise<Product[]>;
	getProductById: (id: string) => Promise<Product | null>;
	removeProductById: (id: string) => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
	products: [],
	loading: false,
	error: null,

	fetchProducts: async (force = false) => {
		// Return cache if available and not forced
		const currentProducts = get().products;
		if (currentProducts.length > 0 && !force) {
			return currentProducts;
		}

		set({ loading: true, error: null });
		try {
			const products = await productService.getProducts();
			set({ products, loading: false });
			return products;
		} catch (err: unknown) {
			const errMsg = err instanceof Error ? err.message : "Failed to load products";
			set({ error: errMsg, loading: false });
			return [];
		}
	},

	getProductById: async (id: string) => {
		// First search cache
		const cached = get().products.find((p) => p.id === id);
		if (cached) return cached;

		// Fetch from service if not in cache
		try {
			const fetched = await productService.getProductById(id);
			if (fetched) {
				// Optionally add to cache list if not already there
				const exists = get().products.some((p) => p.id === fetched.id);
				if (!exists) {
					set({ products: [...get().products, fetched] });
				}
			}
			return fetched;
		} catch {
			return null;
		}
	},

	removeProductById: (id: string) => {
		set((state) => ({
			products: state.products.filter((product) => product.id !== id),
		}));
	},
}));
