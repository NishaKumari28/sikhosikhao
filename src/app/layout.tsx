import type { Metadata } from "next";
import "./globals.css";
import { AIAssistantProvider } from "@/components/ai/AIAssistantContext";
import AIAssistantTrigger from "@/components/ai/AIAssistantTrigger";
import { FirebaseAuthProvider } from "@/context/FirebaseAuthContext";

export const metadata: Metadata = {
  title: "SikhoSikhao — Learn. Write. Share.",
  description: "An open community knowledge platform where every learner is a creator. Turn daily notes or tutorials into interactive books and share them with the community.",
  keywords: ["learning", "notes", "tutorials", "books", "community", "technology", "coding"],
  openGraph: {
    title: "SikhoSikhao — Learn. Write. Share.",
    description: "Every learner is a creator. Build living books and share knowledge.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <FirebaseAuthProvider>
          <AIAssistantProvider>
            {children}
            <AIAssistantTrigger />
          </AIAssistantProvider>
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}


