import z from "zod";

export const refreshTokenSchema = z.object({
	userId: z.string(),
	token: z.string(),
	expiresAt: z.date(),
});

export type RefreshTokenSchema = z.infer<typeof refreshTokenSchema>;
