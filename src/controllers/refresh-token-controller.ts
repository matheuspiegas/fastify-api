import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { RefreshTokenServices } from "../services/refresh-token-services";

export class RefreshTokenController {
	services: RefreshTokenServices;
	app: FastifyInstance;

	constructor(services: RefreshTokenServices, app: FastifyInstance) {
		this.services = services;
		this.app = app;
	}

	async verify(req: FastifyRequest, res: FastifyReply) {
		const refreshToken = req.cookies.refresh_token;
		if (!refreshToken) {
			return res.code(401).send({ message: "Refresh token not found" });
		}
		const refreshTokenResponse = await this.services.verifyRefreshToken(refreshToken);
		if (!refreshTokenResponse) {
			return res.code(401).send({ message: "Invalid refresh token" });
		}
		return res
			.setCookie("access_token", refreshTokenResponse, {
				httpOnly: true,
				sameSite: "strict",
				path: "/",
			})
			.send({ access_token: refreshTokenResponse });
	}

	async revoke(req: FastifyRequest, res: FastifyReply) {
		const refreshToken = req.cookies.refresh_token;
		if (!refreshToken) {
			return res.code(401).send({ message: "Refresh token not found" });
		}
		const refreshTokenResponse = await this.services.revokeRefreshToken(refreshToken);
		if (!refreshTokenResponse) {
			return res.code(401).send({ message: "Invalid refresh token" });
		}
		return res
			.clearCookie("refresh_token", {
				path: "/refresh-token",
			})
			.clearCookie("access_token", {
				path: "/",
			})
			.send({ message: "User logged out", success: true });
	}
}
