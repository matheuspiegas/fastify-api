import { FastifyInstance } from "fastify";

export const orcamentoRoutes = (fastify: FastifyInstance) => {
  fastify.get("/orcamento", async (request, reply) => {
    console.log("GET /orcamento");
  }
  );
}