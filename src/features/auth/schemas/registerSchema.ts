import z from "zod/v4";
import { PASSWORD_REGEX, PASSWORD_REQUIREMENTS_MESSAGE } from "./validation";

export const registerRequestSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters").trim(),
		email: z.string().email("Invalid email format").trim(),
		password: z
			.string()
			.regex(PASSWORD_REGEX, PASSWORD_REQUIREMENTS_MESSAGE)
			.trim(),
		birthDate: z
			.date({ message: "Birth date is required" })
			.refine((date) => {
				const today = new Date();
				let age = today.getFullYear() - date.getFullYear();
				const m = today.getMonth() - date.getMonth();
				if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
					age--;
				}
				return age >= 18;
			}, {
				message: "You must be 18 years or older to register.",
			}),
	});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export interface RegisterApiRequest {
	email: string;
	password: string;
	fullName: string;
}
