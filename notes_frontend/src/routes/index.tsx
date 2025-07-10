import { component$, useSignal, useStylesScoped$, $ } from "@builder.io/qwik";
import NotesSidebar from "../components/NotesSidebar";
import NoteEditor from "../components/NoteEditor";
import styles from "./notes/notes.module.css?inline";

// Top-level Notes App page
export default component$(() => {
  useStylesScoped$(styles);
  const activeId = useSignal<string | undefined>(undefined);
  const sidebarKey = useSignal(Math.random());
  const creating = useSignal(false);

  // Handlers as serializable Qwik functions
  const handleSelect = $((id: string) => {
    activeId.value = id;
    creating.value = false;
  });
  const handleAdd = $(() => {
    activeId.value = undefined;
    creating.value = true;
  });
  const handleSave = $(() => {
    sidebarKey.value = Math.random(); // force sidebar reload
    creating.value = false;
  });
  const handleDelete = $(() => {
    sidebarKey.value = Math.random();
    creating.value = false;
    activeId.value = undefined;
  });

  return (
    <div class="notes-app">
      <div class="sidebar-container">
        <NotesSidebar
          key={sidebarKey.value}
          activeId={activeId.value}
          onSelect$={handleSelect}
          onAdd$={handleAdd}
        />
      </div>
      <div class="editor-container">
        <NoteEditor
          noteId={activeId.value}
          onSave$={handleSave}
          onDelete$={handleDelete}
          onCancel$={$(() => (creating.value = false))}
          creating={creating.value}
        />
      </div>
    </div>
  );
});
