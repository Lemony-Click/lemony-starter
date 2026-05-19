import { createFileRoute } from "@tanstack/react-router";
import type { NoteStatus } from "@workspace/trpc/server";
import { Button } from "@workspace/ui/components/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { NoteForm } from "@/components/note-form";
import { NoteList } from "@/components/note-list";
import { trpc } from "@/lib/trpc";

type ActiveFilter = NoteStatus | "ALL";

const FILTERS: { label: string; value: ActiveFilter }[] = [
	{ label: "All", value: "ALL" },
	{ label: "Draft", value: "DRAFT" },
	{ label: "Published", value: "PUBLISHED" },
	{ label: "Archived", value: "ARCHIVED" },
];

export const Route = createFileRoute("/")({
	component: NotesPage,
});

function NotesPage() {
	const [filter, setFilter] = useState<ActiveFilter>("ALL");
	const [showNewNote, setShowNewNote] = useState(false);
	const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

	const notesQuery = trpc.note.list.useQuery(
		{ status: filter === "ALL" ? undefined : filter },
		{ staleTime: 5_000 },
	);

	return (
		<>
			{/* Filter bar */}
			<div className="border-b border-border px-6 py-3">
				<div className="mx-auto flex max-w-5xl items-center justify-between">
					<div className="flex gap-1">
						{FILTERS.map(({ label, value }) => (
							<button
								type="button"
								key={value}
								onClick={() => setFilter(value)}
								className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
									filter === value
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:bg-muted hover:text-foreground"
								}`}
							>
								{label}
							</button>
						))}
					</div>
					<Button size="sm" onClick={() => setShowNewNote(true)}>
						<PlusIcon />
						New Note
					</Button>
				</div>
			</div>

			{/* Main content */}
			<main className="mx-auto max-w-5xl px-6 py-8">
				{notesQuery.isLoading ? (
					<div className="py-16 text-center text-sm text-muted-foreground">
						Loading…
					</div>
				) : notesQuery.isError ? (
					<div className="py-16 text-center text-sm text-destructive">
						Failed to load notes. Is the server running?
					</div>
				) : (
					<NoteList
						notes={notesQuery.data ?? []}
						onEdit={(id) => setEditingNoteId(id)}
					/>
				)}
			</main>

			{showNewNote && (
				<NoteForm
					onClose={() => setShowNewNote(false)}
					onSaved={() => setShowNewNote(false)}
				/>
			)}

			{editingNoteId && (
				<NoteForm
					noteId={editingNoteId}
					onClose={() => setEditingNoteId(null)}
					onSaved={() => setEditingNoteId(null)}
				/>
			)}
		</>
	);
}
