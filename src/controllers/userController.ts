import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { UserServices } from "../services/user-services";
import bcrypt from "bcryptjs";
import { loginRouteSchema, registerUserSchema } from "../schemas/user-schemas";

export class UserController {
	services: UserServices;
	app: FastifyInstance;
	constructor(services: UserServices, app: FastifyInstance) {
		this.services = services;
		this.app = app;
	}

	async register(req: FastifyRequest, reply: FastifyReply) {
		const { success, data, error } = registerUserSchema.safeParse(req.body);
		if (!success) {
			reply.code(400).send({
				errors: error.errors.map((e) => {
					return { path: e.path[0], message: e.message };
				}),
			});
			return;
		}

		if (success) {
			const { username, password, email, name } = data;
			const hashedPassword = bcrypt.hashSync(password, 10);
			const existingUsername = await this.services.findUserByUsername(username);
			const existingUserEmail = await this.services.findUserByEmail(email);
			if (existingUsername || existingUserEmail) {
				reply.code(409).send({ message: "Username or email already in use" });
				return;
			}
			const user = await this.services.createUser({
				email,
				password: hashedPassword,
				username,
				name,
			});
			reply.code(201).send({
				id: user.id,
				username: user.username,
				email: user.email,
			});
		}
	}

	async login(req: FastifyRequest, reply: FastifyReply) {
		const { success, data, error } = loginRouteSchema.safeParse(req.body);
		if (!success) {
			reply.code(400).send({
				errors: error.errors.map((e) => {
					return { path: e.path[0], message: e.message };
				}),
			});
			return;
		}
		if (success) {
			const { username, password } = data;
			const user = await this.services.findUserByUsername(username);
			if (!user) {
				reply.code(401).send({ message: "Invalid username or password" });
				return;
			}
			const passwordMatch = await bcrypt.compare(password, user.password);
			if (passwordMatch) {
				reply.send({
					id: user.id,
					username: user.username,
					name: user.name,
					email: user.email,
					token: this.app.jwt.sign({ username, id: user.id }),
				});
			}
			reply.code(401).send({ message: "Invalid username or password" });
		}
	}

	async updateProfile(req: FastifyRequest, reply: FastifyReply) {
		
	}
}
