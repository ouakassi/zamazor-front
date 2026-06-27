import { z } from "zod";

export const profileSchema = z.object({
	fullName: z.string().min(1, "Full name is required"),
	street: z.string().optional(),
	city: z.string().optional(),
	zip: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
