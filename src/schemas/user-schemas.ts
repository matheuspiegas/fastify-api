import z from "zod";

export const userSchema = z.object({
	username: z.string().min(5, { message: "Username must contain at least 5 character(s)" }),
	password: z.string().min(5, { message: "Password must contain at least 5 character(s)" }).nullable(),
	email: z.string().email(),
	name: z.string().min(3, { message: "Name must contain at least 3 character(s)" }),
});
export const updateUserSchema = z.object({
	username: z.string().min(5, { message: "Username must contain at least 5 character(s)" }),
	password: z.string().min(5, { message: "Password must contain at least 5 character(s)" }).optional(),
	email: z.string().email().optional(),
	name: z.string().min(3, { message: "Name must contain at least 3 character(s)" }).optional(),
});
export const loginRouteSchema = z.object({
	username: z.string().min(5, { message: "Username must contain at least 5 character(s)" }),
	password: z.string().min(5, { message: "Password must contain at least 5 character(s)" }),
});

export type UserSchema = z.infer<typeof userSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type LoginRouteSchema = z.infer<typeof loginRouteSchema>;
