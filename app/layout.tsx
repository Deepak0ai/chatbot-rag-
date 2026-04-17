import type { ReactNode } from "react";

export const metadata = {
  title: "RAG Chatbot",
  description: "A modern Gemini-powered chatbot with simple RAG",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
