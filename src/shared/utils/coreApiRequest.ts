import { toApiError, type ApiError } from "@/shared/types";
import { isCancel, type Axios, type AxiosRequestConfig } from "axios";
import { notify } from "@/lib/notify";

const toastDebounceMap = new Map<string, boolean>();

export type ApiRequestOptions = {
	successMessage?: {
		title: string;
		description?: string;
	};
	errorMessage?: {
		title: string;
		description?: string;
	};
	axiosInstance: Axios;
	autoResetMs?: number;
	ignoreErrors?: boolean;
};

function getToastKey(config: AxiosRequestConfig): string {
	const method = (config.method ?? "GET").toUpperCase();
	const cleanUrl = (config.url ?? "unknown_url").split("?")[0];

	const normalizedUrl = cleanUrl
		.replace(/\/\d+/g, "/:id")
		.replace(
			/\/[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}/gi,
			"/:id",
		);

	return `${method}:${normalizedUrl}`;
}

interface NotificationConfig {
	type: "success" | "error";
	toastKey: string;
	title: string;
	description?: string;
	autoResetMs?: number;
}

function triggerNotification({
	type,
	toastKey,
	title,
	description,
	autoResetMs = 5000,
}: NotificationConfig): void {
	if (toastDebounceMap.get(toastKey)) return;

	notify[type](title, { description });
	toastDebounceMap.set(toastKey, true);

	if (autoResetMs > 0) {
		setTimeout(() => toastDebounceMap.delete(toastKey), autoResetMs);
	}
}

export async function coreApiRequest<T>(
	config: AxiosRequestConfig,
	options: ApiRequestOptions,
): Promise<T | ApiError> {
	const {
		successMessage,
		errorMessage,
		axiosInstance,
		autoResetMs = 5000,
		ignoreErrors = false,
	} = options;

	const toastKey = getToastKey(config);

	try {
		const response = await axiosInstance.request<T>(config);

		if (successMessage) {
			triggerNotification({
				type: "success",
				toastKey,
				title: successMessage.title,
				description: successMessage.description,
				autoResetMs,
			});
		}

		return response.data;
	} catch (error) {
		const apiError = toApiError(error);

		if (!isCancel(error) && !ignoreErrors) {
			const title = errorMessage?.title ?? "Request failed";
			const description = errorMessage?.description ?? apiError.message;

			triggerNotification({
				type: "error",
				toastKey,
				title,
				description,
				autoResetMs,
			});
		}

		return apiError;
	}
}
