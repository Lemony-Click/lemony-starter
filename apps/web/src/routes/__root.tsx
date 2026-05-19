import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { StickyNoteIcon, TagIcon } from "lucide-react";

export const Route = createRootRoute({
	component: RootLayout,
});

function RootLayout() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<header className="border-b border-border px-6 py-4">
				<div className="mx-auto flex max-w-5xl items-center justify-between">
					<Link to="/" className="flex items-center gap-2">
						<StickyNoteIcon className="size-5 text-primary" />
						<h1 className="text-lg font-semibold">Notes</h1>
					</Link>
					<nav>
						<Link
							to="/tags"
							className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
						>
							<TagIcon className="size-4" />
							Tags
						</Link>
					</nav>
				</div>
			</header>
			<Outlet />
		</div>
	);
}
