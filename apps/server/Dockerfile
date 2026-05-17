# ---- Build ----
FROM oven/bun:1 AS build
WORKDIR /app

# Copy full workspace (node_modules, web/ui source, etc. excluded via .dockerignore)
# No hardcoded paths — adding/removing packages requires no Dockerfile changes
COPY . .

RUN bun install --frozen-lockfile

# Generate Prisma client
RUN cd packages/db && bunx prisma generate

# Compile to a standalone binary
RUN bun build apps/server/src/index.ts \
  --compile \
  --minify \
  --sourcemap \
  --target=bun-linux-x64 \
  --outfile=server

# ---- Runtime ----
FROM debian:bookworm-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=build /app/server /server

USER nobody
EXPOSE 3000
CMD ["/server"]
