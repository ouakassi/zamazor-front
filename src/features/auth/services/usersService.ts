import { privateApiRequest } from "@/shared/utils/axiosPrivate";
import { userSchema, type User } from "../schemas/userSchema";
import { API_ENDPOINTS } from "@/core/routes/paths";
import { isSystemError } from "@/shared/types";
import { clearAuth, useAuthStore } from "../stores/authStore";
import { AuthStatus } from "../types";

export const userService = {
	fetchCurrentUser: async () => {
		const response = await privateApiRequest<User>(
			{ url: API_ENDPOINTS.AUTH.ME, method: "GET" },
			{ ignoreErrors: true },
		);

		if (isSystemError(response)) {
			clearAuth()
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
