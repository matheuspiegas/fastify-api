import type { FastifyInstance } from "fastify";
import { UserController } from "../controllers/user-controller";
import { prisma } from "../db/db";
import { UserRepository } from "../repository/user-repository";
import { UserServices } from "../services/user-services";
import { RefreshTokenRepository } from "../repository/refresh-token-repository";
import { RefreshTokenServices } from "../services/refresh-token-services";

export const userRoutes = async (fastify: FastifyInstance) => {
	const userRepository = new UserRepository(prisma);
	const refreshTokenRepository = new RefreshTokenRepository(prisma);
	const refreshTokenServices = new RefreshTokenServices(refreshTokenRepository, fastify.jwt);
	const userServices = new UserServices(userRepository, refreshTokenServices);
	const userController = new UserController(userServices, fastify);

	fastify.post("/auth/register", userController.register.bind(userController));
	fastify.post("/auth/login", userController.login.bind(userController));
	fastify.delete("/user/:id", { preHandler: [fastify.authentication] }, userController.deleteUser.bind(userController));
	fastify.get("/auth/google/callback", userController.loginWithGoogle.bind(userController));
	fastify.get("/user/:id", { preHandler: [fastify.authentication] }, userController.updateProfile.bind(userController));
	fastify.get("/user", { preHandler: [fastify.authentication] }, userController.getUser.bind(userController));
};
