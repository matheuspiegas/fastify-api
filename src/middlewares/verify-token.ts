import type { FastifyReply, FastifyRequest } from "fastify";

export const verifyToken = async (request: FastifyRequest, reply: FastifyReply) => {
	const token = request.cookies.access_token;
	if (!token) {
		reply.code(401).send({ message: "Unauthorized" });
	}
	const verify = await request.jwtVerify();
	if (!verify) {
		reply.code(401).send({ message: "Unauthorized" });
	}
};
