import { z } from "zod/v4";

export const refreshResponseSchema = z.object({
	accessToken: z.jwt(),
});

export type RefreshResponse = z.infer<typeof refreshResponseSchema>;
