import z from "zod";

export const registerRouteSchema = z.object({
	username: z
		.string()
		.min(5, { message: "Username must contain at least 5 character(s)" }),
	password: z
		.string()
		.min(5, { message: "Password must contain at least 5 character(s)" }),
	email: z.string().email(),
	name: z
		.string()
		.min(3, { message: "Name must contain at least 3 character(s)" }),
});
export const loginRouteSchema = z.object({
	username: z
		.string()
		.min(5, { message: "Username must contain at least 5 character(s)" }),
	password: z
		.string()
		.min(5, { message: "Password must contain at least 5 character(s)" }),
});

export const createUserSchema = z.object({
	username: z
		.string()
		.min(5, { message: "Username must contain at least 5 character(s)" }),
	password: z
		.string()
		.min(5, { message: "Password must contain at least 5 character(s)" }),
	email: z.string().email(),
	name: z
		.string()
		.min(3, { message: "Name must contain at least 3 character(s)" }),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;
