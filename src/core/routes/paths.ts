export { API_ENDPOINTS } from "@/core/config/apiEndpoints";
export type { AllowedEndpoints } from "@/core/config/apiEndpoints";

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
