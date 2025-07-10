import { supabase } from "./supabaseClient";

// PUBLIC_INTERFACE
export async function fetchNotes(search: string = "") {
  let query = supabase
    .from("notes")
    .select("*")
    .order("updated_at", { ascending: false });
  
  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// PUBLIC_INTERFACE
export async function fetchNoteById(id: string) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// PUBLIC_INTERFACE
export async function createNote(title: string = "", content: string = "") {
  const { data, error } = await supabase
    .from("notes")
    .insert([{ title, content }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// PUBLIC_INTERFACE
export async function updateNote(id: string, title: string, content: string) {
  const { data, error } = await supabase
    .from("notes")
    .update({ title, content, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// PUBLIC_INTERFACE
export async function deleteNote(id: string) {
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}
