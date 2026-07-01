import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/features/products/types";
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
				if (tokenManager.getAccessToken()) {
					const success = await wishlistService.addWishlist(product.id);
					if (success) {
						await get().syncWishlists();
					}
					return;
				}

				const current = get().bookmarks;
				if (current.some((p) => p.id === product.id)) {
					return;
				}

				set({ bookmarks: [...current, product] });
			},
			removeBookmark: async (productId) => {
				if (tokenManager.getAccessToken()) {
					const success = await wishlistService.removeWishlist(productId);
					if (success) {
						await get().syncWishlists();
					}
					return;
				}

				const current = get().bookmarks;
				if (!current.some((p) => p.id === productId)) {
					return;
				}

				set({
					bookmarks: current.filter((p) => p.id !== productId),
				});
			},
			isBookmarked: (productId) => {
				return get().bookmarks.some((p) => p.id === productId);
			},
			clearBookmarks: async () => {
				const current = get().bookmarks;
				if (tokenManager.getAccessToken()) {
					await Promise.allSettled(current.map((product) => wishlistService.removeWishlist(product.id)));
					await get().syncWishlists();
					return;
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
			partialize: (state) => ({
				bookmarks: tokenManager.getAccessToken() ? [] : state.bookmarks,
			}),
		}
	)
);
