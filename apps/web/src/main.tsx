import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { httpBatchLink } from "@trpc/client";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";

import "@workspace/ui/globals.css";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { trpc } from "@/lib/trpc.ts";
import { App } from "./App.tsx";

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000";

function Root() {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000, // 1 minute — override per-query as needed
						retry: 1,
					},
				},
			}),
	);
	const [trpcClient] = useState(() =>
		trpc.createClient({ links: [httpBatchLink({ url: SERVER_URL })] }),
	);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider>
					<App />
				</ThemeProvider>
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</trpc.Provider>
	);
}

// biome-ignore lint/style/noNonNullAssertion: root element is guaranteed to exist in index.html
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Root />
	</StrictMode>,
);
