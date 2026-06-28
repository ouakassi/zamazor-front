import { privateApiRequest } from "@/shared/utils/axiosPrivate";
import { userSchema, type User } from "../schemas/userSchema";
import { API_ENDPOINTS } from "@/core/config/apiEndpoints";
import { isSystemError } from "@/shared/types";
import { clearAuth, useAuthStore } from "../stores/authStore";
import { useCartStore } from "@/shared/hooks/use-cart-store";
import { AuthStatus } from "../types";

export const userService = {
	fetchCurrentUser: async () => {
		const response = await privateApiRequest<User>(
			{ url: API_ENDPOINTS.AUTH.ME, method: "GET" },
			{ ignoreErrors: true },
		);

		if (isSystemError(response)) {
			clearAuth();
			return null;
		}
		const parsed = userSchema.safeParse(response);
		if (!parsed.success) {
			console.error("Current user data validation failed:", parsed.error);
			clearAuth();
			return null;
		}
		const user = parsed.data;
		useAuthStore.setState({ user, status: AuthStatus.Authenticated });

		useCartStore.getState().syncWithBackend().catch((err) => {
			console.warn("Failed to sync cart after fetching user:", err);
		});

		return user;
	},

	getUserById: async (id: string): Promise<User | null> => {
		const response = await privateApiRequest<User>({
			url: API_ENDPOINTS.USERS.DETAILS(id),
			method: "GET",
		});

		if (isSystemError(response)) {
			console.error(`Failed to fetch user by id ${id}:`, response);
			return null;
		}
		const parsed = userSchema.safeParse(response);
		if (!parsed.success) {
			console.error("User data validation failed:", parsed.error);
			return null;
		}
		return parsed.data;
	},

	updateCurrentUser: async (payload: { fullName: string; shippingAddress: string | null }): Promise<User | null> => {
		const response = await privateApiRequest<User>({
			url: API_ENDPOINTS.USERS.ME,
			method: "PUT",
			data: payload,
		});

		if (isSystemError(response)) {
			console.error("Failed to update user profile:", response);
			return null;
		}

		const parsed = userSchema.safeParse(response);
		if (!parsed.success) {
			console.error("Updated user data validation failed:", parsed.error);
			return null;
		}

		const updatedUser = parsed.data;
		useAuthStore.setState({ user: updatedUser, status: AuthStatus.Authenticated });
		return updatedUser;
	},
};
