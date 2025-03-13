import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { UserServices } from "../services/user-services.ts";
import bcrypt from "bcryptjs";
import { loginRouteSchema, userSchema } from "../schemas/user-schemas";
import z from "zod";
import type { RefreshTokenServices } from "../services/refresh-token-services.js";
import { RefreshTokenController } from "./refresh-token-controller.js";

interface UserInfo {
	email: string;
	given_name: string;
	family_name: string;
	id: string;
	verified_email: boolean;
	picture: string;
}

export class UserController {
	services: UserServices;
	refreshTokenServices: RefreshTokenServices;
	app: FastifyInstance;
	constructor(services: UserServices, app: FastifyInstance, refreshTokenServices: RefreshTokenServices) {
		this.services = services;
		this.refreshTokenServices = refreshTokenServices;
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

		if (success) {
			const { username, password, email, name } = data;
			const hashedPassword = bcrypt.hashSync(password || "", 10);
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
				name: user.name,
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
		const { username, password } = data;
		const user = await this.services.findUserByUsername(username);
		if (!user) {
			reply.code(401).send({ message: "Invalid username or password" });
			return;
		}
		const passwordMatch = await bcrypt.compare(password, user.password || "");
		if (!passwordMatch) {
			reply.code(401).send({ message: "Invalid username or password" });
			return;
		}

		const refresh_token = await new RefreshTokenController(this.refreshTokenServices, this.app).create(
			{ username, id: user.id },
			{ expiresIn: "7d" },
		);

		reply
			.setCookie("refresh_token", refresh_token, {
				httpOnly: true,
				path: "/refresh-token",
				sameSite: "strict",
			})
			.setCookie("access_token", this.app.jwt.sign({ username, id: user.id }, { expiresIn: "10s" }), {
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
		return;
	}

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

	async updateProfile(req: FastifyRequest, reply: FastifyReply) {
		const { id } = req.params as { id: string };
		const user = await this.services.findUserById(id);
		reply.send(user);
		return;
	}
}
