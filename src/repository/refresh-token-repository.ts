import type { PrismaClient } from "@prisma/client";
import type { RefreshTokenSchema } from "../schemas/refresh-token-schema";
export class RefreshTokenRepository {
	database: PrismaClient;
	constructor(database: PrismaClient) {
		this.database = database;
	}

	findRefreshTokenById = async (id: string) => {
		const refreshToken = await this.database.refreshToken.findUnique({
			where: {
				id,
			},
		});
		return refreshToken;
	};

	findRefreshTokenByUserId = async (userId: string) => {
		const refreshToken = await this.database.refreshToken.findFirst({
			where: {
				userId,
			},
		});
		return refreshToken;
	};

	findRefreshTokenByToken = async (token: string) => {
		const refreshToken = await this.database.refreshToken.findFirst({
			where: {
				token,
			},
		});
		return refreshToken;
	};

	createRefreshToken = async ({ userId, token, expiresAt }: RefreshTokenSchema) => {
		const refreshToken = await this.database.refreshToken.create({
			data: {
				userId,
				token,
				expiresAt,
			},
		});
		return refreshToken;
	};

	deleteRefreshToken = async (id: string) => {
		const refreshToken = await this.database.refreshToken.delete({
			where: {
				id,
			},
		});
		return refreshToken;
	};
}
