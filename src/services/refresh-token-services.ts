import type { RefreshTokenRepository } from "../repository/refresh-token-repository";
import type { RefreshTokenSchema } from "../schemas/refresh-token-schema";

export class RefreshTokenServices {
	repository: RefreshTokenRepository;
	constructor(repository: RefreshTokenRepository) {
		this.repository = repository;
	}

	findRefreshTokenByUserId = async (userId: string) => {
		const refreshToken = await this.repository.findRefreshTokenByUserId(userId);
		return refreshToken;
	};

	findRefreshTokenByToken = async (token: string) => {
		const refreshToken = await this.repository.findRefreshTokenByToken(token);
		return refreshToken;
	};

	createRefreshToken = async ({ userId, token, expiresAt }: RefreshTokenSchema) => {
		const refreshToken = await this.repository.createRefreshToken({ userId, token, expiresAt });
		return refreshToken;
	};

	deleteRefreshToken = async (id: string) => {
		const refreshToken = await this.repository.deleteRefreshToken(id);
		return refreshToken;
	};

	findRefreshTokenById = async (id: string) => {
		const refreshToken = await this.repository.findRefreshTokenById(id);
		return refreshToken;
	};
}
