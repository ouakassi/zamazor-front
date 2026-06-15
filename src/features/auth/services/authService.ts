import { API_ENDPOINTS } from "@/core/routes/paths";
import { publicApiRequest } from "@/shared/utils/axiosPublic";
import { clearAuth } from "../stores/authStore";
import {
	refreshResponseSchema,
	type RefreshResponse,
} from "../schemas/authSchema";
import { isApiError } from "@/shared/types";
import { tokenManager } from "../globals/tokenManager";

export const authService = {
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

		if (isApiError(response)) {
			clearAuth();
			throw null;
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
