import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter, type Context, logger, serializeError } from "@workspace/trpc/server";

const server = createHTTPServer({
	router: appRouter,
	onError: ({ error, path, type }) => {
		logger.error("tRPC error", {
			path,
			type,
			code: error.code,
			errorMessage: error.message,
		});
	},
	createContext: (): Context => ({}),
	middleware: (req, res, next) => {
		const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
		res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
		res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
		res.setHeader(
			"Access-Control-Allow-Headers",
			"Content-Type, Authorization, X-Requested-With, trpc-accept, trpc-batch-supported"
		);
		res.setHeader("Access-Control-Allow-Credentials", "true");
		res.setHeader("Access-Control-Max-Age", "86400");
		if (req.method === "OPTIONS") {
			res.writeHead(204);
			res.end();
			return;
		}
		next();
	},
});

const port = parseInt(process.env.PORT ?? "3000");
server.listen(port);
logger.info("Server started", { port });

