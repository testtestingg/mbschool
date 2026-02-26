// supabase/functions/gemini/index.ts
serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const { message, grade } = await req.json();

    const apiKey = Deno.env.get("GEMINI_API_KEY"); // set via supabase secrets
    if (!apiKey) return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY" }), { status: 500 });

    const system =
      grade === "ابتدائي" ? "قدّم تلميحات قصيرة وواضحة لتلاميذ الابتدائي."
      : grade === "إعدادي" ? "اشرح بخطوات أساسية مبسطة لمرحلة الإعدادي."
      : grade === "ثانوي" ? "استخدم مصطلحات دقيقة (مثلثات/جبر) مع خطوات واضحة."
      : "قدّم مساعدة رياضية متقدمة تدريجية قبل الحل النهائي.";

    // Gemini API: generateContent endpoint (free-tier via AI Studio)
    // Docs/quickstart: https://ai.google.dev/gemini-api/docs/quickstart
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: `${system}\n\nسؤال/طلب المتعلّم:\n${message}` }
              ],
            },
          ],
        }),
      }
    );

    if (!r.ok) {
      const err = await r.text();
      console.error("Gemini error:", err);
      return new Response(JSON.stringify({ error: "Gemini API failed" }), { status: 500 });
    }

    const data = await r.json();
    // extract text safely (handles candidates/parts)
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ??
      "عذرًا، لم أتمكن من توليد رد.";
    return new Response(JSON.stringify({ text }), { headers: { "content-type": "application/json" } });
  } catch (e) {
    console.error("Function error:", e);
    return new Response(JSON.stringify({ error: "Bad request" }), { status: 400 });
  }
});