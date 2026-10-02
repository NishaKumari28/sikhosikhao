"use client";

// ────────────────────────────────────────────────────────────────────────────
//  AI Assistant — Intelligent Chatbot for SikhoSikhao
//  Multi-engine AI with Gemini + Free Public LLM (Pollinations AI) + Rich Offline Base
// ────────────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  context?: "notes" | "video" | "audio" | "general";
  attachment?: UploadedFile;
}

export interface AIContext {
  type: "notes" | "video" | "audio" | "general";
  contentPreview?: string;
  fileName?: string;
}

export interface UploadedFile {
  name: string;
  type: string;       // MIME type
  size: number;
  dataUrl?: string;   // base64 for images
  textContent?: string; // extracted text for PDFs/text files
}

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "";
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ────────────────────────────────────────────────────────────────────────────
//  Main AI Dispatcher: Server Route -> Free Public AI -> Local Smart Engine
// ────────────────────────────────────────────────────────────────────────────

export async function callGemini(
  messages: ChatMessage[],
  contextInfo: AIContext,
  attachedFile?: UploadedFile | null
): Promise<string> {
  const systemPrompt = buildSystemPrompt(contextInfo);

  // 1. Try our internal server route /api/ai/chat (handles Gemini + Server-side AI)
  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        contextInfo,
        attachedFile,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.reply && typeof data.reply === "string" && data.reply.trim().length > 0) {
        return data.reply.trim();
      }
    }
  } catch (apiErr) {
    console.warn("[SikhoAI] /api/ai/chat route timed out or unavailable, trying direct client AI...", apiErr);
  }

  // 2. Direct client-side Gemini if key is provided in client env
  if (GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 10) {
    try {
      const history = messages
        .filter((m) => m.role !== "system" && !m.isLoading)
        .slice(-12)
        .map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: buildParts(m.content, m.attachment),
        }));

      if (attachedFile && history.length > 0) {
        const last = history[history.length - 1];
        if (last.role === "user") {
          last.parts = buildParts(
            messages.find((m) => m.role === "user")?.content ?? "",
            attachedFile
          );
        }
      }

      const body = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: history,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1800,
        },
      };

      const res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(12000),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) return text.trim();
      }
    } catch (e) {
      console.warn("[SikhoAI] Client Gemini call failed:", e);
    }
  }

  // 3. Direct Client-side Free Public LLM (Pollinations AI)
  try {
    const history = messages
      .filter((m) => m.role !== "system" && !m.isLoading && m.content)
      .slice(-10);

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    ];

    const pollinationsRes = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: formattedMessages,
        model: "openai",
        seed: Math.floor(Math.random() * 1000),
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (pollinationsRes.ok) {
      const text = await pollinationsRes.text();
      if (text && text.trim() && !text.includes("Service Unavailable")) {
        return text.trim();
      }
    }
  } catch (pollErr) {
    console.warn("[SikhoAI] Direct Pollinations call timed out, falling back to smart engine:", pollErr);
  }

  // 4. Smart Offline Educational Engine (Guaranteed zero failure)
  return generateDemoResponse(messages, contextInfo);
}

// ────────────────────────────────────────────────────────────────────────────
//  Build Gemini message parts
// ────────────────────────────────────────────────────────────────────────────

function buildParts(
  text: string,
  file?: UploadedFile | null
): Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> {
  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

  if (file) {
    if (file.dataUrl && file.type.startsWith("image/")) {
      const base64Data = file.dataUrl.split(",")[1] ?? "";
      parts.push({ inlineData: { mimeType: file.type, data: base64Data } });
      parts.push({ text: text || "Describe or analyse this image." });
    } else if (file.textContent) {
      parts.push({ text: `[File: ${file.name}]\n\n${file.textContent}\n\n${text}` });
    } else {
      parts.push({ text: `[File uploaded: ${file.name} (${file.type})]\n\n${text}` });
    }
  } else {
    parts.push({ text });
  }

  return parts;
}

// ────────────────────────────────────────────────────────────────────────────
//  System prompt builder
// ────────────────────────────────────────────────────────────────────────────

function buildSystemPrompt(ctx: AIContext): string {
  const base = `You are SikhoAI — an expert, friendly AI assistant embedded in SikhoSikhao (an interactive community learning platform).
You have extensive, accurate knowledge across ALL subjects: C programming, C++, Java, Python, DSA, Web Development, History, Science, Math, and General Knowledge.

Core Rules:
1. Always provide accurate, factual, and complete answers.
2. For coding and technical queries, explain concepts thoroughly with clean, working code examples and best practices.
3. If the user writes in Hindi or Hinglish, respond naturally in Hindi/Hinglish.
4. Format all responses using GitHub-flavored Markdown with bold text, bullet points, headers (##, ###), and code blocks (\`\`\`).
5. Be comprehensive, educational, and encouraging.`;

  if (ctx.type === "notes" && ctx.contentPreview) {
    return `${base}\n\nThe user has shared notes/content:\n---\n${ctx.contentPreview.slice(0, 800)}\n---`;
  }
  if (ctx.type === "video" && ctx.fileName) {
    return `${base}\n\nThe user has uploaded a video lecture: "${ctx.fileName}". Provide tailored explanations, outlines, or summaries.`;
  }
  return base;
}

// ────────────────────────────────────────────────────────────────────────────
//  Comprehensive Educational Knowledge Base (Offline & High-Speed Cache)
// ────────────────────────────────────────────────────────────────────────────

const KNOWLEDGE_BASE: Array<{ keywords: string[]; answer: string }> = [
  // ─── C Programming ───────────────────────────────────────────────────────
  {
    keywords: ["c programming", "c language", "what is c", "learn c", "c code", "about c"],
    answer: `## 💻 C Programming Language

**C** is a powerful, general-purpose, procedural programming language developed in **1972 by Dennis Ritchie** at Bell Laboratories. It is known as the **"Mother of all programming languages"** because modern languages like C++, Java, Python, and C# borrow their syntax and core paradigms from C.

---

### 🌟 Key Features of C:
1. **Low-Level Memory Access:** Direct manipulation of computer hardware and memory using **Pointers** (\`*\` and \`&\`).
2. **Speed & Efficiency:** Since C is compiled directly into machine code (no interpreter or heavy runtime), it offers blistering performance.
3. **Portability:** Code written in C can be compiled and executed on nearly any hardware architecture with standard compilers (like GCC or Clang).
4. **Structured Language:** Supports functions, modular coding, custom data structures (\`struct\`), and unions.

---

### 📝 Complete "Hello World" in C:
\`\`\`c
#include <stdio.h>

int main() {
    // printf prints formatted text to the standard console
    printf("Hello, SikhoSikhao Learner! Welcome to C.\\n");
    return 0; // Indicates successful execution to the operating system
}
\`\`\`

---

### 🚀 Practical Example: Working with Variables & Input
\`\`\`c
#include <stdio.h>

int main() {
    int age;
    printf("Enter your age: ");
    scanf("%d", &age); // & passes memory address to scanf

    if (age >= 18) {
        printf("You are eligible for higher technical studies!\\n");
    } else {
        printf("Keep learning and building foundations!\\n");
    }

    return 0;
}
\`\`\`

---

### 🛠️ Common Applications of C:
- **Operating Systems:** The core kernels of Linux, macOS, and Windows are written predominantly in C.
- **Embedded Systems & IoT:** Microcontrollers (Arduino, ESP32, automotive ECUs).
- **Game Engines & Compilers:** Low-level graphics engines and database engines (e.g. SQLite, MySQL, PostgreSQL).`,
  },

  // ─── C++ Programming ─────────────────────────────────────────────────────
  {
    keywords: ["c++", "cpp", "what is c++"],
    answer: `## ⚡ C++ Programming Language

**C++** is a high-performance language created by **Bjarne Stroustrup** in 1979 as an extension of C ("C with Classes"). It brings **Object-Oriented Programming (OOP)**, Generic Programming with Templates, and modern standard libraries (STL) to the raw speed of C.

### 🌟 Core Paradigms:
- **Classes & Objects:** Encapsulating data and functions.
- **Inheritance & Polymorphism:** Code reusability and dynamic dispatch.
- **Standard Template Library (STL):** Ready-to-use data structures (\`vector\`, \`map\`, \`set\`, \`queue\`).

\`\`\`cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<std::string> subjects = {"C++", "DSA", "System Design"};
    std::cout << "Top Courses on SikhoSikhao:\\n";
    for (const auto& sub : subjects) {
        std::cout << "- " << sub << "\\n";
    }
    return 0;
}
\`\`\``,
  },

  // ─── Python ──────────────────────────────────────────────────────────────
  {
    keywords: ["python", "python programming", "what is python"],
    answer: `## 🐍 Python Programming Language

**Python** is a high-level, interpreted, general-purpose programming language developed by **Guido van Rossum** in 1991. It emphasizes code readability and productivity.

### 🌟 Key Highlights:
- **Dynamic Typing & Clean Syntax:** No semicolons, clean indentation.
- **Massive Ecosystem:** NumPy, Pandas, TensorFlow, PyTorch, FastAPI, Django.
- **#1 Choice for AI & Data Science:** Standard for modern Machine Learning & Deep Learning.

\`\`\`python
# Simple Python Demonstration
def greet_learner(name: str, topic: str) -> str:
    return f"Welcome {name}! Ready to master {topic} on SikhoSikhao?"

print(greet_learner("Arjun", "Artificial Intelligence"))
\`\`\``,
  },

  // ─── Java ────────────────────────────────────────────────────────────────
  {
    keywords: ["java", "java programming", "what is java"],
    answer: `## ☕ Java Programming Language

**Java** is a class-based, object-oriented programming language released by **Sun Microsystems** in 1995. Its defining philosophy is **WORA (Write Once, Run Anywhere)** powered by the **Java Virtual Machine (JVM)**.

### 🌟 Key Features:
- **Platform Independence:** Compiled to bytecode (\`.class\`), runnable on any OS with JVM.
- **Automatic Garbage Collection:** Safe memory management without manual pointers.
- **Enterprise Powerhouse:** Drives banking systems, Android apps, and Spring Boot microservices.

\`\`\`java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello from Java on SikhoSikhao!");
    }
}
\`\`\``,
  },

  // ─── JavaScript & TypeScript ─────────────────────────────────────────────
  {
    keywords: ["javascript", "js", "typescript", "what is javascript", "what is typescript"],
    answer: `## 🌐 JavaScript & TypeScript

**JavaScript** is the ubiquitous language of the World Wide Web, running in every modern browser and server-side via **Node.js** and **Bun**. **TypeScript**, developed by Microsoft, is a typed superset of JavaScript that adds static types and tooling.

### 🌟 Why Developers Love It:
- **Full-Stack Capabilities:** One language for frontend (React, Next.js) and backend (Node.js, Express).
- **Asynchronous & Event-Driven:** Non-blocking I/O with Promises and \`async/await\`.
- **TypeScript Type Safety:** Catches bugs at compile time.

\`\`\`typescript
interface UserProfile {
  name: string;
  role: "reader" | "creator";
}

const user: UserProfile = { name: "Aarav", role: "creator" };
console.log(\`User \${user.name} registered as \${user.role}\`);
\`\`\``,
  },

  // ─── Data Structures & Algorithms (DSA) ──────────────────────────────────
  {
    keywords: ["dsa", "data structures", "algorithms", "binary search", "big o"],
    answer: `## 🧩 Data Structures & Algorithms (DSA)

**Data Structures** are specialized formats for organizing, processing, and storing data, while **Algorithms** are step-by-step procedures for calculation and problem solving.

### 📚 Fundamental Data Structures:
- **Arrays & Strings:** Contiguous memory, O(1) index access.
- **Linked Lists:** Dynamic nodes with pointers, O(1) insertion at head.
- **Stacks & Queues:** LIFO (Last-In-First-Out) and FIFO (First-In-First-Out).
- **Trees & Graphs:** Hierarchical & network relationships (Binary Search Trees, Graphs).
- **Hash Tables / Maps:** Key-value mapping with O(1) average lookup.

### ⚡ Binary Search Example (O(log n)):
\`\`\`typescript
function binarySearch(arr: number[], target: number): number {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1; // Not found
}
\`\`\``,
  },

  // ─── SQL & Databases ─────────────────────────────────────────────────────
  {
    keywords: ["sql", "database", "rdbms", "postgresql", "mysql"],
    answer: `## 🗄️ SQL & Relational Databases

**SQL (Structured Query Language)** is the international standard language for storing, manipulating, and retrieving data in relational database management systems (RDBMS) like PostgreSQL, MySQL, and SQLite.

### 🌟 Essential SQL Operations (CRUD):
\`\`\`sql
-- 1. Create Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert Data
INSERT INTO users (username, email) VALUES ('priya_tech', 'priya@sikhosikhao.app');

-- 3. Query with Filtering
SELECT username, email FROM users WHERE id = 1;
\`\`\``,
  },

  // ─── Taj Mahal ───────────────────────────────────────────────────────────
  {
    keywords: ["taj mahal", "tajmahal", "taj-mahal"],
    answer: `## 🕌 Taj Mahal

The **Taj Mahal** is one of the world's most famous monuments, located in **Agra, Uttar Pradesh, India**.

**Key Facts:**
- **Built by:** Mughal Emperor **Shah Jahan** (1628–1658)
- **Purpose:** A mausoleum built in memory of his beloved wife **Mumtaz Mahal**
- **Construction:** Started in **1632**, completed around **1653** (~21 years)
- **Material:** Primarily white **Makrana marble** from Rajasthan, inlaid with precious stones
- **UNESCO World Heritage Site** since 1983 and recognized as one of the **Seven Wonders of the World**.`,
  },

  // ─── India ───────────────────────────────────────────────────────────────
  {
    keywords: ["india", "bharat"],
    answer: `## 🇮🇳 India (Bharat)

**India** is the world's most populous democracy and an ancient civilization.

**Key Facts:**
- **Capital:** New Delhi
- **Population:** ~1.44 billion
- **Languages:** 22 officially recognized languages; Hindi & English widely used
- **Currency:** Indian Rupee (₹)
- **Independence:** 15 August 1947
- Home to world-leading technology innovators, diverse cultures, and dynamic digital growth.`,
  },

  // ─── Artificial Intelligence ─────────────────────────────────────────────
  {
    keywords: ["what is ai", "artificial intelligence", "machine learning", "deep learning"],
    answer: `## 🤖 Artificial Intelligence (AI)

**Artificial Intelligence** is the simulation of human intelligence by computer systems.

### Core Disciplines:
1. **Machine Learning (ML):** Teaching computers to learn patterns from historical data without explicit hardcoded rules.
2. **Deep Learning (DL):** Multi-layered artificial neural networks inspired by the human brain.
3. **Natural Language Processing (NLP):** Enabling computers to understand, translate, and generate human languages (like LLMs).
4. **Computer Vision:** Image classification, object tracking, and facial recognition.`,
  },
  // ─── Biodegradable & Environmental Science ─────────────────────────────────
  {
    keywords: [
      "biodegradable",
      "biodegradable objects",
      "biodegradable materials",
      "biodegradable waste",
      "biodegradability",
      "what is biodegradable",
    ],
    answer: `## 🌿 Biodegradable Objects & Materials

**Biodegradable objects** are substances or materials that can be broken down naturally by biological agents (microorganisms like **bacteria, fungi, and worms**) into simple, harmless natural elements such as water, carbon dioxide, and organic matter (compost).

---

### 🌟 Key Examples of Biodegradable Objects:
1. **Food & Organic Waste:** Fruit and vegetable peels, leftover food, tea leaves, coffee grounds.
2. **Paper & Cardboard:** Newspapers, cardboard boxes, paper bags, egg cartons.
3. **Natural Fibers & Fabrics:** Cotton, wool, silk, jute, and linen clothing.
4. **Plant Residues & Wood:** Leaves, twigs, fallen branches, sawdust, unprocessed timber.
5. **Biodegradable Plastics (Bioplastics):** Polylactic acid (PLA) made from corn starch or sugarcane (under industrial composting).

---

### ⚖️ Biodegradable vs. Non-Biodegradable:
| Feature | Biodegradable Objects | Non-Biodegradable Objects |
| :--- | :--- | :--- |
| **Breakdown Method** | Decomposed by natural bacteria & fungi | Cannot be decomposed by biological organisms |
| **Time to Decompose** | Weeks to a few years | Hundreds to thousands of years |
| **Environmental Impact** | Returns nutrients to soil (eco-friendly) | Clogs landfills, pollutes oceans, harms wildlife |
| **Common Examples** | Apple core, paper bag, cotton shirt | Plastic bottles, styrofoam, aluminum cans, glass |

---

### ♻️ Environmental Significance:
- **Soil Fertility:** Composting biodegradable waste enriches soil with humus and essential minerals (nitrogen, phosphorus).
- **Reduces Landfills:** Diverting organic waste prevents massive methane gas buildup in landfills.
- **Waste Segregation (Wet vs Dry Waste):** Biodegradable waste goes into **Green Bins** for composting, keeping recyclables clean.`,
  },
  {
    keywords: ["non-biodegradable", "non biodegradable", "plastic pollution"],
    answer: `## 🚫 Non-Biodegradable Objects

**Non-biodegradable objects** are materials that cannot be broken down, dissolved, or decomposed by natural biological agents (bacteria and fungi). Once created, they persist in the environment for decades or centuries.

### ⚠️ Common Examples:
- **Plastics:** Single-use bags, PET water bottles, packaging films (takes 450–1000 years).
- **Metals:** Aluminum cans, copper wires, tin foil.
- **Synthetics & Chemicals:** Styrofoam (thermocol), synthetic nylon, DDT, e-waste.
- **Glass:** Takes over 1 million years to naturally weather.

### 🛡️ Best Practices to Minimize Harm:
1. **The 3 R's:** Reduce usage, Reuse items, and Recycle scrap.
2. **Switch to Alternatives:** Use cloth bags instead of polyethene, metal/bamboo straws, and glass/steel water containers.
3. **Proper Segregation:** Dispose of non-biodegradable dry waste into **Blue Bins**.`,
  },
  {
    keywords: ["photosynthesis", "what is photosynthesis"],
    answer: `## 🍃 Photosynthesis

**Photosynthesis** is the biological process by which green plants, algae, and certain bacteria convert **sunlight, carbon dioxide (CO₂), and water (H₂O)** into glucose (chemical energy) and release oxygen (O₂) into the atmosphere.

### 🧪 Chemical Equation:
\`6CO₂ + 6H₂O + Sunlight (Chlorophyll) → C₆H₁₂O₆ (Glucose) + 6O₂ (Oxygen)\`

### 🔑 Key Stages:
1. **Light-Dependent Reactions (in Thylakoid membranes):** Sunlight is absorbed by chlorophyll, splitting water (H₂O) into oxygen, protons, and generating ATP and NADPH.
2. **Calvin Cycle / Dark Reactions (in Stroma):** CO₂ is fixed into sugar (glucose) using ATP and NADPH energy.`,
  },
  {
    keywords: ["solar system", "planets"],
    answer: `## 🪐 The Solar System

The **Solar System** consists of our central star, the **Sun**, gravitationally binding **8 major planets**, dwarf planets (like Pluto), moons, asteroids, and comets.

### 🌌 The 8 Planets (in order from the Sun):
1. **Mercury:** Smallest planet, closest to the Sun, no atmosphere.
2. **Venus:** Hottest planet due to runaway greenhouse effect (CO₂).
3. **Earth:** Our home planet, only known planet to support life and liquid surface water.
4. **Mars:** The "Red Planet", rich in iron oxide; home to Olympus Mons (largest volcano).
5. **Jupiter:** Largest planet, gas giant with the famous Great Red Spot and 95+ moons.
6. **Saturn:** Spectacular ring system made of ice and rock particles.
7. **Uranus:** Ice giant that rotates on its side (98° axial tilt).
8. **Neptune:** Farthest major planet, deep blue with supersonic winds.`,
  },
];

// ────────────────────────────────────────────────────────────────────────────
//  Smart Generative Offline Responder (Never returns an error/denial)
// ────────────────────────────────────────────────────────────────────────────

export function generateDemoResponse(messages: ChatMessage[], ctx: AIContext): string {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const lower = lastUserMsg.toLowerCase().trim();

  // 1. Direct Knowledge Base Match
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.answer;
    }
  }

  // 2. Greetings
  if (/^(hello|hi|hey|namaste|namaskar|hii|helo)\b/.test(lower)) {
    return `👋 **Hello! I'm SikhoAI** — your learning assistant!

I can help you with:
- 💻 **Programming & Tech** (C, C++, Python, Java, JavaScript, DSA, Web Dev)
- 🌿 **Science & Environment** (Biology, Chemistry, Physics, Ecology)
- 📚 **Academic & General Knowledge** (History, Geography, Mathematics)
- 📝 **Notes & Chapters** (Summaries, study guides, outlines)
- 🎬 **Video Scripts & Quizzes**

What would you like to explore today?`;
  }

  // 3. Thanks
  if (/^(thanks|thank you|shukriya|dhanyawad|ty\b|thx)/.test(lower)) {
    return "You're very welcome! 😊 Feel free to ask any other questions anytime.";
  }

  // 4. Summaries
  if (lower.includes("summar") || lower.includes("summarise") || lower.includes("summarize")) {
    return ctx.contentPreview
      ? `## 📋 Structured Summary

${ctx.contentPreview.slice(0, 350)}...

**Key Insights:**
- **Core Concept:** Foundational principles established with practical context.
- **Implementation:** Structured step-by-step methodologies included.
- **Application:** Real-world examples and developer guidelines highlighted.`
      : "Please share or paste any notes or code snippets, and I will generate an executive summary for you!";
  }

  // 5. Video Script
  if (lower.includes("video script") || lower.includes("script")) {
    const topic = ctx.fileName || lastUserMsg.replace(/script/i, "").trim() || "Tutorial Topic";
    return `## 🎬 Complete Video Lecture Script Outline

**Topic:** ${topic}
**Target Duration:** ~10-12 Minutes

1. **Introduction & Hook (0:00 - 1:30):**
   - Address the core problem and why this topic matters.
   - Outline the key deliverables viewers will master.
2. **Foundations & Architecture (1:30 - 4:30):**
   - Essential definitions and conceptual architecture.
   - Comparison with traditional alternatives.
3. **Live Demonstration & Case Study (4:30 - 9:00):**
   - Step-by-step walkthrough with deep explanation.
   - Common pitfalls and best practices.
4. **Recap & Next Steps (9:00 - 11:00):**
   - Summary of core takeaways and practice exercises.`;
  }

  // 6. Domain-Aware Dynamic Concept Generator
  const cleanedTopic = lastUserMsg
    .replace(/^(what (is|are|was|were)|who (is|was)|explain|tell me about|how does|how do|teach me)\s*/i, "")
    .replace(/[?!.]+$/, "")
    .trim();

  const displayTopic = cleanedTopic
    ? cleanedTopic.charAt(0).toUpperCase() + cleanedTopic.slice(1)
    : "Your Query";

  // Check domain
  const isScienceOrNature = /\b(bio|eco|plant|animal|cell|atom|molecule|chem|physic|energy|nature|water|earth|planet|organ|food|waste|forest|solar|heat|matter|species|environment|pollut|climate|green|biodegrad|decompos)\b/i.test(cleanedTopic);
  const isHistoryOrSocial = /\b(history|war|empire|king|queen|revolution|constitution|democracy|freedom|ancient|dynasty|ruler|treaty|monument|country|state|geography|river|mountain|ocean|culture)\b/i.test(cleanedTopic);
  const isMath = /\b(calculus|algebra|geometry|theorem|matrix|integral|derivative|trigonometry|equation|probability|statistic|fraction|prime)\b/i.test(cleanedTopic);

  if (isScienceOrNature) {
    return `## 🌿 ${displayTopic} — Educational Guide

Here is a clear, scientific breakdown of **${displayTopic}**:

---

### 1. 📌 Definition & Core Concept
**${displayTopic}** is a fundamental concept in natural and environmental sciences. It describes natural phenomena, biological mechanisms, and the interactions between living organisms and their physical environment.

---

### 2. 🔑 Key Principles & How It Works:
- **Natural Mechanisms:** Driven by biological, chemical, or physical processes that occur naturally in nature.
- **Ecological Role:** Plays a critical role in maintaining planetary balance, energy cycles, and biodiversity.
- **Human & Environmental Impact:** Directly influences sustainability, conservation, and scientific advancements.

---

### 3. 🌍 Real-World Examples & Applications:
- **Everyday Observation:** Commonly encountered in daily life, ecosystems, and environmental management.
- **Scientific Research:** Studied extensively in biology, chemistry, and environmental engineering to develop sustainable solutions.

---

### 4. 📝 Key Takeaways for Students & Learners:
1. Master the core scientific definition before diving into complex sub-processes.
2. Relate the concept to real-world ecological examples.
3. Understand the positive and negative implications for the environment and human health.

*Would you like a deeper explanation, diagrams, or quiz questions on ${displayTopic}?*`;
  }

  if (isHistoryOrSocial) {
    return `## 🏛️ ${displayTopic} — Historical & Social Overview

Here is an informative overview of **${displayTopic}**:

---

### 1. 📌 Context & Significance
**${displayTopic}** represents a pivotal chapter in human history and social sciences. Understanding this topic helps us appreciate cultural developments, socio-political changes, and historical milestones.

---

### 2. 🔑 Key Themes & Developments:
- **Historical Context:** Shaped by social, economic, and geopolitical factors of its era.
- **Key Figures & Events:** Driven by influential leaders, movements, or transformative events.
- **Long-Term Impact:** Continues to shape modern laws, cultural identities, and international relations.

---

### 3. 📚 Study Points:
1. Examine the cause-and-effect relationships behind key events.
2. Note chronological milestones and significant dates.
3. Consider multiple historical perspectives and their modern relevance.

*Feel free to ask for detailed timelines, key figures, or sample exam questions on ${displayTopic}!*`;
  }

  if (isMath) {
    return `## 📐 ${displayTopic} — Mathematical Guide

Here is a structured mathematical breakdown of **${displayTopic}**:

---

### 1. 📌 Definition & Core Formula
**${displayTopic}** is an essential mathematical principle used to formulate, analyze, and solve quantitative problems.

---

### 2. 🔑 Key Properties & Theorems:
- **Foundational Rules:** Governed by rigorous proofs, logical axioms, and algebraic relationships.
- **Problem-Solving Methodology:** Apply systematic step-by-step transformations to reach exact solutions.
- **Practical Application:** Fundamental in physics, engineering, computer science, and data analysis.

---

### 3. 💡 Tips for Mastery:
1. Memorize and understand the intuition behind the fundamental formulas.
2. Work through multiple practice problems ranging from basic to advanced.
3. Check boundary conditions and verify units carefully.

*Ask for step-by-step solved examples or practice problems on ${displayTopic}!*`;
  }

  // Fallback: Tech & Computer Science
  return `## 💻 ${displayTopic} — Technical Guide

Here is a clear, structured breakdown of **${displayTopic}**:

---

### 1. 📌 Overview & Core Definition
**${displayTopic}** is an essential subject in modern technical education and problem-solving. Understanding it provides strong foundations for building reliable systems and mastering computing concepts.

---

### 2. 🔑 Key Principles & How It Works:
- **Foundational Architecture:** Operates with structured inputs, processing logic, and predictable outputs.
- **Efficiency & Scalability:** Designed to balance performance, memory efficiency, and readability.
- **Real-World Relevance:** Widely utilized in software engineering, system design, and practical applications.

---

### 3. 💻 Practical Conceptual Flow:
\`\`\`text
Input / Request -> Validation -> Core Processing Logic -> Output / Response
\`\`\`

---

### 4. 🚀 Best Practices & Tips:
1. Always start by understanding fundamental definitions before diving into advanced optimizations.
2. Test edge cases and understand how memory or performance scales.
3. Practice with real projects and hands-on exercises.

*Feel free to ask for code examples, quiz questions, or a chapter outline on ${displayTopic}!*`;
}

// ────────────────────────────────────────────────────────────────────────────
//  Utility: generate unique ID for messages
// ────────────────────────────────────────────────────────────────────────────

export function generateMsgId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
