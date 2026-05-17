import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import type { NoteStatus } from "@workspace/trpc/server";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { EditIcon, FileTextIcon, Trash2Icon } from "lucide-react";
import { trpc } from "@/lib/trpc";

type Note = {
	id: string;
	title: string;
	content: string;
	status: NoteStatus;
	createdAt: Date | string;
	tags: { tag: { id: string; name: string; color: string } }[];
};

const STATUS_STYLES: Record<NoteStatus, string> = {
	DRAFT: "bg-muted text-muted-foreground",
	PUBLISHED:
		"bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	ARCHIVED:
		"bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

interface NoteListProps {
	notes: Note[];
	onEdit: (id: string) => void;
}

export function NoteList({ notes, onEdit }: NoteListProps) {
	const queryClient = useQueryClient();
	const deleteNote = trpc.note.delete.useMutation({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: getQueryKey(trpc.note.list) });
		},
	});

	if (notes.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
				<FileTextIcon className="size-10 opacity-30" />
				<p className="text-sm">No notes yet. Create one to get started.</p>
			</div>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{notes.map((note) => (
				<Card key={note.id} className="flex flex-col">
					<CardHeader className="pb-2">
						<div className="flex items-start justify-between gap-2">
							<CardTitle className="line-clamp-2 text-base leading-snug">
								{note.title}
							</CardTitle>
							<span
								className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[note.status]}`}
							>
								{note.status.charAt(0) + note.status.slice(1).toLowerCase()}
							</span>
						</div>
					</CardHeader>
					<CardContent className="flex flex-1 flex-col gap-3">
						{note.content && (
							<p className="line-clamp-3 text-sm text-muted-foreground">
								{note.content}
							</p>
						)}

						{note.tags.length > 0 && (
							<div className="flex flex-wrap gap-1.5">
								{note.tags.map(({ tag }) => (
									<Badge
										key={tag.id}
										variant="outline"
										className="text-xs"
										style={{ borderColor: tag.color, color: tag.color }}
									>
										{tag.name}
									</Badge>
								))}
							</div>
						)}

						<div className="mt-auto flex items-center justify-between pt-2">
							<span className="text-xs text-muted-foreground">
								{new Date(note.createdAt).toLocaleDateString()}
							</span>
							<div className="flex gap-1">
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={() => onEdit(note.id)}
									aria-label="Edit note"
								>
									<EditIcon />
								</Button>
								<Button
									variant="ghost"
									size="icon-sm"
									className="text-destructive hover:text-destructive"
									onClick={() => {
										if (confirm("Delete this note?")) {
											deleteNote.mutate({ id: note.id });
										}
									}}
									aria-label="Delete note"
								>
									<Trash2Icon />
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
