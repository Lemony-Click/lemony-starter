import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getQueryKey } from "@trpc/react-query";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { ArrowLeftIcon, PlusIcon, TagIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

const PRESET_COLORS = [
	"#6366f1",
	"#ec4899",
	"#f59e0b",
	"#10b981",
	"#3b82f6",
	"#ef4444",
	"#8b5cf6",
	"#14b8a6",
];

export const Route = createFileRoute("/tags")({
	component: TagsPage,
});

function TagsPage() {
	const queryClient = useQueryClient();
	const tagsQuery = trpc.tag.list.useQuery();
	const createTag = trpc.tag.create.useMutation({
		onSuccess: () => {
			setName("");
			queryClient.invalidateQueries({ queryKey: getQueryKey(trpc.tag.list) });
		},
	});
	const deleteTag = trpc.tag.delete.useMutation({
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: getQueryKey(trpc.tag.list) }),
	});

	const [name, setName] = useState("");
	const [color, setColor] = useState(PRESET_COLORS[0]);

	function handleCreate(e: React.FormEvent) {
		e.preventDefault();
		if (!name.trim()) return;
		createTag.mutate({ name: name.trim(), color: color ?? PRESET_COLORS[0] });
	}

	return (
		<main className="mx-auto max-w-5xl px-6 py-8">
			<div className="mb-6">
				<Link
					to="/"
					className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeftIcon className="size-4" />
					Back to Notes
				</Link>
			</div>

			<div className="mb-6 flex items-center gap-2">
				<TagIcon className="size-5 text-primary" />
				<h2 className="text-xl font-semibold">Manage Tags</h2>
			</div>

			{/* Create form */}
			<form
				onSubmit={handleCreate}
				className="mb-8 flex flex-col gap-3 rounded-lg border border-border p-4"
			>
				<div className="flex flex-col gap-1.5">
					<Label htmlFor="tag-name">New tag</Label>
					<Input
						id="tag-name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Tag name"
						maxLength={50}
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label>Color</Label>
					<div className="flex flex-wrap gap-2">
						{PRESET_COLORS.map((c) => (
							<button
								key={c}
								type="button"
								onClick={() => setColor(c)}
								className="size-6 rounded-full transition-transform hover:scale-110"
								style={{
									backgroundColor: c,
									outline: color === c ? `2px solid ${c}` : undefined,
									outlineOffset: color === c ? "2px" : undefined,
								}}
								aria-label={`Select color ${c}`}
							/>
						))}
					</div>
				</div>
				{createTag.error && (
					<p className="text-sm text-destructive">{createTag.error.message}</p>
				)}
				<Button
					type="submit"
					size="sm"
					disabled={!name.trim() || createTag.isPending}
				>
					<PlusIcon />
					{createTag.isPending ? "Adding…" : "Add Tag"}
				</Button>
			</form>

			{/* Tag list */}
			<div className="flex flex-col gap-2">
				{tagsQuery.isLoading ? (
					<p className="text-sm text-muted-foreground">Loading…</p>
				) : tagsQuery.data?.length === 0 ? (
					<p className="text-sm text-muted-foreground">No tags yet.</p>
				) : (
					tagsQuery.data?.map((tag) => (
						<div
							key={tag.id}
							className="flex items-center justify-between rounded-md border border-border px-3 py-2"
						>
							<div className="flex items-center gap-2">
								<span
									className="size-3 rounded-full"
									style={{ backgroundColor: tag.color }}
								/>
								<span className="text-sm font-medium">{tag.name}</span>
								<span className="text-xs text-muted-foreground">
									{tag._count.notes} {tag._count.notes === 1 ? "note" : "notes"}
								</span>
							</div>
							<Button
								variant="ghost"
								size="icon-xs"
								className="text-muted-foreground hover:text-destructive"
								onClick={() => {
									if (
										tag._count.notes === 0 ||
										confirm(
											`"${tag.name}" is used by ${tag._count.notes} note(s). Delete anyway?`,
										)
									) {
										deleteTag.mutate({ id: tag.id });
									}
								}}
								aria-label={`Delete tag ${tag.name}`}
							>
								<Trash2Icon />
							</Button>
						</div>
					))
				)}
			</div>
		</main>
	);
}
