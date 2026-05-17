import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getQueryKey } from "@trpc/react-query"
import { trpc } from "@/lib/trpc"
import type { NoteStatus } from "@workspace/trpc/server"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog"

interface NoteFormProps {
  noteId?: string
  onClose: () => void
  onSaved: () => void
}

export function NoteForm({ noteId, onClose, onSaved }: NoteFormProps) {
  const isEditing = !!noteId

  const noteQuery = trpc.note.get.useQuery(
    { id: noteId! },
    { enabled: isEditing }
  )
  const tagsQuery = trpc.tag.list.useQuery()

  const queryClient = useQueryClient()

  const createNote = trpc.note.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getQueryKey(trpc.note.list) })
      onSaved()
    },
  })
  const updateNote = trpc.note.update.useMutation({
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: getQueryKey(trpc.note.list) })
      queryClient.invalidateQueries({
        queryKey: getQueryKey(trpc.note.get, { id: variables.id }, 'query'),
      })
      onSaved()
    },
  })

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [status, setStatus] = useState<NoteStatus>("DRAFT")
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  // Populate form when editing
  useEffect(() => {
    if (noteQuery.data) {
      setTitle(noteQuery.data.title)
      setContent(noteQuery.data.content)
      setStatus(noteQuery.data.status)
      setSelectedTagIds(noteQuery.data.tags.map((t) => t.tag.id))
    }
  }, [noteQuery.data])

  const isPending = createNote.isPending || updateNote.isPending
  const isLoading = isEditing && noteQuery.isLoading

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    if (isEditing) {
      updateNote.mutate({ id: noteId, title, content, status, tagIds: selectedTagIds })
    } else {
      createNote.mutate({ title, content, status, tagIds: selectedTagIds })
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Note" : "New Note"}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
                required
                maxLength={200}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write something…"
                rows={5}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(v) =>
                  setStatus(v as NoteStatus)
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tagsQuery.data && tagsQuery.data.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-1.5">
                  {tagsQuery.data.map((tag) => {
                    const selected = selectedTagIds.includes(tag.id)
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className="rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all"
                        style={{
                          borderColor: tag.color,
                          color: selected ? "#fff" : tag.color,
                          backgroundColor: selected ? tag.color : "transparent",
                        }}
                      >
                        {tag.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {(createNote.error || updateNote.error) && (
              <p className="text-sm text-destructive">
                {(createNote.error ?? updateNote.error)?.message}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !title.trim()}>
                {isPending ? "Saving…" : isEditing ? "Save Changes" : "Create Note"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
