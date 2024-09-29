import type { FastifyInstance } from "fastify";
import { UserController } from "../controllers/userController";
import { prisma } from "../db/db";
import { UserRepository } from "../repository/user-repository";
import { UserServices } from "../services/user-services";

const userRepository = new UserRepository(prisma);
const userServices = new UserServices(userRepository);

export const userRoutes = async (fastify: FastifyInstance) => {
	const userController = new UserController(userServices, fastify);
	fastify.post("/auth/register", userController.register.bind(userController));
	fastify.post("/auth/login", userController.login.bind(userController));
	fastify.put("/user/:id", userController.updateProfile.bind(userController))
};
