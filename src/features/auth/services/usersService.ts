import { privateApiRequest } from "@/shared/utils/axiosPrivate";
import { userSchema, type User } from "../schemas/userSchema";
import { API_ENDPOINTS } from "@/core/routes/paths";
import { isApiError } from "@/shared/types";
import { clearAuth, useAuthStore } from "../stores/authStore";
import { tokenManager } from "../globals/tokenManager";
import { AuthStatus } from "../types";

export const userService = {
	fetchCurrentUser: async () => {
		const response = await privateApiRequest<User>(
			{ url: API_ENDPOINTS.AUTH.ME, method: "GET" },
			{ ignoreErrors: true },
		);

		if (isApiError(response)) {
			useAuthStore.setState({ user: null, status: AuthStatus.Unauthenticated });
			tokenManager.clear();
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
		return user;
	},
};
