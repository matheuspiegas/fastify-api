import z from "zod";

export const registerRouteSchema = z.object({
	username: z.string().min(4),
	password: z.string().min(5),
	email: z.string().email(),
	name: z.string(),
});
export const loginRouteSchema = z.object({
	username: z.string(),
	password: z.string(),
});

export const createUserSchema = z.object({
	username: z.string().min(4),
	password: z.string().min(5),
	email: z.string().email(),
	name: z.string(),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;
