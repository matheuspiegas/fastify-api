import type { PrismaClient } from "@prisma/client";
import type { CreateUserSchema } from "../schemas/user-schemas.ts";

export class UserRepository {
	database: PrismaClient;
	constructor(database: PrismaClient) {
		this.database = database;
	}

	findUserByEmail = async (email: string) => {
		const user = await this.database.user.findUnique({
			where: {
				email,
			},
		});
		return user;
	};

	findUserByUsername = async (username: string) => {
		const user = await this.database.user.findUnique({
			where: {
				username,
			},
		});
		return user;
	};

	createUser = async ({
		email,
		password,
		username,
		name,
	}: CreateUserSchema) => {
		const user = await this.database.user.create({
			data: {
				email,
				password,
				username,
				name,
			},
		});
		return user;
	};
}
