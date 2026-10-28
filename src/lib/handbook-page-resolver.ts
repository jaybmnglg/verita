import { HANDBOOK_PAGES } from "./handbook-pages-data";

const STOP_WORDS = new Set([
  "this", "that", "with", "from", "have", "were", "what", "when", "your",
  "about", "student", "students", "handbook", "cavite", "university", "official",
  "under", "will", "shall", "must", "they", "their", "there", "which", "would",
  "could", "should", "been", "being", "more", "most", "also", "into", "only",
  "each", "other", "some", "such", "than", "then", "very", "first", "second",
  "third", "fourth", "policy", "rules", "regulations", "accordance", "section", "article"
]);

/**
 * Given answer text or an excerpt, searches through the official student handbook
 * pages and returns the best matching physical page number (1-indexed).
 */
export function resolveHandbookPage(text: string): number | undefined {
  if (!text || typeof text !== "string") return undefined;

  // Extract significant keywords of length >= 4
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP_WORDS.has(w));

  if (words.length < 2) return undefined;

  let bestScore = 0;
  let bestPage: number | undefined = undefined;

  const pages = HANDBOOK_PAGES;

  for (const p of pages) {
    // Skip front matter (cover, table of contents pages 1-5) and back committee directory (pages 68-71)
    if (p.page <= 5 || p.page >= 68) continue;

    const pageLower = p.text.toLowerCase();
    let score = 0;

    for (const word of words) {
      if (pageLower.includes(word)) {
        score++;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestPage = p.page;
    }
  }

  // Require a reasonable threshold of matching keywords
  const threshold = Math.min(3, Math.max(2, Math.floor(words.length * 0.15)));
  if (bestScore >= threshold) {
    return bestPage;
  }

  return undefined;
}
