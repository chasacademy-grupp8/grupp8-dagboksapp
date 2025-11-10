import { supabase } from "./client";
import { Entry, NewEntry, Tag } from "@/types/database.types";

/**
 * Fetch all entries for the authenticated user
 */
export async function getEntries(): Promise<Entry[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

async function upsertTagsForUser(tagNames: string[], userId: string): Promise<Tag[]> {
  const tags: Tag[] = [];

  for (const nameRaw of tagNames) {
    const name = nameRaw.trim();
    if (!name) continue;

    // check existing
    const { data: existing, error: selErr } = await supabase
      .from("tags")
      .select("*")
      .eq("user_id", userId)
      .eq("name", name)
      .maybeSingle();

    if (selErr) throw selErr;

    if (existing) {
      tags.push(existing as Tag);
      continue;
    }

    // insert new tag
    const { data: inserted, error: insErr } = await supabase
      .from("tags")
      .insert([{ user_id: userId, name }])
      .select()
      .single();

    if (insErr) throw insErr;

    tags.push(inserted as Tag);
  }

  return tags;
}


async function getTagsForEntry(entryId: string): Promise<Tag[]> {
  const { data: mappings, error: mapErr } = await supabase
    .from("entries_tags")
    .select("entry_id, tag_id");

  if (mapErr) throw mapErr;

  type Mapping = { entry_id: string; tag_id: string };

  // filter mappings for this entry
  const ids = (mappings as Mapping[] | null || [])
    .filter((m) => m.entry_id === entryId)
    .map((m) => m.tag_id);

  if (!ids.length) return [];

  const { data: tags, error: tagErr } = await supabase
    .from("tags")
    .select("*")
    .in("id", ids);

  if (tagErr) throw tagErr;

  return tags || [];
}

/**
 * Create a new entry for the authenticated user
 */
export async function createEntry(entry: NewEntry): Promise<Entry> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("entries")
    .insert([
      {
        user_id: user.id,
        title: `${entry.title}`,
        content: entry.content,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Create entry and attach tags (if provided).
 */
export async function createEntryWithTags(entry: NewEntry): Promise<Entry> {
  const created = await createEntry(entry);

  if (entry.tags && entry.tags.length) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const tags = await upsertTagsForUser(entry.tags, user.id);

    for (const t of tags) {
      // insert mapping if not exists
      const { data: existing, error: selErr } = await supabase
        .from("entries_tags")
        .select("*")
        .eq("entry_id", created.id)
        .eq("tag_id", t.id)
        .maybeSingle();

      if (selErr) throw selErr;

      if (!existing) {
        const { error: mapErr } = await supabase
          .from("entries_tags")
          .insert([{ entry_id: created.id, tag_id: t.id }]);
        if (mapErr) throw mapErr;
      }
    }
  }

  // attach tags to returned entry
  const tags = await getTagsForEntry(created.id);
  return { ...created, tags } as Entry;
}

/**
 * Delete an entry by ID for the authenticated user
 */
export async function deleteEntry(entryId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }
}

/**
 * Update an entry by ID for the authenticated user
 */
export async function updateEntry(
  entryId: string,
  updates: Partial<NewEntry>
): Promise<Entry> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("entries")
    .update(updates)
    .eq("id", entryId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Update entry and optionally its tags. If `updates.tags` is provided it will
 * replace existing tags for the entry.
 */
export async function updateEntryWithTags(
  entryId: string,
  updates: Partial<NewEntry & { tags?: string[] }>
): Promise<Entry> {
  const { tags: newTags, ...rest } = updates;

  const updated = await updateEntry(entryId, rest);

  if (newTags) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // remove existing mappings
    const { error: delErr } = await supabase
      .from("entries_tags")
      .delete()
      .eq("entry_id", entryId);
    if (delErr) throw delErr;

    // upsert tags and mappings
    const tags = await upsertTagsForUser(newTags, user.id);
    for (const t of tags) {
      const { error: mapErr } = await supabase
        .from("entries_tags")
        .insert([{ entry_id: entryId, tag_id: t.id }]);
      if (mapErr) throw mapErr;
    }
  }

  const tags = await getTagsForEntry(entryId);
  return { ...updated, tags } as Entry;
}

/**
 * Get a single entry by ID for the authenticated user
 */
export async function getEntryById(entryId: string): Promise<Entry> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("id", entryId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw error;
  }

  const tags = await getTagsForEntry(entryId);

  return { ...(data as Entry), tags } as Entry;
}
