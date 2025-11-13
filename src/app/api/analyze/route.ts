import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(request: Request) {
  try {
    // Validera att miljövariabler är satta vid runtime
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return Response.json(
        { error: "Supabase service role key not configured" },
        { status: 500 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const { userId } = await request.json();
    if (!userId)
      return Response.json({ error: "Missing user ID" }, { status: 400 });

    // 1️⃣ Get user's recent entries
    const { data: entries, error } = await supabase
      .from("entries")
      .select("content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) throw error;

    const allText = entries?.map((e) => e.content).join("\n\n") || "";

    if (!allText)
      return Response.json(
        { reply: "No diary entries found." },
        { status: 200 }
      );

    // 2️⃣ Ask OpenAI for reflection
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an AI that writes warm, thoughtful reflections based on a user's recent diary entries.",
          },
          { role: "user", content: allText },
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return Response.json(
        {
          error: `OpenAI API error: ${
            errorData?.error?.message || "Unknown error"
          }`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content ?? "No AI response.";

    return Response.json({ reply });
  } catch (err) {
    console.error("API error:", err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}
