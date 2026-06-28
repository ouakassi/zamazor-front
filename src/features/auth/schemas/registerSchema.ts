import z from "zod/v4";
import { PASSWORD_REGEX, PASSWORD_REQUIREMENTS_MESSAGE } from "./validation";

export const registerRequestSchema = z
	.object({
		fullName: z.string().min(2, "Name must be at least 2 characters").trim(),
		email: z.string().email("Invalid email format").trim(),
		password: z
			.string()
			.regex(PASSWORD_REGEX, PASSWORD_REQUIREMENTS_MESSAGE)
			.trim(),
	});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export interface RegisterApiRequest {
	email: string;
	password: string;
	fullName: string;
}
