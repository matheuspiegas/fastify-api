import type { FastifyReply, FastifyRequest } from "fastify";

export const verifyToken = async (
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	const token = request.headers.authorization?.split(" ")[1];
	const verify = await request.jwtVerify(token);
	if (!verify) {
		reply.code(401).send({ message: "Unauthorized" });
	}
};
