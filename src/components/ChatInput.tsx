import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit,
  isLoading,
  placeholder = "Ask a question about the handbook...",
  autoFocus = false,
}) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const nextHeight = Math.min(textareaRef.current.scrollHeight, 160);
      textareaRef.current.style.height = `${Math.max(nextHeight, 38)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    onSubmit(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "38px";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = input.trim().length > 0 && !isLoading;

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex flex-col w-full bg-surface border border-border rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.02)] focus-within:border-burgundy focus-within:ring-1 focus-within:ring-burgundy transition-all duration-150 p-2.5 sm:p-3"
    >
      <label htmlFor="verita-question-input" className="sr-only">
        Ask a question about the handbook
      </label>

      {/* Input Textarea */}
      <textarea
        id="verita-question-input"
        ref={textareaRef}
        rows={1}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        aria-label="Ask a question about the handbook"
        className="w-full resize-none border-0 bg-transparent px-2 py-1 text-[15px] leading-[24px] tracking-[-0.165px] text-primary placeholder:text-secondary/70 focus:outline-none focus:ring-0 max-h-[160px]"
      />

      {/* Bottom Bar Inside Input Box */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50 mt-1">
        <div className="text-[11px] text-secondary/50 px-1 hidden sm:block select-none">
          Press Enter to send, Shift + Enter for new line
        </div>

        <div className="shrink-0 ml-auto">
          <button
            type="submit"
            disabled={!canSubmit}
            aria-label={isLoading ? "Processing question" : "Send question"}
            className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all duration-150 ${
              canSubmit
                ? "bg-burgundy text-white hover:bg-burgundy-pressed cursor-pointer active:scale-90 shadow-sm"
                : "bg-surface-secondary text-secondary/40 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin stroke-[2]" aria-hidden="true" />
            ) : (
              <ArrowUp className="w-3.5 h-3.5 stroke-[2.25]" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
