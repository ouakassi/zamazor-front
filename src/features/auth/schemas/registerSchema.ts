import z from "zod/v4";
import { PASSWORD_REGEX, PASSWORD_REQUIREMENTS_MESSAGE } from "./validation";

const now = new Date();
const major = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());

export const registerRequestSchema = z
	.object({
		name: z.string().trim(),
		email: z.email().trim(),
		password: z
			.string()
			.regex(PASSWORD_REGEX, PASSWORD_REQUIREMENTS_MESSAGE)
			.trim(),
		passwordConfirm: z.string().trim(),
		birthDate: z
			.date("birth date is not a valid date.")
			.max(major, "You must be at least 18 years old."),
		conditions: z.literal(true, "You must accept the terms and conditions"),
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: "Passwords don't match",
		path: ["passwordConfirm"],
	});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
