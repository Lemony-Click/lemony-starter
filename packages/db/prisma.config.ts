import path from "node:path";
import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load the workspace root .env so Prisma CLI commands work when run directly
// from packages/db (e.g. `bunx prisma migrate dev`). override:false means
// variables already in the environment (e.g. from CI) are not overwritten.
config({
	path: path.resolve(import.meta.dirname, "../../.env"),
	override: false,
});

export default defineConfig({
	schema: "schema.prisma",
	migrations: {
		path: "migrations",
	},
	datasource: {
		url: env("DATABASE_URL"),
	},
});
