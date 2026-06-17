import z from "zod/v4";
import { PASSWORD_REGEX, PASSWORD_REQUIREMENTS_MESSAGE } from "./validation";
import { userSchema } from "./userSchema";

export const loginRequestSchema = z.object({
	email: z.email().trim(),
	password: z
		.string()
		.regex(PASSWORD_REGEX, PASSWORD_REQUIREMENTS_MESSAGE)
		.trim(),
	remember: z.boolean().optional(),
});

export const loginResponseSchema = z.object({
	user: userSchema,
	accessToken: z.jwt(),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
