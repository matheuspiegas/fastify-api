import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { RefreshTokenServices } from "../services/refresh-token-services";

export class RefreshTokenController {
	services: RefreshTokenServices;
	app: FastifyInstance;

	constructor(services: RefreshTokenServices, app: FastifyInstance) {
		this.services = services;
		this.app = app;
	}

	async create(user: { username: string; id: string }, options: { expiresIn: string }) {
		const refresh_token_response = await this.services.findRefreshTokenByUserId(user.id);
		if (refresh_token_response) {
			await this.services.deleteRefreshToken(refresh_token_response.id);
		}

		const refresh_token = this.app.jwt.sign(user, { expiresIn: options.expiresIn });
		await this.services.createRefreshToken({
			token: refresh_token,
			userId: user.id,
			expiresAt: // 7 days from now
				new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		});
		return refresh_token;
	}

	async verify(req: FastifyRequest, res: FastifyReply) {
		const refresh_token = req.cookies.refresh_token;
		if (!refresh_token) {
			return res.code(401).send({ message: "Refresh token not found" });
		}
		const refresh_token_response = await this.services.findRefreshTokenByToken(refresh_token);
		if (!refresh_token_response) {
			return res.code(401).send({ message: "Invalid refresh token" });
		}
		const { token, userId } = refresh_token_response;
		this.app.jwt.verify(token, (err) => {
			if (err) {
				return res.code(401).send({ message: "Invalid refresh token" });
			}
			const access_token = this.app.jwt.sign({ id: userId }, { expiresIn: "15s" });
			return res
				.setCookie("access_token", access_token, {
					httpOnly: true,
					sameSite: "strict",
					path: "/",
				})
				.send({ access_token });
		});
	}
}
