import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const protectedRoute: FastifyPluginAsyncZod = async (fastify) => {
	fastify.get(
		"/protected",
		{
			preHandler: async (req, reply) => {
				const token = req.headers.authorization;
				if (!token) {
					reply.code(401).send({ message: "Unauthorized" });
					return;
				}

				const tokenVerified = await req.jwtVerify();
				if (!tokenVerified) {
					reply.code(401).send({ message: "Unauthorized" });
					return;
				}
			},
		},
		async (req, reply) => {
			return "Allowed to see!";
		},
	);
};
