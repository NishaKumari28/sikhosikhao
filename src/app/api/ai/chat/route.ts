import { NextRequest, NextResponse } from "next/server";

interface MessageItem {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestPayload {
  messages: MessageItem[];
  contextInfo?: {
    type?: "notes" | "video" | "audio" | "general";
    contentPreview?: string;
    fileName?: string;
  };
  attachedFile?: {
    name: string;
    type: string;
    textContent?: string;
    dataUrl?: string;
  } | null;
}

function buildSystemPrompt(ctx?: RequestPayload["contextInfo"]): string {
  const base = `You are SikhoAI — an expert, friendly AI coding and learning assistant embedded in SikhoSikhao (an interactive community learning platform).
You have deep, comprehensive knowledge across all topics: Computer Science, C, C++, Java, Python, JavaScript, TypeScript, DSA, Web Development, History, Science, Math, and General Knowledge.

Guidelines:
1. Provide clear, accurate, high-quality, and helpful answers for ANY question or command.
2. When answering programming or technical questions (like C programming, Python, algorithms, etc.), provide clean, well-commented code snippets, explanation of concepts, and practical use cases.
3. If the user writes in Hindi, Hinglish, or English, reply naturally in the same language.
4. Format responses cleanly in GitHub-flavored Markdown using bolding, lists, and syntax-highlighted code blocks (\`\`\`).
5. Be comprehensive yet structured and easy to read.`;

  if (ctx?.type === "notes" && ctx.contentPreview) {
    return `${base}\n\nContext from student's current notes:\n"""\n${ctx.contentPreview.slice(0, 1000)}\n"""`;
  }
  if (ctx?.type === "video" && ctx.fileName) {
    return `${base}\n\nContext: Student is studying chapter video: "${ctx.fileName}". Provide tailored explanations or video outlines.`;
  }
  return base;
}

export async function POST(req: NextRequest) {
  try {
    const payload: RequestPayload = await req.json();
    const { messages = [], contextInfo, attachedFile } = payload;

    const systemPrompt = buildSystemPrompt(contextInfo);

    // Filter valid recent history
    const history = messages
      .filter((m) => m.content && m.content.trim())
      .slice(-12);

    const geminiKey =
      process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // ──────────────────────────────────────────────────────────────────────────
    // 1. Try Google Gemini API if key is present
    // ──────────────────────────────────────────────────────────────────────────
    if (geminiKey && geminiKey.trim().length > 10) {
      try {
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey.trim()}`;

        const contents = history.map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        }));

        // Attach text file content if present
        if (attachedFile?.textContent && contents.length > 0) {
          const last = contents[contents.length - 1];
          if (last.role === "user") {
            last.parts.unshift({
              text: `[Attached File: ${attachedFile.name}]\n${attachedFile.textContent}\n\n`,
            });
          }
        }

        const res = await fetch(geminiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2000,
            },
          }),
          signal: AbortSignal.timeout(12000),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim()) {
            return NextResponse.json({ reply: text, source: "gemini" });
          }
        }
      } catch (geminiErr) {
        console.warn("[SikhoAI] Gemini attempt failed, falling back to public AI:", geminiErr);
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. Free Public AI Engine (Pollinations AI — Zero API Key Required)
    // ──────────────────────────────────────────────────────────────────────────
    try {
      const formattedMessages = [
        { role: "system", content: systemPrompt },
        ...history.map((m) => {
          let text = m.content;
          if (m.role === "user" && attachedFile?.textContent) {
            text = `[Attached File: ${attachedFile.name}]\n${attachedFile.textContent}\n\n${text}`;
          }
          return {
            role: m.role === "assistant" ? "assistant" : "user",
            content: text,
          };
        }),
      ];

      const pollinationsRes = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: formattedMessages,
          model: "openai",
          seed: 42,
        }),
        signal: AbortSignal.timeout(18000),
      });

      if (pollinationsRes.ok) {
        const text = await pollinationsRes.text();
        if (text && text.trim() && !text.includes("Service Unavailable")) {
          return NextResponse.json({ reply: text.trim(), source: "pollinations" });
        }
      }
    } catch (pollinationsErr) {
      console.warn("[SikhoAI] Pollinations attempt failed:", pollinationsErr);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. Fallback to smart offline responder (if network down or timeout)
    // ──────────────────────────────────────────────────────────────────────────
    return NextResponse.json({
      reply: null,
      fallbackRequired: true,
    });
  } catch (error) {
    console.error("[SikhoAI Route Error]:", error);
    return NextResponse.json({ reply: null, fallbackRequired: true }, { status: 500 });
  }
}
