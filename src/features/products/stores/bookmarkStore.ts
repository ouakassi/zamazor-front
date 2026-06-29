import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../../../core/config/productsData";
import { tokenManager } from "@/features/auth/globals/tokenManager";
import { wishlistService } from "@/features/products/services/wishlistService";

interface BookmarkStore {
	bookmarks: Product[];
	addBookmark: (product: Product) => Promise<void>;
	removeBookmark: (productId: string) => Promise<void>;
	isBookmarked: (productId: string) => boolean;
	clearBookmarks: () => Promise<void>;
	syncWishlists: () => Promise<void>;
}

export const useBookmarkStore = create<BookmarkStore>()(
	persist(
		(set, get) => ({
			bookmarks: [],
			addBookmark: async (product) => {
				const current = get().bookmarks;
				if (current.some((p) => p.id === product.id)) {
					return;
				}

				set({ bookmarks: [...current, product] });
				const success = await wishlistService.addWishlist(product.id);
				if (!success) {
					set({ bookmarks: current });
				}
			},
			removeBookmark: async (productId) => {
				const current = get().bookmarks;
				if (!current.some((p) => p.id === productId)) {
					return;
				}

				set({
					bookmarks: current.filter((p) => p.id !== productId),
				});

				const success = await wishlistService.removeWishlist(productId);
				if (!success) {
					set({ bookmarks: current });
				}
			},
			isBookmarked: (productId) => {
				return get().bookmarks.some((p) => p.id === productId);
			},
			clearBookmarks: async () => {
				const current = get().bookmarks;
				if (tokenManager.getAccessToken()) {
					await Promise.allSettled(current.map((product) => wishlistService.removeWishlist(product.id)));
				}
				set({ bookmarks: [] });
			},
			syncWishlists: async () => {
				if (!tokenManager.getAccessToken()) {
					return;
				}

				const wishlists = await wishlistService.getWishlists();
				set({ bookmarks: wishlists });
			},
		}),
		{
			name: "zamazor-bookmarks",
		}
	)
);
