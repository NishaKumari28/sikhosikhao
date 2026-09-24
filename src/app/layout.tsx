import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SikhoSikhao — Seekho. Likho. Sikhao.",
  description: "Ek open community knowledge platform jahan har learner ek teacher hai. Notes likhkar ya tutorial dekar apni book banao aur community ke saath share karo.",
  keywords: ["learning", "notes", "tutorials", "books", "community", "technology", "coding"],
  openGraph: {
    title: "SikhoSikhao — Seekho. Likho. Sikhao.",
    description: "Har learner ek potential teacher hai.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi">
      <body>{children}</body>
    </html>
  );
}
