import {
  component$,
  useSignal,
  useTask$,
  $,
  useStylesScoped$,
  type PropFunction,
} from "@builder.io/qwik";
import {
  fetchNoteById,
  createNote,
  updateNote,
  deleteNote,
} from "../lib/notesApi";
import styles from "./NoteEditor.module.css?inline";

interface Note {
  id?: string;
  title: string;
  content: string;
  updated_at?: string;
}

export default component$(
  (props: {
    noteId?: string;
    onSave$?: PropFunction<(note: Note) => void>;
    onDelete$?: PropFunction<(id: string) => void>;
    onCancel$?: PropFunction<() => void>;
    creating?: boolean;
  }) => {
    useStylesScoped$(styles);

    const note = useSignal<Note | null>(props.creating ? { title: "", content: "" } : null);
    const loading = useSignal(false);
    const saving = useSignal(false);
    const deleting = useSignal(false);
    const errorMsg = useSignal<string | null>(null);

    // Load note on change
    useTask$(async ({ track }) => {
      track(() => props.noteId);
      if (props.noteId && !props.creating) {
        loading.value = true;
        try {
          note.value = await fetchNoteById(props.noteId);
        } catch (e: any) {
          note.value = null;
          errorMsg.value = e.message;
        } finally {
          loading.value = false;
        }
      }
      if (!props.noteId && !props.creating) {
        note.value = null;
      }
    });

    const handleSave = $(async () => {
      if (!note.value) return;
      saving.value = true;
      errorMsg.value = null;
      try {
        if (props.creating) {
          const created = await createNote(note.value.title, note.value.content);
          note.value = created;
          props.onSave$ && props.onSave$(created);
        } else if (props.noteId && note.value) {
          const updated = await updateNote(props.noteId, note.value.title, note.value.content);
          note.value = updated;
          props.onSave$ && props.onSave$(updated);
        }
      } catch (e: any) {
        errorMsg.value = e.message;
      }
      saving.value = false;
    });

    const handleDelete = $(async () => {
      if (!props.noteId || props.creating) return;
      deleting.value = true;
      errorMsg.value = null;
      try {
        await deleteNote(props.noteId);
        props.onDelete$ && props.onDelete$(props.noteId);
        note.value = null;
      } catch (e: any) {
        errorMsg.value = e.message;
      }
      deleting.value = false;
    });

    if (loading.value) {
      return (
        <section class="noteview">
          <div class="noteloading">Loading note...</div>
        </section>
      );
    }

    if (props.creating && note.value) {
      // New note creation mode
      return (
        <section class="noteview">
          <form
            preventdefault:submit
            class="noteform"
            onSubmit$={handleSave}
          >
            <input
              type="text"
              class="title"
              placeholder="Note title"
              value={note.value.title}
              required
              onInput$={e => (note.value!.title = (e.target as HTMLInputElement).value)}
            />
            <textarea
              class="content"
              placeholder="Write your note..."
              rows={13}
              value={note.value.content}
              required
              onInput$={e => (note.value!.content = (e.target as HTMLTextAreaElement).value)}
            />
            {errorMsg.value && (
              <div class="error">{errorMsg.value}</div>
            )}
            <div class="actions">
              <button type="submit" class="primary" disabled={saving.value}>
                {saving.value ? "Saving..." : "Save"}
              </button>
              <button
                class="secondary"
                type="button"
                disabled={saving.value}
                onClick$={props.onCancel$}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      );
    }

    if (!note.value) {
      return (
        <section class="noteview noteview-empty">
          <div>Select or create a note to get started.</div>
        </section>
      );
    }

    return (
      <section class="noteview">
        <form
          preventdefault:submit
          class="noteform"
          onSubmit$={handleSave}
        >
          <input
            type="text"
            class="title"
            placeholder="Note title"
            value={note.value.title}
            required
            onInput$={e => (note.value!.title = (e.target as HTMLInputElement).value)}
          />
          <textarea
            class="content"
            placeholder="Write your note..."
            rows={13}
            value={note.value.content}
            required
            onInput$={e => (note.value!.content = (e.target as HTMLTextAreaElement).value)}
          />
          <div class="dateinfo">
            Last edited: {note.value.updated_at ? (new Date(note.value.updated_at)).toLocaleString() : "now"}
          </div>
          {errorMsg.value && (
            <div class="error">{errorMsg.value}</div>
          )}
          <div class="actions">
            <button type="submit" class="primary" disabled={saving.value}>
              {saving.value ? "Saving..." : "Save"}
            </button>
            <button
              class="danger"
              type="button"
              disabled={deleting.value || saving.value}
              onClick$={handleDelete}
            >
              {deleting.value ? "Deleting..." : "Delete"}
            </button>
          </div>
        </form>
      </section>
    );
  }
);
