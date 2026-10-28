import React, { useEffect, useRef } from "react";
import { ChatMessage } from "@/types/chat";
import { MessageItem } from "./MessageItem";
import { ChatInput } from "./ChatInput";

interface ConversationViewProps {
  messages: ChatMessage[];
  onSubmit: (question: string) => void;
  onRetry: (question: string) => void;
  isLoading: boolean;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  messages,
  onSubmit,
  onRetry,
  isLoading,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto px-4 sm:px-6">
      {/* Message List */}
      <div className="flex-1 py-5 sm:py-8 space-y-1">
        {messages.map((message, index) => {
          let precedingUserText = "";
          if (message.sender === "assistant" && index > 0) {
            const prev = messages[index - 1];
            if (prev.sender === "user") {
              precedingUserText = prev.text;
            }
          }

          return (
            <MessageItem
              key={message.id}
              message={message}
              onRetry={onRetry}
              onSendAction={onSubmit}
              previousQuestionText={precedingUserText}
            />
          );
        })}
        <div ref={messagesEndRef} className="h-6" />
      </div>

      {/* Persistent Bottom Input (Linear hairline border & subtle backdrop) */}
      <div className="sticky bottom-0 bg-ivory/95 backdrop-blur-sm pt-2.5 pb-5 border-t border-border">
        <ChatInput
          onSubmit={onSubmit}
          isLoading={isLoading}
          placeholder="Ask a follow-up question about the handbook..."
        />
        <p className="text-[12px] leading-[18px] tracking-[-0.08px] text-center text-secondary/70 mt-2">
          Verita references the student handbook. Verify interpretations with university offices.
        </p>
      </div>
    </div>
  );
};
