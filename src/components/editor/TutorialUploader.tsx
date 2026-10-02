"use client";
import { useState, useRef } from "react";
import {
  Upload,
  Video,
  Mic,
  Sparkles,
  Loader2,
  CheckCircle2,
  FileVideo,
  X,
  Play,
  Info,
  ArrowRight,
} from "lucide-react";
import { useAIAssistant } from "@/components/ai/AIAssistantContext";

type UploadStep = "upload" | "processing" | "review" | "done";

interface TutorialUploaderProps {
  onComplete?: (notes: string) => void;
}

export default function TutorialUploader({ onComplete }: TutorialUploaderProps) {
  const [step, setStep] = useState<UploadStep>("upload");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [generatedNotes, setGeneratedNotes] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { openAssistant } = useAIAssistant();

  const simulateProcessing = async (uploadedFile?: File) => {
    const targetFile = uploadedFile ?? file;
    setStep("processing");
    for (let i = 0; i <= 100; i += 5) {
      await new Promise((r) => setTimeout(r, 150));
      setProgress(i);
    }
    // Detect file type and open AI assistant with context
    const isAudio = targetFile?.type.startsWith("audio/");
    openAssistant({
      type: isAudio ? "audio" : "video",
      fileName: targetFile?.name ?? "Uploaded file",
    });
    // Simulate AI generated notes
    setGeneratedNotes(`# ${file?.name?.replace(/\.[^.]+$/, "") || "Tutorial"} — Notes

## Introduction
In this tutorial, we explore the foundational concepts and practical implementation of this topic.

## Key Concepts

### 1. Setup & Installation
- Install required dependencies and tooling
- Configure the development environment
- Understand the core project architecture

### 2. Core Implementation
\`\`\`javascript
// Example code from tutorial
function example() {
  console.log("Hello, SikhoSikhao!");
}
\`\`\`

### 3. Advanced Features & Edge Cases
- Robust error handling strategies
- Performance optimization guidelines
- Community best practices

## Summary
Through this tutorial, you learned the key mental models and practical steps to build production-ready solutions.

## Practice Challenges
1. Implement the core logic inside your own test project
2. Review the official documentation to explore advanced API flags
3. Share your findings and questions with the community!

---
_AI-generated notes from your tutorial video._`);
    setStep("review");
  };

  const handleFile = (f: File) => {
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("video/")) {
      handleFile(f);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const steps = [
    { id: "upload", label: "Upload" },
    { id: "processing", label: "AI Processing" },
    { id: "review", label: "Review Notes" },
    { id: "done", label: "Done!" },
  ];
  const stepIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < stepIndex
                    ? "bg-green-500 text-white"
                    : i === stepIndex
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "bg-white/5 text-slate-500 border border-white/10"
                }`}
              >
                {i < stepIndex ? <CheckCircle2 size={12} /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  i === stepIndex ? "text-slate-200" : i < stepIndex ? "text-green-400" : "text-slate-600"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px w-8 sm:w-12 ${i < stepIndex ? "bg-green-500/50" : "bg-white/5"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Upload Step */}
      {step === "upload" && (
        <div className="space-y-4">
          {!file ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Upload size={28} className="text-purple-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-200 mb-1">
                Upload Your Tutorial Video
              </h3>
              <p className="text-sm text-slate-500 mb-3">
                Drag & drop or click to browse files
              </p>
              <div className="flex items-center justify-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1"><Video size={12} /> MP4, MOV, WebM</span>
                <span>·</span>
                <span>Max 500MB</span>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-5 border border-purple-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <FileVideo size={22} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-200 truncate">{file.name}</p>
                  <p className="text-sm text-slate-500">{formatFileSize(file.size)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge badge-green">Ready to process</span>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="flex gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
            <Info size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-400">
              <p className="font-medium text-slate-300 mb-0.5">How does AI Note Generation work?</p>
              <ul className="space-y-0.5 text-slate-500 text-xs">
                <li>• Transcribes audio and identifies key tech concepts</li>
                <li>• Automatically formats structured chapter notes</li>
                <li>• Extracts code snippets, diagrams, and headings</li>
                <li>• You can review and edit before publishing</li>
              </ul>
            </div>
          </div>

          {file && (
            <button
              onClick={() => simulateProcessing()}
              className="btn-primary w-full justify-center py-3"
            >
              <Sparkles size={16} />
              Generate Notes with AI
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}

      {/* Processing Step */}
      {step === "processing" && (
        <div className="text-center py-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
            <Sparkles size={36} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">AI is Processing Your Video...</h3>
          <p className="text-sm text-slate-400 mb-8">
            Analyzing audio and extracting topics. Please wait a moment!
          </p>
          <div className="max-w-xs mx-auto">
            <div className="progress-bar h-2">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-500">
                {progress < 30
                  ? "Transcribing audio..."
                  : progress < 60
                  ? "Identifying key topics..."
                  : progress < 85
                  ? "Generating chapter notes..."
                  : "Formatting code & markdown..."}
              </span>
              <span className="text-xs font-bold text-purple-400">{progress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Review Step */}
      {step === "review" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
            <CheckCircle2 size={16} className="text-green-400" />
            <p className="text-sm text-green-300 font-medium">
              Notes generated successfully! Review and edit them below.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-black/20 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-white/2">
              <Mic size={13} className="text-purple-400" />
              <span className="text-xs font-medium text-slate-300">AI Generated Notes</span>
              <span className="badge badge-purple text-[9px] ml-auto">AI</span>
            </div>
            <textarea
              value={generatedNotes}
              onChange={(e) => setGeneratedNotes(e.target.value)}
              className="w-full bg-transparent text-slate-300 text-sm p-4 resize-none outline-none h-72"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { onComplete?.(generatedNotes); setStep("done"); }}
              className="btn-primary flex-1 justify-center"
            >
              <CheckCircle2 size={15} />
              Accept Notes & Add to Chapter
            </button>
          </div>
        </div>
      )}

      {/* Done Step */}
      {step === "done" && (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} className="text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-100 mb-2">All Done! 🎉</h3>
          <p className="text-slate-400 text-sm">
            Notes have been generated from your tutorial and saved to your chapter.
          </p>
        </div>
      )}
    </div>
  );
}
