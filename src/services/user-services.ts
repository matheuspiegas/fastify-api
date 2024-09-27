import type { UserRepository } from "../repository/user-repository";
import type { CreateUserSchema } from "../schemas/user-schemas.ts";

export class UserServices {
	repository: UserRepository;
	constructor(repository: UserRepository) {
		this.repository = repository;
	}

	findUserByEmail = async (email: string) => {
		const user = await this.repository.findUserByEmail(email);
		return user;
	};
	findUserByUsername = async (username: string) => {
		const user = await this.repository.findUserByUsername(username);
		return user;
	};
	createUser = async ({
		email,
		password,
		username,
		name,
	}: CreateUserSchema) => {
		const user = await this.repository.createUser({
			email,
			password,
			username,
			name,
		});
		return user;
	};
}
