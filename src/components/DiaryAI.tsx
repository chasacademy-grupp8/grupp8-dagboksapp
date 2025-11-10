"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DiaryAI() {
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setReply("");

    try {
      // 1️⃣ Get the current logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setReply("You must be logged in to analyze your diary.");
        setLoading(false);
        return;
      }

      // 2️⃣ Send user ID to API route
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();
      setReply(data.reply || "No response from AI.");
    } catch (err) {
      console.error(err);
      setReply("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <button
        onClick={analyze}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        {loading ? "Thinking..." : "Reflect on My Diary"}
      </button>

      {reply && (
        <div className="p-4 border rounded-md bg-gray-50 text-gray-800 whitespace-pre-line">
          {reply}
        </div>
      )}
    </div>
  );
}
