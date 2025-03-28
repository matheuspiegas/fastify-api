import type { UserRepository } from "../repository/user-repository";
import type { LoginRouteSchema, UpdateUserSchema, UserSchema } from "../schemas/user-schemas.ts";
import bcrypt from "bcryptjs";
import type { RefreshTokenServices } from "./refresh-token-services";

export class UserServices {
	constructor(
		private repository: UserRepository,
		private refreshTokenServices: RefreshTokenServices,
	) {
		this.repository = repository;
		this.refreshTokenServices = refreshTokenServices;
	}

	findUserByEmail = async (email: string) => {
		const user = await this.repository.findUserByEmail(email);
		return user;
	};

	findUserByUsername = async (username: string) => {
		const user = await this.repository.findUserByUsername(username);
		return user;
	};

	findUserById = async (id: string) => {
		const user = await this.repository.findUserById(id);
		return user;
	};

	createUser = async ({ email, password, username, name }: UserSchema) => {
		const user = await this.repository.createUser({
			email,
			password,
			username,
			name,
		});
		return user;
	};

	updateUser = async (id: string, user: UpdateUserSchema) => {
		const userUpdated = await this.repository.updateUser(id, user);
		return userUpdated;
	};

	deleteUser = async (id: string) => {
		const user = await this.repository.deleteUser(id);
		return user;
	};

	login = async ({ username, password }: LoginRouteSchema) => {
		const user = await this.findUserByUsername(username);
		if (!user) {
			return null;
		}
		if (user?.password) {
			const isPasswordValid = bcrypt.compareSync(password, user.password);
			if (!isPasswordValid) {
				return null;
			}
		}
		const refreshToken = await this.refreshTokenServices.createRefreshToken({
			userId: user.id,
			expiresAt: "7d",
		});
		return { user, refreshToken };
	};

	register = async (user: UserSchema) => {
		const { username, email, name, password } = user;
		const existingUsername = await this.findUserByUsername(username);
		const existingUserEmail = await this.findUserByEmail(email);

		if (existingUsername || existingUserEmail) {
			return { success: false, message: "Username or email already in use" };
		}
		const hashedPassword = bcrypt.hashSync(password || "", 10);

		const userResponse = await this.createUser({
			username,
			email,
			name,
			password: hashedPassword,
		});

		return { success: true, user: userResponse };
	};
}
