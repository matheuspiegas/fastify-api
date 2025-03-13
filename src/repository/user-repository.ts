import type { PrismaClient } from "@prisma/client";
import type { UpdateUserSchema, UserSchema } from "../schemas/user-schemas.ts";

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

	findUserById = async (id: string) => {
		const user = await this.database.user.findUnique({
			where: {
				id,
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

	createUser = async ({ email, password, username, name }: UserSchema) => {
		const user = await this.database.user.create({
			data: {
				email,
				password,
				username,
				name,
			},
			select: {
				id: true,
				username: true,
				email: true,
				name: true,
			},
		});
		return user;
	};

	updateUser = async (id: string, user: UpdateUserSchema) => {
		const userUpdated = await this.database.user.update({
			where: {
				id,
			},
			data: user,
		});
		return userUpdated;
	};

	deleteUser = async (id: string) => {
		const user = await this.database.user.delete({
			where: {
				id,
			},
			select: {
				id: true,
				username: true,
				email: true,
				name: true,
			},
		});
		return user;
	};
}
