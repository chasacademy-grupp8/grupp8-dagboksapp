"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { updateEntry, getEntryById } from "@/lib/supabase/queries";
import { getCurrentUser } from "@/lib/supabase/auth";

export default function EditEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entryId = searchParams.get("id");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function loadEntry() {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }

      if (!entryId) {
        setError("No entry ID provided");
        setInitialLoading(false);
        return;
      }

      try {
        const entry = await getEntryById(entryId);
        setTitle(entry.title);
        setContent(entry.content);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load entry");
      } finally {
        setInitialLoading(false);
      }
    }

    loadEntry();
  }, [router, entryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    if (!entryId) {
      setError("No entry ID provided");
      return;
    }

    setLoading(true);

    try {
      await updateEntry(entryId, { title, content });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update entry");
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-3xl mx-auto px-6 py-12">
          <p className="text-warm-gray text-center">Loading entry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-warm-gray hover:text-dark-brown text-sm mb-4"
          >
            ← Back to entries
          </button>
          <h1 className="text-4xl font-serif text-dark-brown mb-2">
            Edit Entry
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm mb-2 text-dark-brown font-medium"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field text-xl font-serif"
              placeholder="Give your entry a title..."
              required
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm mb-2 text-dark-brown font-medium"
            >
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input-field min-h-[400px] resize-y leading-relaxed"
              placeholder="Write your thoughts..."
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-sm text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Update Entry"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
