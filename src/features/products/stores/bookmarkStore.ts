import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Product } from "@/core/config/productsData";

interface BookmarkStore {
	bookmarks: Product[];
	addBookmark: (product: Product) => void;
	removeBookmark: (productId: string) => void;
	isBookmarked: (productId: string) => boolean;
	clearBookmarks: () => void;
}

export const useBookmarkStore = create<BookmarkStore>()(
	persist(
		(set, get) => ({
			bookmarks: [],
			addBookmark: (product) => {
				const current = get().bookmarks;
				if (!current.some((p) => p.id === product.id)) {
					set({ bookmarks: [...current, product] });
				}
			},
			removeBookmark: (productId) => {
				set({
					bookmarks: get().bookmarks.filter((p) => p.id !== productId),
				});
			},
			isBookmarked: (productId) => {
				return get().bookmarks.some((p) => p.id === productId);
			},
			clearBookmarks: () => {
				set({ bookmarks: [] });
			},
		}),
		{
			name: "zamazor-bookmarks",
		}
	)
);
