import { z } from "zod/v4";

const roleEnum = z.enum(["ADMIN", "MERCHANT", "USER"]);

export const userSchema = z
	.object({
		id: z.uuid(),
		email: z.email(),
		fullName: z.string().min(2),
		role: roleEnum,
		shippingAddress: z.string().nullable().optional(),
	})
	.transform((val) => ({
		...val,
		name: val.fullName,
	}));

export type User = z.infer<typeof userSchema>;
