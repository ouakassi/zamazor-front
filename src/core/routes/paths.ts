export const API_ENDPOINTS = {
	AUTH: {
		LOGIN: "/auth/login",
		REGISTER: "/auth/register",
		LOGOUT: "/auth/logout",
		REFRESH: "/auth/refresh",
	},
	USERS: {
		ROOT: "/users",
		DETAILS: (id: string) => `/users/${id}`,
	},
} as const;

export const APP_ROUTES = {
	HOME: "/",
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
