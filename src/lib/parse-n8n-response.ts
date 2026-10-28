import type { Citation } from "../types/chat";
import { resolveHandbookPage } from "./handbook-page-resolver";

export interface NormalizedResult {
  answer: string;
  citations: Citation[];
  isInsufficientEvidence: boolean;
}

/**
 * Normalizes any response payload returned by n8n into a clean answer string,
 * citations list, and insufficient-evidence flag.
 */
export function parseN8nResponse(data: unknown): NormalizedResult {
  let rawText = "";
  let structuredCitations: Citation[] = [];

  // Case 1: Handle array of items (standard n8n list output)
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0];
    if (typeof first === "string") {
      rawText = first;
    } else if (typeof first === "object" && first !== null) {
      const obj = first as Record<string, unknown>;
      rawText = extractTextFromObject(obj);
      structuredCitations = extractStructuredCitations(obj);
    }
  }
  // Case 2: Handle single object
  else if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    rawText = extractTextFromObject(obj);
    structuredCitations = extractStructuredCitations(obj);
  }
  // Case 3: Raw string
  else if (typeof data === "string") {
    rawText = data;
  }

  rawText = rawText.trim();

  // If still empty, return a graceful fallback
  if (!rawText) {
    return {
      answer: "No response text was received from the handbook assistant.",
      citations: [],
      isInsufficientEvidence: false,
    };
  }

  // Check for insufficient evidence according to PRD and verita.json prompt
  const isInsufficientEvidence = checkInsufficientEvidence(rawText);

  // Parse embedded citations if no structured citations were provided
  let answer = rawText;
  let citations: Citation[] = [...structuredCitations];

  if (!isInsufficientEvidence) {
    const parsed = parseEmbeddedCitations(answer);
    if (citations.length === 0 && parsed.citations.length > 0) {
      citations = parsed.citations;
      answer = parsed.cleanAnswer;
    }

    // Enrich citations with actual handbook pages if missing or set to placeholder page 1
    if (citations.length > 0) {
      citations = citations.map((cit) => {
        if (!cit.page || cit.page === "1") {
          const resolved = resolveHandbookPage(cit.excerpt || answer);
          if (resolved) {
            return { ...cit, page: String(resolved) };
          }
        }
        return cit;
      });
    }
  } else {
    // Insufficient evidence responses should have no citations
    citations = [];
  }

  return {
    answer: answer.trim(),
    citations,
    isInsufficientEvidence,
  };
}

function extractTextFromObject(obj: Record<string, unknown>): string {
  // Check common n8n LangChain agent keys
  if (typeof obj.output === "string") return obj.output;
  if (typeof obj.text === "string") return obj.text;
  if (typeof obj.response === "string") return obj.response;
  if (typeof obj.message === "string") return obj.message;

  // Nested in data or json
  if (typeof obj.data === "object" && obj.data !== null) {
    return extractTextFromObject(obj.data as Record<string, unknown>);
  }
  if (typeof obj.json === "object" && obj.json !== null) {
    return extractTextFromObject(obj.json as Record<string, unknown>);
  }

  // Fallback to JSON representation if unrecognized and non-empty
  if (Object.keys(obj).length > 0) {
    return JSON.stringify(obj);
  }
  return "";
}

function extractStructuredCitations(obj: Record<string, unknown>): Citation[] {
  const sources =
    obj.citations ||
    obj.sources ||
    obj.sourceDocuments ||
    obj.source_documents ||
    obj.documents;

  if (!Array.isArray(sources)) return [];

  const citations: Citation[] = [];

  sources.forEach((item, index) => {
    if (!item || typeof item !== "object") return;
    const s = item as Record<string, unknown>;
    const metadata = (typeof s.metadata === "object" && s.metadata !== null ? s.metadata : {}) as Record<string, unknown>;

    const title =
      (typeof s.title === "string" ? s.title : null) ||
      (typeof metadata.title === "string" ? metadata.title : null) ||
      (typeof metadata.source === "string" ? metadata.source : null) ||
      "Student Handbook 2025-2026";

    const page =
      s.page ??
      s.pageNumber ??
      metadata.page ??
      metadata.pageNumber ??
      metadata.loc_pageNumber ??
      (typeof metadata.loc === "object" && metadata.loc !== null
        ? (metadata.loc as Record<string, unknown>).pageNumber
        : undefined);

    const section =
      (typeof s.section === "string" ? s.section : null) ||
      (typeof metadata.section === "string" ? metadata.section : null) ||
      (typeof metadata.article === "string" ? metadata.article : null) ||
      undefined;

    const excerpt =
      (typeof s.excerpt === "string" ? s.excerpt : null) ||
      (typeof s.pageContent === "string" ? s.pageContent : null) ||
      (typeof s.text === "string" ? s.text : null) ||
      (typeof s.content === "string" ? s.content : null) ||
      undefined;

    citations.push({
      id: `cit-${index + 1}-${Date.now()}`,
      title,
      section,
      page: page ? String(page) : undefined,
      excerpt,
    });
  });

  return citations;
}

/**
 * Parses embedded "Source: ..." lines matching the verita.json prompt instructions:
 * "When available in the retrieved metadata, end with a source line, e.g.: 'Source: Article/Section [X], Page [Y]'."
 */
function parseEmbeddedCitations(text: string): { cleanAnswer: string; citations: Citation[] } {
  const trimmed = text.trim();

  // Match trailing Source/Reference block in various formats (plain, markdown bold/headers, bracketed, multiline)
  const sourceRegex = /(?:\n{1,}|\n\s*)(?:\[|\()?(?:#{1,4}\s*)?(?:\*{1,2}|_{1,2})?(?:Sources|Source|References|Reference)(?:\*{1,2}|_{1,2})?\s*[:\-–—]?\s*(?:\*{1,2}|_{1,2})?([\s\S]*)$/i;
  const match = trimmed.match(sourceRegex);

  if (!match) {
    return { cleanAnswer: text, citations: [] };
  }

  const rawSource = match[1]
    .replace(/^[\s*_\-–—:]+/, "")
    .replace(/[\]\)\s]+$/, "")
    .trim();

  const cleanAnswer = trimmed.slice(0, match.index).trim();

  // Extract Page number if present
  const pageMatch = rawSource.match(/(?:Pages?|p\.|pp\.)\s*([0-9]+(?:\s*-\s*[0-9]+)?)/i);
  const page = pageMatch ? pageMatch[1].trim() : undefined;

  // Extract Section/Article if present
  const sectionMatch = rawSource.match(/(Article\s+[IVXLCDM\d]+(?:,\s*Section\s+[\d\w]+)?|Section\s+[\d\w]+|Chapter\s+[IVXLCDM\d]+)/i);
  const section = sectionMatch ? sectionMatch[1].trim() : undefined;

  // Extract document title if explicitly named, or default to the official handbook
  let title = "Student Handbook 2025-2026";
  if (/student handbook/i.test(rawSource)) {
    title = "Student Handbook 2025-2026";
  }

  // Create the citation. Note: Do not fabricate an excerpt when none was returned.
  const citation: Citation = {
    id: `cit-embedded-1`,
    title,
    section: section || (!page ? rawSource : undefined),
    page,
    excerpt: undefined,
  };

  return {
    cleanAnswer,
    citations: [citation],
  };
}

/**
 * Checks whether the text represents an insufficient evidence limitation response.
 */
function checkInsufficientEvidence(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("couldn't find this in the lpu-c student handbook") ||
    lower.includes("could not find this in the lpu-c student handbook") ||
    lower.includes("couldn't find enough information in the university handbook") ||
    lower.includes("could not find enough information in the university handbook") ||
    lower.includes("i can only help with questions about the lpu-c student handbook") ||
    lower.includes("not covered in the student handbook") ||
    lower.includes("not covered in the lpu-c student handbook")
  );
}
