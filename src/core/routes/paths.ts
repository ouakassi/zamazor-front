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
		DETAILS: (id: string) => `/users/${id}`,
	},
	PRODUCTS: {
		ROOT: "/products",
		DETAILS: (id: string) => `/products/${id}`,
		CATEGORY: (id: string) => `/products/category/${id}`,
	},
	CARTS: {
		ROOT: "/carts",
		ITEMS: "/carts/items",
		ITEM_DETAILS: (itemId: string) => `/carts/items/${itemId}`,
	},
	ORDERS: {
		ROOT: "/orders",
		ME: "/orders/me",
		DETAILS: (id: string) => `/orders/${id}`,
		CANCEL: (id: string) => `/orders/${id}/cancel`,
	},
} as const;

export const APP_ROUTES = {
	HOME: "/",
	PRODUCT: "/product/:id",
	SHOP: "/shop",
	CART: "/cart",
	CHECKOUT: "/checkout",
	DASHBOARD: "/dashboard",
	PROFILE: "/profile",
	WISHLIST: "/wishlist",
	NOT_FOUND: "*",
	AUTH: {
		LOGIN: "/login",
		REGISTER: "/register",
	},
} as const;

type ExtractEndpoints<T> = T extends string
	? T
	: T extends object
		? { [K in keyof T]: ExtractEndpoints<T[K]> }[keyof T]
		: never;

export type AllowedEndpoints = ExtractEndpoints<typeof API_ENDPOINTS>;
