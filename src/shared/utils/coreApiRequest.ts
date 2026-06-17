import { normalizeError, type SystemError } from "@/shared/types";
import { isCancel, type Axios, type AxiosRequestConfig } from "axios";
import { notify } from "@/lib/notify";

const toastDebounceMap = new Map<string, boolean>();

interface NotificationMessage {
	title: string;
	description?: string;
}

export type ApiRequestOptions = {
	successMessage?: NotificationMessage;
	errorMessage?: NotificationMessage;
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

interface NotificationConfig extends NotificationMessage {
	type: "success" | "error";
	toastKey: string;
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
): Promise<T | SystemError> {
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
		const apiError = normalizeError(error);
		if (isCancel(error) || ignoreErrors) return apiError;

		triggerNotification({
			type: "error",
			toastKey,
			title: errorMessage?.title ?? apiError.title,
			description: errorMessage?.description ?? apiError.description,
			autoResetMs,
		});

		return apiError;
	}
}
