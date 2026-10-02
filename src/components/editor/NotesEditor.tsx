"use client";
import { useState } from "react";
import {
  Bold,
  Italic,
  Code,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Link2,
  Eye,
  Edit3,
  Save,
  Loader2,
  Sparkles,
  Minus,
} from "lucide-react";
import { useAIAssistant } from "@/components/ai/AIAssistantContext";

interface NotesEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

type ViewMode = "write" | "preview" | "split";

export default function NotesEditor({
  initialContent = "",
  onSave,
  placeholder = "Start writing your notes here... \n\nMarkdown is supported!\n\n## Example Heading\n\nContent goes here...",
  readOnly = false,
}: NotesEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [viewMode, setViewMode] = useState<ViewMode>("write");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const { openAssistant } = useAIAssistant();

  const handleAIAssist = () => {
    openAssistant({
      type: "notes",
      contentPreview: content.slice(0, 1000),
    });
  };

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800)); // Simulate API call
    onSave(content);
    setIsSaving(false);
    const now = new Date();
    setLastSaved(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
  };

  const insertAtCursor = (before: string, after: string = "", newLine = false) => {
    const textarea = document.getElementById("notes-textarea") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const prefix = newLine && start > 0 && content[start - 1] !== "\n" ? "\n" : "";
    const newContent =
      content.substring(0, start) +
      prefix +
      before +
      selectedText +
      after +
      content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      const newCursor = start + prefix.length + before.length + selectedText.length;
      textarea.setSelectionRange(newCursor + after.length, newCursor + after.length);
    }, 0);
  };

  const toolbarActions = [
    { icon: Heading1, label: "H1", action: () => insertAtCursor("# ", "", true) },
    { icon: Heading2, label: "H2", action: () => insertAtCursor("## ", "", true) },
    { divider: true },
    { icon: Bold, label: "Bold", action: () => insertAtCursor("**", "**") },
    { icon: Italic, label: "Italic", action: () => insertAtCursor("*", "*") },
    { icon: Code, label: "Code", action: () => insertAtCursor("`", "`") },
    { divider: true },
    { icon: List, label: "Bullet List", action: () => insertAtCursor("- ", "", true) },
    { icon: ListOrdered, label: "Ordered List", action: () => insertAtCursor("1. ", "", true) },
    { icon: Quote, label: "Blockquote", action: () => insertAtCursor("> ", "", true) },
    { divider: true },
    { icon: Link2, label: "Link", action: () => insertAtCursor("[link text](", ")") },
    { icon: ImageIcon, label: "Image", action: () => insertAtCursor("![alt](", ")") },
    { icon: Minus, label: "Divider", action: () => insertAtCursor("\n---\n") },
  ];

  // Simple markdown to HTML renderer
  const renderMarkdown = (text: string): string => {
    return text
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-purple-400 hover:underline">$1</a>')
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="rounded-lg max-w-full my-4" />')
      .replace(/^---$/gm, "<hr class='border-white/10 my-6' />")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br />");
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-white/5 bg-[#16161f] overflow-hidden">
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5 flex-wrap">
          {/* Formatting buttons */}
          <div className="flex items-center gap-0.5">
            {toolbarActions.map((action, i) =>
              "divider" in action ? (
                <div key={i} className="w-px h-5 bg-white/10 mx-1" />
              ) : (
                <button
                  key={i}
                  onClick={action.action}
                  title={action.label}
                  className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all text-xs font-bold"
                >
                  {action.icon === Heading1 || action.icon === Heading2 ? (
                    <span className="text-[10px] font-bold">{action.label}</span>
                  ) : (
                    <action.icon size={13} />
                  )}
                </button>
              )
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* AI Assistant button */}
          <button
            onClick={handleAIAssist}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-400/40 transition-all"
          >
            <Sparkles size={12} />
            AI Assist
          </button>

          {/* View mode switcher */}
          <div className="flex items-center gap-0.5 rounded-lg bg-white/3 border border-white/5 p-0.5 ml-1">
            {(["write", "split", "preview"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all capitalize ${
                  viewMode === mode
                    ? "bg-purple-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {mode === "write" ? <Edit3 size={11} /> : mode === "preview" ? <Eye size={11} /> : <span>Split</span>}
              </button>
            ))}
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary text-xs px-3 py-1.5 ml-1"
          >
            {isSaving ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Save size={12} />
            )}
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      )}

      {/* Editor area */}
      <div className={`flex flex-1 overflow-hidden ${viewMode === "split" ? "divide-x divide-white/5" : ""}`}>
        {/* Write area */}
        {(viewMode === "write" || viewMode === "split") && (
          <textarea
            id="notes-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            readOnly={readOnly}
            className="flex-1 bg-transparent text-slate-300 text-sm leading-relaxed p-5 resize-none outline-none font-mono placeholder:text-slate-600"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px" }}
            spellCheck={false}
          />
        )}

        {/* Preview area */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div
            className="flex-1 p-5 overflow-y-auto prose-dark"
            dangerouslySetInnerHTML={{ __html: `<p>${renderMarkdown(content || "_Preview will appear here..._")}</p>` }}
          />
        )}
      </div>

      {/* Status bar */}
      {!readOnly && (
        <div className="flex items-center gap-3 px-4 py-2 border-t border-white/5 bg-black/10">
          <span className="text-[10px] text-slate-600">
            {content.length} chars · {content.split(/\s+/).filter(Boolean).length} words
          </span>
          {lastSaved && (
            <span className="text-[10px] text-green-500">✓ Saved at {lastSaved}</span>
          )}
          <span className="ml-auto text-[10px] text-slate-600">Markdown supported</span>
        </div>
      )}
    </div>
  );
}
