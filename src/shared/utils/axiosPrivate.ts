import axios, {
	AxiosError,
	type AxiosRequestConfig,
	type InternalAxiosRequestConfig,
} from "axios";
import { tokenManager } from "@/features/auth/globals/tokenManager";
import CONFIG from "@/core/config/constants";
import { APP_ROUTES } from "@/core/routes/paths";
import { notify } from "@/lib/notify";
import { coreApiRequest, type ApiRequestOptions } from "./coreApiRequest";
import { clearAuth } from "@/features/auth/stores/authStore";
import { authService } from "@/features/auth/services/authService";

const axiosPrivate = axios.create({
	baseURL: CONFIG.API_BASE_URL,
	timeout: CONFIG.TIMEOUT,
	headers: {
		"Content-Type": "application/json",
	},
});

axiosPrivate.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = tokenManager.getAccessToken();
		if (!config.headers["Authorization"] && token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}
		return config;
	},
	(error: AxiosError) => Promise.reject(error),
);

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
	_retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (token: string) => void;
	reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (token) {
			prom.resolve(token);
		} else {
			prom.reject(error);
		}
	});
	failedQueue = [];
};

axiosPrivate.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const prevRequest = error.config as RetryableRequestConfig | undefined;
		const shouldRetryRequest =
			(error.response?.status === 401 || error.response?.status === 403) && prevRequest && !prevRequest._retry;

		if (!shouldRetryRequest) return Promise.reject(error);
		if (isRefreshing) {
			return new Promise((resolve, reject) => {
				failedQueue.push({ resolve, reject });
			})
				.then((token) => {
					if (prevRequest.headers) {
						prevRequest.headers["Authorization"] = `Bearer ${token}`;
					}
					return axiosPrivate(prevRequest);
				})
				.catch((err) => Promise.reject(err));
		}

		prevRequest._retry = true;
		isRefreshing = true;
		try {
			const newToken = await authService.refresh();

			if (!newToken)
				throw new Error("Session refresh failed yielding no token.");
			processQueue(null, newToken);

			prevRequest.headers["Authorization"] = `Bearer ${newToken}`;
			return axiosPrivate(prevRequest);
		} catch (refreshError) {
			processQueue(refreshError, null);

			const publicRoutes = ["/", "/shop", "/product", "/cart", "/wishlist", "/login", "/register"];
			const currentPath = window.location.pathname;
			const isPublic = publicRoutes.some(route => 
				currentPath === route || currentPath.startsWith(route + "/")
			);

			if (!isPublic) {
				window.location.replace(APP_ROUTES.AUTH.LOGIN);
			}

			if (tokenManager.getAccessToken()) {
				notify.error("Session Expired", {
					description:
						"Your session has expired. Please log in again to continue.",
				});
			}
			clearAuth();

			return Promise.reject(refreshError);
		} finally {
			isRefreshing = false;
		}
	},
);

export async function privateApiRequest<T>(
	config: AxiosRequestConfig,
	options: Omit<ApiRequestOptions, "axiosInstance"> = {},
) {
	return coreApiRequest<T>(config, { ...options, axiosInstance: axiosPrivate });
}
