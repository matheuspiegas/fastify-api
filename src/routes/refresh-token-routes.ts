import type { FastifyInstance } from "fastify";
import { prisma } from "../db/db";
import { RefreshTokenRepository } from "../repository/refresh-token-repository";
import { RefreshTokenServices } from "../services/refresh-token-services";
import { RefreshTokenController } from "../controllers/refresh-token-controller";

export const refreshTokenRoutes = async (fastify: FastifyInstance) => {
	const refreshTokenRepository = new RefreshTokenRepository(prisma);
	const refreshTokenServices = new RefreshTokenServices(refreshTokenRepository, fastify.jwt);
	const refreshTokenController = new RefreshTokenController(refreshTokenServices, fastify);

	fastify.post("/refresh-token", refreshTokenController.verify.bind(refreshTokenController));
	fastify.post("/refresh-token/revoke", refreshTokenController.revoke.bind(refreshTokenController));
};
