import fastify from "fastify";
import { fastifyJwt } from "@fastify/jwt";
import { userRoutes } from "./routes/user-routes";
import { verifyToken } from "./middlewares/verify-token";
import fastifyOauth2 from "@fastify/oauth2";
import crypto from "node:crypto";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
export const app = fastify();

app.register(fastifyCors, {
	origin: ["http://localhost:3001"],
	credentials: true,
});

app.register(fastifyJwt, {
	secret: process.env.JWT_SECRET || "",
	cookie: {
		cookieName: "access_token",
		signed: false,
	},
});
app.register(fastifyCookie);

//@ts-ignore
app.register(fastifyOauth2, {
	name: "googleOAuth2",
	scope: ["profile", "email"],
	credentials: {
		client: {
			id: process.env.GOOGLE_CLIENT_ID || "",
			secret: process.env.GOOGLE_CLIENT_SECRET || "",
		},
		auth: fastifyOauth2.GOOGLE_CONFIGURATION,
	},
	startRedirectPath: "/login/google",
	callbackUri: "http://localhost:3000/auth/google/callback",
	generateStateFunction: () => {
		const state = crypto.randomBytes(20).toString("hex");
		return state;
	},
	checkStateFunction: (state, callback) => {
		if (!state) {
			return callback(new Error("Invalid state!"));
		}
		callback();
	},
});

app.register(userRoutes);

app.decorate("authentication", verifyToken);

app.listen({ port: 3000 }, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`Server listening at ${address}`);
});
