# Runs Prisma migrations as a one-shot container
FROM oven/bun:1
WORKDIR /app

COPY . .
RUN bun install --frozen-lockfile
RUN cd packages/db && bunx prisma generate

CMD ["bunx", "prisma", "migrate", "deploy", "--schema", "packages/db/schema.prisma"]
