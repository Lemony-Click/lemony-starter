type LogLevel = "info" | "warn" | "error";

function write(
	level: LogLevel,
	message: string,
	data?: Record<string, unknown>,
): void {
	const entry: Record<string, unknown> = {
		level,
		message,
		timestamp: new Date().toISOString(),
	};

	if (data) {
		for (const [key, value] of Object.entries(data)) {
			entry[key] = value;
		}
	}

	const line = JSON.stringify(entry);

	if (level === "error") {
		process.stderr.write(`${line}\n`);
	} else {
		process.stdout.write(`${line}\n`);
	}
}

export function serializeError(err: unknown): Record<string, unknown> {
	if (err instanceof Error) {
		return {
			errorName: err.name,
			errorMessage: err.message,
			stack: err.stack,
		};
	}
	return { errorMessage: String(err) };
}

export const logger = {
	info(message: string, data?: Record<string, unknown>) {
		write("info", message, data);
	},
	warn(message: string, data?: Record<string, unknown>) {
		write("warn", message, data);
	},
	error(message: string, data?: Record<string, unknown>) {
		write("error", message, data);
	},
};
