import { z } from "zod";

export const profileSchema = z.object({
	fullName: z.string().min(1, "Full name is required"),
	street: z.string().optional(),
	city: z.string().optional(),
	phone: z.string().optional(),
	country: z.string().min(1, "Country is required"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
