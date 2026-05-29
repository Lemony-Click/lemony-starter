import cors from "@fastify/cors";
import {
	type FastifyTRPCPluginOptions,
	fastifyTRPCPlugin,
} from "@trpc/server/adapters/fastify";
import {
	type AppRouter,
	appRouter,
	type Context,
	logger,
} from "@workspace/trpc/server";
import Fastify from "fastify";

const port = parseInt(process.env.PORT ?? "3000", 10);
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

const server = Fastify({
	maxParamLength: 5000,
});

await server.register(cors, {
	origin: corsOrigin,
	credentials: true,
	methods: ["GET", "POST", "OPTIONS"],
});

await server.register(fastifyTRPCPlugin, {
	prefix: "/trpc",
	trpcOptions: {
		router: appRouter,
		createContext: (): Context => ({}),
		onError: ({ error, path, type }) => {
			logger.error("tRPC error", {
				path,
				type,
				code: error.code,
				errorMessage: error.message,
			});
		},
	} satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
});

try {
	await server.listen({ port, host: "0.0.0.0" });
	logger.info("Server started", { port });
} catch (err) {
	logger.error("Failed to start server", { error: err });
	process.exit(1);
}
