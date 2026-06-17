import { z } from "zod/v4";

const envSchema = z.object({
	VITE_API_BASE_URL: z.url({ message: "Must be a valid URL string" }),
	VITE_APP_NAME: z.string(),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
	console.error("Invalid environment variables:", parsed.error);
	throw new Error(
		"Environment validation failed. Fix the errors above before running the app.",
	);
}

export const CONFIG = {
	API_BASE_URL: parsed.data.VITE_API_BASE_URL,
	TIMEOUT: 5000,
	APP_NAME: parsed.data.VITE_APP_NAME,
} as const;

export default CONFIG;
