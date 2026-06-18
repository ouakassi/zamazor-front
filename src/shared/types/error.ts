import { AxiosError, isAxiosError, isCancel } from "axios";
import { z } from "zod/v4";

const systemErrorSchema = z.object({
	code: z.string().default("SYSTEM_ERROR"),
	type: z.string().default("about:blank"),
	status: z.number(),
	title: z.string(),
	detail: z.string(),
	instance: z.string().optional(),
	description: z.string(),
});
export type SystemError = z.infer<typeof systemErrorSchema>;

export function isSystemError(value: unknown): value is SystemError {
	return systemErrorSchema.safeParse(value).success;
}

const CANCELLED_ERROR = {
	type: "about:blank",
	title: "Request Canceled",
	description: "Request was cancelled",
	status: 499,
	detail: "The network request was intentionally aborted.",
	code: "REQUEST_CANCELLED",
} satisfies SystemError;

const NETWORK_ERROR = {
	type: "about:blank",
	title: "Network Error",
	description: "Server could not be reached",
	status: 0,
	detail:
		"The server is offline or the request was blocked by CORS constraints.",
	code: "NETWORK_FAILURE",
} satisfies SystemError;

const TIMEOUT_ERROR = {
	type: "about:blank",
	title: "Request Timeout",
	status: 504,
	description: "Server took too long to respond",
	detail: "The request was exceeded the allowed response time limit.",
	code: "REQUEST_TIMEOUT",
} satisfies SystemError;

const createRuntimeError = (error: unknown) =>
	({
		type: "about:blank",
		title: "Runtime Error",
		description: "An unexpected error occurred.",
		status: 500,
		detail: error instanceof Error ? error.message : String(error),
		code: "RUNTIME_ERROR",
	}) satisfies SystemError;

const createUnexpectedError = (error: AxiosError) =>
	({
		type: "about:blank",
		title: error.response!.statusText ?? "Server Error",
		status: error.response!.status ?? 500,
		description: "The server returned an unrecognized error layout format.",
		detail: error.message,
		code: "SYSTEM_ERROR",
	}) satisfies SystemError;

export function normalizeError(error: unknown): SystemError {
	if (isCancel(error)) return CANCELLED_ERROR;
	if (!isAxiosError(error)) return createRuntimeError(error);
	if (error.code === "ECONNABORTED") return TIMEOUT_ERROR;

	if (error.response) {
		const parsed = systemErrorSchema.safeParse(error.response.data);
		if (parsed.success) return parsed.data;

		return createUnexpectedError(error);
	}
	return NETWORK_ERROR;
}
