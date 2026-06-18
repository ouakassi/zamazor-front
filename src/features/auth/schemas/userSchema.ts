import { z } from "zod/v4";

const roleEnum = z.enum(["ADMIN", "MERCHANT", "USER"]);

export const userSchema = z.object({
	id: z.uuid(),
	name: z.string().min(2),
	email: z.email(),
	avatarUrl: z.url().nullable(),
	birthDate: z.iso.date(),
	role: roleEnum,
});

export type User = z.infer<typeof userSchema>;
