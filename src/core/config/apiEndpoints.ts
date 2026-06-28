export const API_ENDPOINTS = {
	AUTH: {
		LOGIN: "/auth/login",
		REGISTER: "/auth/register",
		LOGOUT: "/auth/logout",
		REFRESH: "/auth/refresh",
		ME: "/auth/me",
	},
	USERS: {
		ROOT: "/users",
		ME: "/users/me",
		DETAILS: (id: string) => `/users/${id}`,
	},
	PRODUCTS: {
		ROOT: "/products",
		SEARCH_ROOT: "/products/search",
		DETAILS: (id: string) => `/products/${id}`,
		CATEGORY: (id: string) => `/products/category/${id}`,
		SEARCH: (query: string) => `/products/search?q=${encodeURIComponent(query)}`,
	},
	CATEGORIES: {
		ROOT: "/categories",
		DETAILS: (id: string) => `/categories/${id}`,
	},
	CARTS: {
		ROOT: "/carts",
		ITEMS: "/carts/items",
		ITEM_DETAILS: (itemId: string) => `/carts/items/${itemId}`,
	},
	ADDRESSES: {
		ROOT: "/addresses",
	},
	WISHLISTS: {
		ROOT: "/wishlists",
		DETAILS: (productId: string) => `/wishlists/${productId}`,
	},
	ORDERS: {
		ROOT: "/orders",
		ME: "/orders/me",
		DETAILS: (id: string) => `/orders/${id}`,
		CANCEL: (id: string) => `/orders/${id}/cancel`,
		STATUS: (id: string) => `/orders/${id}/status`,
		CHECKOUT: "/orders/checkout",
	},
} as const;

type ExtractEndpoints<T> = T extends string
	? T
	: T extends object
		? { [K in keyof T]: ExtractEndpoints<T[K]> }[keyof T]
		: never;

export type AllowedEndpoints = ExtractEndpoints<typeof API_ENDPOINTS>;
