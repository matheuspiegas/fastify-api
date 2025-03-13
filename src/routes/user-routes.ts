import type { FastifyInstance, FastifyRequest } from "fastify";
import { UserController } from "../controllers/userController";
import { prisma } from "../db/db";
import { UserRepository } from "../repository/user-repository";
import { UserServices } from "../services/user-services";
import { RefreshTokenRepository } from "../repository/refresh-token-repository";
import { RefreshTokenServices } from "../services/refresh-token-services";
import { RefreshTokenController } from "../controllers/refresh-token-controller";

const userRepository = new UserRepository(prisma);
const userServices = new UserServices(userRepository);
const refreshTokenRepository = new RefreshTokenRepository(prisma);
const refreshTokenServices = new RefreshTokenServices(refreshTokenRepository);

export const userRoutes = async (fastify: FastifyInstance) => {
	const userController = new UserController(userServices, fastify, refreshTokenServices);
	const refreshTokenController = new RefreshTokenController(refreshTokenServices, fastify);

	fastify.post("/auth/register", userController.register.bind(userController));
	fastify.post("/auth/login", userController.login.bind(userController));
	fastify.delete("/user/:id", { preHandler: [fastify.authentication] }, userController.deleteUser.bind(userController));
	fastify.get("/auth/google/callback", userController.loginWithGoogle.bind(userController));
	fastify.post("/refresh-token", refreshTokenController.verify.bind(refreshTokenController));
	fastify.get("/user/:id", { preHandler: [fastify.authentication] }, userController.updateProfile.bind(userController));
	fastify.get("/user", { preHandler: [fastify.authentication] }, userController.getUser.bind(userController));
};
