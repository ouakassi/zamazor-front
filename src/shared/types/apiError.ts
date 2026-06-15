import { isAxiosError, isCancel } from "axios";
import { z } from "zod/v4";

const apiErrorSchema = z.object({
	status: z.number().int().describe("HTTP status code"),
	code: z.string().describe("Short machine-readable identifier"),
	message: z.string().describe("User-friendly error message"),
	details: z.string().optional().describe("Extra description for developers"),
	fields: z
		.record(z.string(), z.array(z.string()))
		.optional()
		.describe("Validation field errors"),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

export function isApiError(value: unknown): value is ApiError {
	return apiErrorSchema.safeParse(value).success;
}

const cancelledError = {
	status: 499,
	code: "REQUEST_CANCELLED",
	message: "Request was cancelled.",
} satisfies ApiError;

const unknownError = (error: unknown) =>
	({
		status: 500,
		code: "UNKNOWN_ERROR",
		message: "An unexpected error occurred.",
		details: error instanceof Error ? error.message : String(error),
	}) satisfies ApiError;

export function toApiError(error: unknown): ApiError {
	if (isCancel(error)) return cancelledError;
	if (isApiError(error)) return error;
	if (isAxiosError(error)) {
		const responseData = error.response?.data;
		const parsed = apiErrorSchema.safeParse(responseData);

		if (parsed.success) return parsed.data;

		return {
			status: error.response?.status ?? 500,
			code: error.code ?? "AXIOS_ERROR",
			message: responseData?.message ?? error.message,
			details: error.config?.url
				? `Failed request to: ${error.config.url}`
				: undefined,
		};
	}

	return unknownError(error);
}
