import {
  component$,
  useTask$,
  useSignal,
  $,
  useStylesScoped$,
  type PropFunction,
} from "@builder.io/qwik";
import { fetchNotes } from "../lib/notesApi";
import styles from "./NotesSidebar.module.css?inline";

interface Note {
  id: string;
  title: string;
  updated_at: string;
}

export default component$(
  (props: {
    activeId?: string;
    onSelect$: PropFunction<(id: string) => void>;
    onAdd$: PropFunction<() => void>;
  }) => {
    useStylesScoped$(styles);
    const notes = useSignal<Note[]>([]);
    const loading = useSignal(false);
    const search = useSignal("");
    // Remove searchTimeout: instead, just use Qwik's reactivity.
    // Use a separate useSignal for debounced value.
    const debounced = useSignal(search.value);

    // Load all notes (optionally by search)
    const loadNotes = $(async (query = "") => {
      loading.value = true;
      try {
        notes.value = await fetchNotes(query);
      } catch (e) {
        notes.value = [];
      }
      loading.value = false;
    });

    // Debounce search value into debounced.value
    useTask$(({ track, cleanup }) => {
      track(() => search.value);
      const handler = setTimeout(() => {
        debounced.value = search.value;
      }, 300);
      cleanup(() => clearTimeout(handler));
    });

    // Fetch notes when debounced search changes
    useTask$(({ track }) => {
      track(() => debounced.value);
      loadNotes(debounced.value);
    });

    // Initial fetch (already covered by the above, but ensure on mount)
    useTask$(() => {
      loadNotes();
    });

    return (
      <aside class="sidebar">
        <header class="sidebar-header">
          <h2>Notes</h2>
          <button class="add-btn" onClick$={props.onAdd$}>+ Add</button>
        </header>
        <input
          class="search"
          type="text"
          placeholder="Search notes..."
          value={search.value}
          onInput$={$((e) => (search.value = (e.target as HTMLInputElement).value))}
        />
        <nav class="notes-list">
          {loading.value ? (
            <div class="sideloading">Loading...</div>
          ) : (
            notes.value.length > 0 ? (
              notes.value.map(note => (
                <div
                  key={note.id}
                  class={{
                    "note-nav-item": true,
                    active: props.activeId === note.id,
                  }}
                  onClick$={() => props.onSelect$(note.id)}
                >
                  <div class="title">
                    {note.title || <em>(No title)</em>}
                  </div>
                  <div class="date">
                    {new Date(note.updated_at).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div class="notes-empty">No notes found.</div>
            )
          )}
        </nav>
      </aside>
    );
  }
);
