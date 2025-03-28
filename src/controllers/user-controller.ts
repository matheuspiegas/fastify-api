import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { UserServices } from "../services/user-services.js";
import { loginRouteSchema, userSchema } from "../schemas/user-schemas.js";
import z from "zod";

interface UserInfo {
	email: string;
	given_name: string;
	family_name: string;
	id: string;
	verified_email: boolean;
	picture: string;
}

export class UserController {
	constructor(
		private services: UserServices,
		private app: FastifyInstance,
	) {
		this.services = services;
		this.app = app;
	}

	async register(req: FastifyRequest, reply: FastifyReply) {
		const { success, data, error } = userSchema.safeParse(req.body);
		if (!success) {
			reply.code(400).send({
				errors: error.errors.map((e) => {
					return { path: e.path[0], message: e.message };
				}),
			});
			return;
		}
		try {
			const registerResponse = await this.services.register(data);
			if (registerResponse?.success === false) {
				reply.code(409).send({ message: registerResponse.message });
				return;
			}
			return reply.code(201).send(registerResponse.user);
		} catch (error) {
			console.log(error);
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
		try {
			const loginResponse = await this.services.login(data);
			if (!loginResponse) {
				reply.code(401).send({ message: "Invalid username or password" });
				return;
			}

			const { user, refreshToken } = loginResponse;

			return reply
				.setCookie("refresh_token", refreshToken, {
					httpOnly: true,
					path: "/refresh-token",
					sameSite: "strict",
				})
				.setCookie("access_token", this.app.jwt.sign({ username: user.username, id: user.id }, { expiresIn: "10s" }), {
					httpOnly: true,
					sameSite: "strict",
					path: "/",
				})
				.send({
					id: user.id,
					username: user.username,
					name: user.name,
					email: user.email,
				});
		} catch (error) {
			console.log(error);
		}
	}

	//revisar
	async loginWithGoogle(req: FastifyRequest, reply: FastifyReply) {
		try {
			const tokenResponse = await this.app.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
			const expiresIn = tokenResponse.token.expires_in;

			const userInfo = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
				headers: {
					Authorization: `Bearer ${tokenResponse.token.access_token}`,
				},
			}).then((res) => res.json() as Promise<UserInfo>);

			if (!userInfo || !userInfo.email) {
				return reply.status(401).send({ error: "Falha ao autenticar com Google" });
			}
			console.log(userInfo);

			const existingUserEmail = await this.services.findUserByEmail(userInfo.email);
			if (!existingUserEmail) {
				const user = await this.services.createUser({
					email: userInfo.email,
					username: `${userInfo.given_name.toLowerCase()}${userInfo.family_name.toLowerCase()}`,
					name: `${userInfo.given_name} ${userInfo.family_name}`,
					password: null,
				});
			}

			const jwtToken = this.app.jwt.sign(
				{
					email: userInfo.email,
					name: `${userInfo.given_name} ${userInfo.family_name}`,
					picture: userInfo.picture,
					googleId: userInfo.id,
				},
				{
					expiresIn,
				},
			);

			reply.send({ token: jwtToken });
		} catch (error) {
			console.log(error);
		}
	}

	//revisar
	async deleteUser(req: FastifyRequest, reply: FastifyReply) {
		const { id } = req.params as { id: string };
		const deleteRouteSchema = z.string().uuid();
		const { success } = deleteRouteSchema.safeParse(id);
		if (!success) {
			reply.code(404).send({
				error: "User not found",
			});
			return;
		}
		const user = await this.services.findUserById(id);
		if (!user) {
			reply.code(404).send({ message: "User not found" });
			return;
		}
		const deletedUser = await this.services.deleteUser(id);
		reply.code(201).send(deletedUser);
		return;
	}

	//revisar
	async getUser(req: FastifyRequest, reply: FastifyReply) {
		const user = (await req.jwtDecode()) as { id: string };
		const existingUser = await this.services.findUserById(user.id);
		if (!existingUser) {
			reply.code(404).send({ message: "User not found" });
			return;
		}
		reply.send({
			id: existingUser.id,
			username: existingUser.username,
			email: existingUser.email,
			name: existingUser.name,
		});
	}

	//revisar
	async updateProfile(req: FastifyRequest, reply: FastifyReply) {
		const { id } = req.params as { id: string };
		const user = await this.services.findUserById(id);
		reply.send(user);
		return;
	}
}
