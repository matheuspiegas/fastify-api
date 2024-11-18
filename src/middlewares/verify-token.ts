import type { FastifyReply, FastifyRequest } from "fastify";

export const verifyToken = async (
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	const verify = await request.jwtVerify();
	if (!verify) {
		reply.code(401).send({ message: "Unauthorized" });
	}
};
