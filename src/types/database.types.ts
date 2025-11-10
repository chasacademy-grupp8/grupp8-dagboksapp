export interface Tag {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface Entry {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
  // tags will be populated when requested
  tags?: Tag[]
}

export interface NewEntry {
  title: string
  content: string
  // optional list of tag names to associate with the entry
  tags?: string[]
}
