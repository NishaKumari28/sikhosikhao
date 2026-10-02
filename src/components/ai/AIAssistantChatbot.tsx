"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles, X, Send, Mic, MicOff, Video, FileText, Loader2,
  Bot, User, RotateCcw, Copy, Check, Maximize2, Minimize2,
  Zap, Paperclip, Image as ImageIcon, FileX, File,
} from "lucide-react";
import { useAIAssistant } from "./AIAssistantContext";
import {
  callGemini, ChatMessage, generateMsgId, UploadedFile, generateDemoResponse,
} from "@/lib/aiAssistant";

// ─── Quick actions ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: FileText, label: "Summarise notes",      prompt: "Please summarise the content I've shared." },
  { icon: Video,    label: "Video script",          prompt: "Generate a structured video script outline for this topic." },
  { icon: Sparkles, label: "Chapter outline",       prompt: "Create a detailed chapter-by-chapter outline for a book on this topic." },
  { icon: Zap,      label: "Quiz questions",        prompt: "Create 5 quiz questions with answers based on this content." },
];

// ─── File helper: human-readable size ────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── File icon by type ────────────────────────────────────────────────────────
function FileTypeIcon({ type, className }: { type: string; className?: string }) {
  if (type.startsWith("image/")) return <ImageIcon size={14} className={className} />;
  if (type === "application/pdf") return <FileText size={14} className={className} />;
  return <File size={14} className={className} />;
}

// ─── Attachment chip (shown above input) ─────────────────────────────────────
function AttachmentChip({
  file,
  onRemove,
}: {
  file: UploadedFile;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-violet-600/15 border border-violet-500/25 w-full">
      {file.dataUrl && file.type.startsWith("image/") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={file.dataUrl} alt={file.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="w-8 h-8 rounded-lg bg-violet-600/30 flex items-center justify-center flex-shrink-0">
          <FileTypeIcon type={file.type} className="text-violet-300" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-slate-200 truncate">{file.name}</p>
        <p className="text-[10px] text-slate-500">{formatBytes(file.size)}</p>
      </div>
      <button
        onClick={onRemove}
        className="w-5 h-5 rounded-full flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all flex-shrink-0"
      >
        <FileX size={12} />
      </button>
    </div>
  );
}

// ─── Attached file preview in message bubble ─────────────────────────────────
function AttachmentPreview({ file }: { file: UploadedFile }) {
  return (
    <div className="mb-2 flex items-center gap-2 p-2 rounded-xl bg-black/20 border border-white/10">
      {file.dataUrl && file.type.startsWith("image/") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={file.dataUrl} alt={file.name} className="max-h-36 rounded-lg object-contain" />
      ) : (
        <>
          <div className="w-7 h-7 rounded-lg bg-violet-600/30 flex items-center justify-center flex-shrink-0">
            <FileTypeIcon type={file.type} className="text-violet-300" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-200 truncate">{file.name}</p>
            <p className="text-[10px] text-slate-500">{formatBytes(file.size)}</p>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Markdown renderer ────────────────────────────────────────────────────────
function renderMarkdownLight(text: string): string {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    // Tables (simple)
    .replace(/\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)+)/g, (_, head, body) => {
      const ths = head.split("|").filter(Boolean).map((c: string) =>
        `<th class="px-2 py-1 text-left text-[11px] font-semibold text-violet-300 border-b border-white/10">${c.trim()}</th>`
      ).join("");
      const rows = body.trim().split("\n").map((row: string) =>
        `<tr>${row.split("|").filter(Boolean).map((c: string) =>
          `<td class="px-2 py-1 text-[11px] text-slate-300 border-b border-white/5">${c.trim()}</td>`
        ).join("")}</tr>`
      ).join("");
      return `<table class="w-full text-left my-2 border-collapse"><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
    })
    // Code blocks
    .replace(/```(\w+)?\n?([\s\S]+?)```/g, (_, lang, code) =>
      `<pre class="my-2 p-3 bg-black/30 rounded-xl overflow-x-auto border border-white/10"><code class="text-[11px] text-violet-200 font-mono">${code.trim()}</code></pre>`
    )
    // Headings
    .replace(/^## (.+)$/gm, '<p class="font-bold text-violet-300 mt-3 mb-1 text-[11px] uppercase tracking-wider">$1</p>')
    .replace(/^### (.+)$/gm, '<p class="font-semibold text-slate-200 mt-2 mb-0.5 text-sm">$1</p>')
    .replace(/^# (.+)$/gm,  '<p class="font-bold text-white text-base mt-2 mb-1">$1</p>')
    // Bold & italic
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em class="text-slate-300">$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g,    '<code class="px-1.5 py-0.5 bg-white/10 rounded text-violet-300 text-[11px] font-mono">$1</code>')
    // Lists
    .replace(/^- (.+)$/gm, '<div class="flex items-start gap-2 my-0.5"><span class="text-violet-400 mt-1 text-[10px]">•</span><span>$1</span></div>')
    .replace(/^(\d+)\. (.+)$/gm, '<div class="flex items-start gap-2 my-0.5"><span class="text-violet-400 font-mono text-[10px] min-w-[16px]">$1.</span><span>$2</span></div>')
    // Blockquote
    .replace(/&gt; (.+)/g, '<div class="border-l-2 border-violet-500/50 pl-3 my-1 text-slate-400 italic text-xs">$1</div>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="border-white/10 my-2"/>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-cyan-400 underline hover:text-cyan-300">$1</a>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/\n/g, "<br/>");
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  if (msg.isLoading) {
    return (
      <div className="flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-1">
        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-violet-500/30">
          <Bot size={14} className="text-white" />
        </div>
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm bg-white/[0.06] border border-white/[0.08]">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
          <span className="text-xs text-slate-400">SikhoAI is thinking...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-1 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isUser
          ? "bg-violet-600/30 border border-violet-500/30"
          : "bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 shadow-lg shadow-violet-500/30"
      }`}>
        {isUser ? <User size={14} className="text-violet-300" /> : <Bot size={14} className="text-white" />}
      </div>

      <div className={`group max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-violet-600/25 border border-violet-500/30 rounded-tr-sm text-slate-200"
            : "bg-white/[0.06] border border-white/[0.08] rounded-tl-sm text-slate-200"
        }`}>
          {/* Show attached file inside bubble */}
          {msg.attachment && <AttachmentPreview file={msg.attachment} />}
          <div
            className="ai-message-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdownLight(msg.content) }}
          />
        </div>

        {!isUser && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(msg.content);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 ml-1"
          >
            {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        )}

        <span className="text-[10px] text-slate-600 px-1">
          {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

// ─── Speech Recognition type ──────────────────────────────────────────────────
type SRType = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string; isFinal?: boolean } }; length: number } }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

// ─── Main Chatbot ─────────────────────────────────────────────────────────────
export default function AIAssistantChatbot() {
  const { isOpen, context, closeAssistant } = useAIAssistant();

  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: generateMsgId(),
    role: "assistant",
    content: "👋 **Hello! I'm SikhoAI** — your intelligent assistant!\n\nI can answer **any question** — history, science, geography, coding, and more.\n\nYou can also:\n- 📎 **Upload** a PDF, image, or file\n- 🎤 **Speak** using the mic button\n- 📝 Ask me to summarise your notes\n\nTry asking: *\"What is the Taj Mahal?\"*",
    timestamp: new Date(),
  }]);

  const [input, setInput]               = useState("");
  const [interimText, setInterimText]   = useState(""); // live voice transcript
  const [isLoading, setIsLoading]       = useState(false);
  const [isExpanded, setIsExpanded]     = useState(false);
  const [isListening, setIsListening]   = useState(false);
  const [recognition, setRecognition]   = useState<SRType | null>(null);
  const [pendingFile, setPendingFile]   = useState<UploadedFile | null>(null);
  const [uploadError, setUploadError]   = useState("");

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const fileRef    = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Focus when opened
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 150); }, [isOpen]);

  // Context change greeting
  useEffect(() => {
    if (context.type !== "general") {
      const ctxMsg: ChatMessage = {
        id: generateMsgId(), role: "assistant", timestamp: new Date(),
        content:
          context.type === "video"
            ? `🎬 Video uploaded: **"${context.fileName}"**\nWhat would you like me to do — script, outline, or notes?`
            : context.type === "audio"
            ? `🎙️ Audio detected: **"${context.fileName}"**\nShall I create notes, a transcript outline, or quiz questions?`
            : context.contentPreview
            ? `📝 Notes loaded! Preview:\n> _"${context.contentPreview.slice(0, 120)}..."_\nHow can I help?`
            : "Content context updated! Ask me anything.",
      };
      setMessages((prev) => [...prev, ctxMsg]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.type, context.fileName]);

  // ── Speech Recognition setup ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SRCtor = (window as unknown as Record<string, unknown>).webkitSpeechRecognition
                ?? (window as unknown as Record<string, unknown>).SpeechRecognition;
    if (!SRCtor) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sr = new (SRCtor as any)() as SRType;
    sr.continuous     = true;   // keep listening until user stops
    sr.interimResults = true;   // show live transcript
    sr.lang           = "hi-IN,en-IN"; // Hindi + English

    sr.onresult = (e) => {
      let interim = "";
      let final   = "";
      for (let i = 0; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i][0].isFinal) final   += t + " ";
        else                           interim += t;
      }
      if (final) {
        setInput((prev) => (prev ? prev + " " + final.trim() : final.trim()));
      }
      setInterimText(interim.trim());
    };

    sr.onerror = (e) => {
      console.warn("Speech error:", e.error);
      setIsListening(false);
    };
    sr.onend = () => {
      setIsListening(false);
      // Commit any uncommitted interim transcript to input so nothing is lost
      setInterimText((cur) => {
        if (cur && cur.trim()) {
          setInput((prev) => (prev ? prev + " " + cur.trim() : cur.trim()));
        }
        return "";
      });
      setTimeout(() => inputRef.current?.focus(), 80);
    };

    setRecognition(sr);
  }, []);

  const toggleVoice = useCallback(() => {
    if (!recognition) {
      alert("Voice input is not supported in your browser. Please use Chrome or Edge.");
      return;
    }
    if (isListening) {
      try { recognition.stop(); } catch {}
      setIsListening(false);
      if (interimText.trim()) {
        setInput((prev) => (prev ? prev + " " + interimText.trim() : interimText.trim()));
        setInterimText("");
      }
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  }, [recognition, isListening, interimText]);

  // ── File Upload handler ───────────────────────────────────────────────────
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!e.target.files?.length) return;
    e.target.value = ""; // reset so same file can be re-selected
    setUploadError("");

    if (!file) return;
    const MAX = 20 * 1024 * 1024; // 20 MB
    if (file.size > MAX) {
      setUploadError(`File too large (max 20 MB). Your file: ${formatBytes(file.size)}`);
      return;
    }

    const uploaded: UploadedFile = { name: file.name, type: file.type, size: file.size };

    if (file.type.startsWith("image/")) {
      // Read as base64 for Gemini vision
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      uploaded.dataUrl = dataUrl;
    } else if (
      file.type === "text/plain" ||
      file.type === "text/markdown" ||
      file.name.endsWith(".md") ||
      file.name.endsWith(".txt") ||
      file.name.endsWith(".csv")
    ) {
      uploaded.textContent = await file.text();
    } else if (file.type === "application/pdf") {
      uploaded.textContent = `[Attached PDF document: ${file.name}. Please summarize or explain topics related to this document.]`;
    }

    setPendingFile(uploaded);
    inputRef.current?.focus();
  }, []);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text?: string) => {
    // Stop voice if listening
    if (isListening) {
      try { recognition?.stop(); } catch {}
      setIsListening(false);
    }

    const pendingVoice = interimText.trim();
    const computedText = text !== undefined
      ? text
      : (pendingVoice ? (input ? `${input} ${pendingVoice}` : pendingVoice) : input);
    const messageText = computedText.trim();
    const hasFile = !!pendingFile;

    setInterimText("");

    if (!messageText && !hasFile) return;
    if (isLoading) return;

    const displayText = messageText || (hasFile ? `[Uploaded: ${pendingFile!.name}]` : "");
    const fileToSend  = pendingFile;

    const userMsg: ChatMessage = {
      id: generateMsgId(), role: "user", content: displayText, timestamp: new Date(),
      attachment: fileToSend ?? undefined,
    };
    const loadingMsg: ChatMessage = {
      id: generateMsgId(), role: "assistant", content: "", timestamp: new Date(), isLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setPendingFile(null);
    setUploadError("");
    setIsLoading(true);

    try {
      const allMessages = [...messages, userMsg];
      const reply = await callGemini(allMessages, context, fileToSend);

      setMessages((prev) =>
        prev.filter((m) => !m.isLoading).concat({
          id: generateMsgId(), role: "assistant", content: reply, timestamp: new Date(),
        })
      );
    } catch {
      setMessages((prev) =>
        prev.filter((m) => !m.isLoading).concat({
          id: generateMsgId(), role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, interimText, isLoading, messages, context, pendingFile, isListening, recognition]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setPendingFile(null);
    setInput("");
    setInterimText("");
    setMessages([{
      id: generateMsgId(), role: "assistant",
      content: "Chat cleared! Ask me anything — any topic, any language! 🚀",
      timestamp: new Date(),
    }]);
  };

  if (!isOpen) return null;

  const chatWidth  = isExpanded ? "w-[520px]" : "w-[380px]";
  const chatHeight = isExpanded ? "h-[680px]" : "h-[540px]";

  // Combined value shown in textarea: committed input + live voice interim
  const displayValue = isListening && interimText
    ? (input ? `${input} ${interimText}` : interimText)
    : input;

  const hasContent = !!(input.trim() || interimText.trim() || pendingFile);
  const canSend = hasContent && !isLoading;

  return (
    <>
      {/* Mobile backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] md:hidden" onClick={closeAssistant} />

      {/* Chat window */}
      <div
        className={`fixed bottom-24 right-5 z-[999] ${chatWidth} ${chatHeight} flex flex-col rounded-3xl border border-white/10 shadow-2xl shadow-black/80 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`}
        style={{ background: "linear-gradient(135deg, rgba(10,12,22,0.97) 0%, rgba(15,12,28,0.97) 100%)", backdropFilter: "blur(24px)" }}
      >
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.08] bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-cyan-600/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/40">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0a0c16] animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-white font-heading">SikhoAI</p>
              <p className="text-[10px] text-emerald-400 font-medium">
                {isListening ? "🔴 Listening..." : "● Online & Ready"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {context.type !== "general" && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-[10px] text-violet-300 font-medium">
                {context.type === "video" ? <Video size={10} /> : <FileText size={10} />}
                {context.type}
              </div>
            )}
            <button onClick={clearChat} title="Clear chat" className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all">
              <RotateCcw size={13} />
            </button>
            <button onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "Shrink" : "Expand"} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all">
              {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
            <button onClick={closeAssistant} title="Close" className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ── Messages ─────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
          {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
          <div ref={bottomRef} />
        </div>

        {/* ── Quick Actions (shown when chat is fresh) ──────────────────────── */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2 flex-shrink-0">
            <p className="text-[10px] text-slate-600 mb-2 font-medium uppercase tracking-wider">Quick actions</p>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => sendMessage(action.prompt)}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-violet-600/15 border border-white/[0.06] hover:border-violet-500/30 text-left transition-all group disabled:opacity-50"
                >
                  <action.icon size={11} className="text-violet-400 flex-shrink-0" />
                  <span className="text-[11px] text-slate-400 group-hover:text-slate-200 truncate leading-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Input area ───────────────────────────────────────────────────── */}
        <div className="px-3 pb-3 pt-2 border-t border-white/[0.06] flex-shrink-0 space-y-2">

          {/* Upload error */}
          {uploadError && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
              <X size={11} className="flex-shrink-0" />
              {uploadError}
            </div>
          )}

          {/* Pending file chip */}
          {pendingFile && (
            <AttachmentChip file={pendingFile} onRemove={() => { setPendingFile(null); setUploadError(""); }} />
          )}

          {/* Voice status bar */}
          {isListening && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-600/15 border border-violet-500/30 animate-pulse">
              <div className="flex gap-0.5 items-center">
                <span className="w-1 h-3 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce [animation-delay:100ms]" />
                <span className="w-1 h-3 bg-violet-400 rounded-full animate-bounce [animation-delay:200ms]" />
              </div>
              <span className="text-[11px] text-violet-200 font-medium flex-1 truncate">
                {interimText ? `"${interimText}"` : input ? `"${input}"` : "Listening... speak now"}
              </span>
              {(interimText.trim() || input.trim()) && (
                <button
                  type="button"
                  onClick={() => sendMessage()}
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-md shadow-violet-500/30 transition-all cursor-pointer"
                  title="Send message now"
                >
                  <span>Send</span>
                  <span className="text-[9px] bg-white/20 px-1 py-0.5 rounded leading-none">↵</span>
                </button>
              )}
              <button
                type="button"
                onClick={toggleVoice}
                className="text-[10px] text-slate-400 hover:text-white font-medium px-1.5 py-0.5 rounded transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {/* Input row */}
          <div className={`flex items-end gap-1.5 rounded-2xl bg-white/[0.04] border transition-all p-2 ${
            isListening ? "border-violet-500/50 shadow-sm shadow-violet-500/20" : "border-white/[0.08] focus-within:border-violet-500/40"
          }`}>
            {/* File upload button */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              title="Attach file (PDF, image, text...)"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-violet-300 hover:bg-violet-500/10 transition-all flex-shrink-0"
            >
              <Paperclip size={14} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf,.txt,.md,.csv,.doc,.docx,.pptx,.xlsx"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Text input */}
            <textarea
              ref={inputRef}
              value={displayValue}
              onChange={(e) => { setInput(e.target.value); }}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening to voice..." : "Ask SikhoAI anything... (Enter to send)"}
              rows={1}
              disabled={isLoading}
              className={`flex-1 bg-transparent text-sm placeholder:text-slate-600 outline-none resize-none max-h-24 leading-relaxed px-1 py-0.5 disabled:opacity-50 ${
                isListening ? "text-violet-200 placeholder:text-violet-400/50" : "text-slate-200"
              }`}
              style={{ scrollbarWidth: "none" }}
            />

            {/* Voice button */}
            <button
              type="button"
              onClick={toggleVoice}
              title={isListening ? "Stop listening" : "Start voice input"}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                isListening
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/40 animate-pulse"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.06]"
              }`}
            >
              {isListening ? <MicOff size={14} /> : <Mic size={14} />}
            </button>

            {/* Send button */}
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={!canSend}
              title="Send message (Enter ↵)"
              className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-violet-500/50 hover:scale-105 active:scale-95 transition-all flex-shrink-0 cursor-pointer group"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-700">
            Enter to send · Shift+Enter new line · 📎 Upload PDF/Image · 🎤 Voice input
          </p>
        </div>
      </div>
    </>
  );
}
