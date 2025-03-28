import type { FastifyInstance } from "fastify";
import type { RefreshTokenRepository } from "../repository/refresh-token-repository";
import type { RefreshTokenSchema } from "../schemas/refresh-token-schema";

export class RefreshTokenServices {
	constructor(
		private repository: RefreshTokenRepository,
		private jwt: FastifyInstance["jwt"],
	) {
		this.repository = repository;
		this.jwt = jwt;
	}

	findRefreshTokenByUserId = async (userId: string) => {
		const refreshToken = await this.repository.findRefreshTokenByUserId(userId);
		return refreshToken;
	};

	findRefreshTokenByToken = async (token: string) => {
		const refreshToken = await this.repository.findRefreshTokenByToken(token);
		return refreshToken;
	};

	findRefreshTokenById = async (id: string) => {
		const refreshToken = await this.repository.findRefreshTokenById(id);
		return refreshToken;
	};

	deleteRefreshToken = async (id: string) => {
		const refreshToken = await this.repository.deleteRefreshToken(id);
		return refreshToken;
	};

	verifyRefreshToken = async (token: string) => {
		const refreshToken = await this.findRefreshTokenByToken(token);
		if (!refreshToken) {
			return null;
		}
		try {
			this.jwt.verify(refreshToken.token);
			const accessToken = this.jwt.sign({ id: refreshToken.userId }, { expiresIn: "15s" });
			return accessToken;
		} catch (e) {
			return null;
		}
	};

	revokeRefreshToken = async (token: string) => {
		const refreshToken = await this.findRefreshTokenByToken(token);
		if (!refreshToken) {
			return null;
		}
		await this.deleteRefreshToken(refreshToken.id);
		return refreshToken;
	};

	createRefreshToken = async ({ userId, expiresAt }: { userId: string; expiresAt: string }) => {
		const existingRefreshToken = await this.findRefreshTokenByUserId(userId);
		if (existingRefreshToken) {
			await this.deleteRefreshToken(existingRefreshToken.id);
		}

		const refreshToken = this.jwt.sign({ id: userId }, { expiresIn: expiresAt });
		await this.repository.createRefreshToken({
			userId,
			token: refreshToken,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
		});
		return refreshToken;
	};
}
