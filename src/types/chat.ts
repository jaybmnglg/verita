export interface Citation {
  id: string;
  title: string;
  section?: string;
  page?: string | number;
  excerpt?: string;
}

export type MessageStatus = "complete" | "loading" | "error" | "insufficient_evidence";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  citations?: Citation[];
  status: MessageStatus;
  errorMessage?: string;
  timestamp: number;
}

export interface ChatApiResponse {
  answer: string;
  citations: Citation[];
  isInsufficientEvidence: boolean;
  sessionId?: string;
  error?: string;
  message?: string;
  configured?: boolean;
}
