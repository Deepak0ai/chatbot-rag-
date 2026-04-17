type KnowledgeEntry = {
  title: string;
  content: string;
};

export const knowledgeBase: KnowledgeEntry[] = [
  {
    title: "Services",
    content:
      "We provide AI automation services, lead generation, workflow automation using n8n, CRM integrations with GoHighLevel, and custom AI agent development.",
  },
  {
    title: "Company",
    content:
      "This is a RAG-powered chatbot built with Next.js 15, Google Gemini AI, and deployed on Vercel.",
  },
  {
    title: "Support",
    content:
      "For support, contact us via email or LinkedIn. We respond within 24 hours on business days.",
  },
  {
    title: "Pricing",
    content:
      "We offer flexible pricing starting from project-based contracts. Contact us for a custom quote based on your automation needs.",
  },
  {
    title: "Technology",
    content:
      "Our tech stack includes n8n, Apollo.io, Clay.com, Google Gemini API, Pinecone, Python, and Airtable for workflow automation.",
  },
];

export function retrieveContext(query: string): string {
  const normalizedQuery = query.toLowerCase();
  const queryWords = normalizedQuery.split(/[^a-z0-9]+/).filter(Boolean);

  const scored = knowledgeBase.map((entry) => {
    const entryText = `${entry.title} ${entry.content}`.toLowerCase();
    const score = queryWords.reduce(
      (acc, word) => acc + (entryText.includes(word) ? 1 : 0),
      0
    );
    return { ...entry, score };
  });

  const matches = scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const topResults = (matches.length > 0 ? matches : scored).slice(0, 3);

  return topResults
    .map((entry) => `[${entry.title}]: ${entry.content}`)
    .join("\n");
}
