import fastify from "fastify";
import { fastifyJwt } from "@fastify/jwt";
import {
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod";
import { protectedRoute } from "./routes/protected";
import { userRoutes } from "./routes/user-routes";
import { env } from "./env";

export const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyJwt, {
	secret: env.JWT_SECRET,
});
app.register(userRoutes);
app.register(protectedRoute);

app.listen({ port: 3000 }, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`Server listening at ${address}`);
});
