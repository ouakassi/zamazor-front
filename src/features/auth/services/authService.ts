import { API_ENDPOINTS } from "@/core/config/apiEndpoints";
import { publicApiRequest } from "@/shared/utils/axiosPublic";
import { clearAuth, useAuthStore } from "../stores/authStore";
import { useCartStore } from "@/shared/hooks/use-cart-store";
import {
	refreshResponseSchema,
	type RefreshResponse,
} from "../schemas/authSchema";
import { isSystemError } from "@/shared/types";
import { tokenManager } from "../globals/tokenManager";
import { AuthStatus } from "../types";
import {
	loginResponseSchema,
	type LoginRequest,
	type LoginResponse,
} from "../schemas/loginSchema";
import type { User } from "../schemas/userSchema";
import type { RegisterApiRequest } from "../schemas/registerSchema";

export const authService = {
	register: async (data: RegisterApiRequest) => {
		return publicApiRequest<User>(
			{
				url: API_ENDPOINTS.AUTH.REGISTER,
				method: "POST",
				data,
			},
			{
				successMessage: {
					title: "Registration successful. Please login.",
					description: "Your account has been created successfully.",
				},
			},
		);
	},

	login: async (data: LoginRequest) => {
		const response = await publicApiRequest<LoginResponse>(
			{
				url: API_ENDPOINTS.AUTH.LOGIN,
				method: "POST",
				data,
			},
			{
				successMessage: {
					title: "Login successful!",
					description: "You’re all set — let’s get started.",
				},
			},
		);

		if (isSystemError(response)) return response;
		const parsed = loginResponseSchema.safeParse(response);
		if (!parsed.success) {
			throw Error("Login response data validation failed:", parsed.error);
		}

		const { user, accessToken } = parsed.data;

		useAuthStore.setState({
			user,
			status: AuthStatus.Authenticated,
		});
		tokenManager.setAccessToken(accessToken);

		useCartStore.getState().syncWithBackend().catch((err) => {
			console.warn("Failed to sync cart after login:", err);
		});

		return response;
	},

	logout: async () => {
		await publicApiRequest<void>({
			url: API_ENDPOINTS.AUTH.LOGOUT,
			method: "POST",
		});

		clearAuth();
	},

	refresh: async () => {
		const response = await publicApiRequest<RefreshResponse>(
			{
				url: API_ENDPOINTS.AUTH.REFRESH,
				method: "POST",
				withCredentials: true,
			},
			{ ignoreErrors: true },
		);

		if (isSystemError(response)) {
			clearAuth();
			return null;
		}
		const parsed = refreshResponseSchema.safeParse(response);
		if (!parsed.success) {
			console.error("Token refresh data validation failed:", parsed.error);
			clearAuth();
			return null;
		}
		const { accessToken } = parsed.data;
		tokenManager.setAccessToken(accessToken);
		return accessToken;
	},
};
