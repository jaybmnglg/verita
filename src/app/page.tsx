"use client";

import React, { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { WelcomeView } from "@/components/WelcomeView";
import { ConversationView } from "@/components/ConversationView";
import { ChatMessage, ChatApiResponse } from "@/types/chat";
import { PdfViewerProvider, usePdfViewer } from "@/context/PdfViewerContext";

function HomeContent({
  messages,
  isLoading,
  onReset,
  onSendQuestion,
  onRetry,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  onReset: () => void;
  onSendQuestion: (q: string) => void;
  onRetry: (q: string) => void;
}) {
  const { isOpen } = usePdfViewer();

  return (
    <div
      className={`min-h-screen bg-ivory flex flex-col transition-[margin] duration-300 ease-in-out ${
        isOpen ? "md:mr-[480px] lg:mr-[540px] xl:mr-[46vw]" : "mr-0"
      }`}
    >
      <Header hasMessages={messages.length > 0} onReset={onReset} />

      <main className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          <WelcomeView onSubmit={onSendQuestion} isLoading={isLoading} />
        ) : (
          <ConversationView
            messages={messages}
            onSubmit={onSendQuestion}
            onRetry={onRetry}
            isLoading={isLoading}
          />
        )}
      </main>
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => `verita-session-${Date.now()}`);

  const handleReset = useCallback(() => {
    setMessages([]);
    setSessionId(`verita-session-${Date.now()}`);
  }, []);

  const handleSendQuestion = useCallback(
    async (questionText: string) => {
      const trimmed = questionText.trim();
      if (!trimmed || isLoading) return;

      const userMsgId = `user-${Date.now()}`;
      const assistantMsgId = `assistant-${Date.now()}`;

      const userMessage: ChatMessage = {
        id: userMsgId,
        sender: "user",
        text: trimmed,
        status: "complete",
        timestamp: Date.now(),
      };

      const pendingAssistantMessage: ChatMessage = {
        id: assistantMsgId,
        sender: "assistant",
        text: "",
        status: "loading",
        timestamp: Date.now(),
      };

      // Add user message and pending assistant message immediately
      setMessages((prev) => [...prev, userMessage, pendingAssistantMessage]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: trimmed,
            sessionId,
          }),
        });

        const data: ChatApiResponse = await response.json();

        if (!response.ok) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    status: "error",
                    text:
                      data.message ||
                      "Something went wrong while preparing your answer. Please try again.",
                    errorMessage: data.error
                      ? `Error: ${data.error}${data.configured === false ? " (Backend endpoint unconfigured)" : ""}`
                      : undefined,
                  }
                : msg
            )
          );
          return;
        }

        // Successfully received answer
        const isInsufficient = Boolean(data.isInsufficientEvidence);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  status: isInsufficient ? "insufficient_evidence" : "complete",
                  text: data.answer,
                  citations: data.citations || [],
                }
              : msg
          )
        );

        if (data.sessionId) {
          setSessionId(data.sessionId);
        }
      } catch (err: unknown) {
        console.error("Network or client error:", err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  status: "error",
                  text: "Something went wrong while preparing your answer. Please try again.",
                  errorMessage: "Network error: Unable to contact the application server.",
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sessionId]
  );

  const handleRetry = useCallback(
    (questionText: string) => {
      // Remove the last assistant error message, and resubmit
      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].sender === "assistant") {
          return prev.slice(0, prev.length - 1);
        }
        return prev;
      });
      handleSendQuestion(questionText);
    },
    [handleSendQuestion]
  );

  return (
    <PdfViewerProvider>
      <HomeContent
        messages={messages}
        isLoading={isLoading}
        onReset={handleReset}
        onSendQuestion={handleSendQuestion}
        onRetry={handleRetry}
      />
    </PdfViewerProvider>
  );
}
