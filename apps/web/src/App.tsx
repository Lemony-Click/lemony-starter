import { useState } from "react"
import { NoteList } from "@/components/note-list"
import { NoteForm } from "@/components/note-form"
import { TagManager } from "@/components/tag-manager"
import { Button } from "@workspace/ui/components/button"
import { trpc } from "@/lib/trpc"
import type { NoteStatus } from "@workspace/trpc/server"
import { PlusIcon, TagIcon, StickyNoteIcon } from "lucide-react"

type ActiveFilter = NoteStatus | "ALL"

export function App() {
  const [filter, setFilter] = useState<ActiveFilter>("ALL")
  const [showNewNote, setShowNewNote] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [showTagManager, setShowTagManager] = useState(false)

  const notesQuery = trpc.note.list.useQuery(
    { status: filter === "ALL" ? undefined : filter },
    { staleTime: 5_000 }
  )

  const FILTERS: { label: string; value: ActiveFilter }[] = [
    { label: "All", value: "ALL" },
    { label: "Draft", value: "DRAFT" },
    { label: "Published", value: "PUBLISHED" },
    { label: "Archived", value: "ARCHIVED" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNoteIcon className="size-5 text-primary" />
            <h1 className="text-lg font-semibold">Notes</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTagManager(true)}
            >
              <TagIcon />
              Tags
            </Button>
            <Button size="sm" onClick={() => setShowNewNote(true)}>
              <PlusIcon />
              New Note
            </Button>
          </div>
        </div>
      </header>

      {/* Filter bar */}
      <div className="border-b border-border px-6 py-3">
        <div className="mx-auto flex max-w-5xl gap-1">
          {FILTERS.map(({ label, value }) => (
            <button
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
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        {notesQuery.isLoading ? (
          <div className="text-center text-sm text-muted-foreground py-16">
            Loading…
          </div>
        ) : notesQuery.isError ? (
          <div className="text-center text-sm text-destructive py-16">
            Failed to load notes. Is the server running?
          </div>
        ) : (
          <NoteList
            notes={notesQuery.data ?? []}
            onEdit={(id) => setEditingNoteId(id)}
          />
        )}
      </main>

      {/* New note dialog */}
      {showNewNote && (
        <NoteForm
          onClose={() => setShowNewNote(false)}
          onSaved={() => {
            setShowNewNote(false)
          }}
        />
      )}

      {/* Edit note dialog */}
      {editingNoteId && (
        <NoteForm
          noteId={editingNoteId}
          onClose={() => setEditingNoteId(null)}
          onSaved={() => {
            setEditingNoteId(null)
          }}
        />
      )}

      {/* Tag manager dialog */}
      {showTagManager && <TagManager onClose={() => setShowTagManager(false)} />}
    </div>
  )
}

