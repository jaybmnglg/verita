import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage } from "@/types/chat";
import { CitationCard } from "./CitationCard";
import {
  AlertCircle,
  Check,
  HelpCircle,
  ListTodo,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface MessageItemProps {
  message: ChatMessage;
  onRetry?: (text: string) => void;
  previousQuestionText?: string;
  onSendAction?: (actionText: string) => void;
}

/**
 * Interactive checklist task item that can be toggled by the user.
 */
const TaskListItem: React.FC<{
  checked?: boolean;
  children: React.ReactNode;
}> = ({ checked = false, children }) => {
  const [isChecked, setIsChecked] = useState(checked);

  return (
    <li
      onClick={() => setIsChecked((prev) => !prev)}
      className="list-none flex items-start space-x-3 p-3 my-1.5 rounded-[9px] border border-border/80 bg-surface/90 hover:bg-ivory/60 hover:border-burgundy/40 cursor-pointer transition-all duration-150 select-none group shadow-[0_1px_2px_rgba(0,0,0,0.02)] active:scale-[0.995]"
    >
      <div
        className={`w-5 h-5 rounded-[5px] border shrink-0 mt-0.5 flex items-center justify-center transition-all duration-150 ${
          isChecked
            ? "bg-burgundy border-burgundy text-white shadow-sm"
            : "bg-surface border-border group-hover:border-burgundy/60"
        }`}
      >
        {isChecked && <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />}
      </div>
      <div
        className={`flex-1 text-[14px] sm:text-[15px] leading-[22px] tracking-[-0.1px] transition-all duration-150 ${
          isChecked ? "line-through text-secondary/60" : "text-primary"
        }`}
      >
        {children}
      </div>
    </li>
  );
};

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onRetry,
  previousQuestionText,
  onSendAction,
}) => {
  if (message.sender === "user") {
    return (
      <div className="flex flex-col items-end my-3 sm:my-4">
        <span className="text-[12px] font-[510] text-secondary tracking-[-0.08px] mb-1 mr-1">You</span>
        <div className="max-w-[88%] sm:max-w-[78%] bg-surface-secondary text-primary px-4 py-2.5 rounded-[9px] border border-border text-[15px] leading-[24px] tracking-[-0.165px] break-words">
          {message.text}
        </div>
      </div>
    );
  }

  // Pre-normalize bare checklist lines (e.g. `[ ] Step 1:` -> `- [ ] Step 1:`)
  const normalizedText = message.text.replace(/^(\s*)\[([ xX])\]/gm, "$1- [$2]");

  const hasChecklistOffer =
    onSendAction &&
    normalizedText.toLowerCase().includes("checklist") &&
    (normalizedText.toLowerCase().includes("would you like") ||
      normalizedText.toLowerCase().includes("do you want"));

  return (
    <div className="flex flex-col items-start my-3 sm:my-4">
      <div className="flex items-center space-x-1.5 mb-1.5 ml-0.5">
        <span className="text-[13px] font-[510] tracking-[0px] text-primary">Verita</span>
        <span className="text-[13px] text-secondary tracking-[-0.08px]">• Handbook Assistant</span>
      </div>

      <div className="w-full max-w-[96%] sm:max-w-[92%] bg-surface rounded-[9px] border border-border p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Loading State */}
        {message.status === "loading" && (
          <div className="flex items-center space-x-3 text-secondary py-1.5">
            <Loader2 className="w-4 h-4 animate-spin text-burgundy shrink-0 stroke-[2]" aria-hidden="true" />
            <span className="text-[14px] leading-[20px] tracking-[-0.12px] font-normal">
              Searching handbook and preparing your answer...
            </span>
          </div>
        )}

        {/* Insufficient Information State */}
        {message.status === "insufficient_evidence" && (
          <div className="space-y-3">
            <div className="flex items-start space-x-2.5 text-secondary">
              <HelpCircle className="w-4 h-4 text-gold shrink-0 mt-0.5 stroke-[1.75]" aria-hidden="true" />
              <div className="text-[15px] leading-[24px] tracking-[-0.165px] text-primary">
                {message.text}
              </div>
            </div>
            <div className="text-[13px] leading-[18px] text-secondary bg-ivory rounded-[9px] p-3 border border-border">
              Note: Verita answers based on documented student handbook policies. For matters not documented in the handbook, please visit or contact the Office of the University Registrar or Student Affairs.
            </div>
          </div>
        )}

        {/* Technical Error State */}
        {message.status === "error" && (
          <div className="space-y-3">
            <div className="flex items-start space-x-2.5 text-burgundy">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 stroke-[1.75]" aria-hidden="true" />
              <div className="text-[15px] leading-[24px] tracking-[-0.165px] font-normal">
                {message.text || "Something went wrong while preparing your answer. Please try again."}
              </div>
            </div>

            {message.errorMessage && (
              <p className="text-[13px] leading-[18px] text-secondary bg-burgundy/5 p-2.5 rounded-[4px] border border-burgundy/15 font-mono">
                {message.errorMessage}
              </p>
            )}

            {onRetry && previousQuestionText && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => onRetry(previousQuestionText)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-burgundy text-white hover:bg-burgundy-pressed text-[13px] font-[510] tracking-[-0.08px] transition-all active:scale-[0.98] shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5 stroke-[1.75]" aria-hidden="true" />
                  <span>Retry question</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Completed Regular Answer */}
        {message.status === "complete" && (
          <div className="space-y-4">
            <div className="text-[15px] leading-[24px] tracking-[-0.165px] text-primary break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  ul: ({ className, children }) => {
                    if (className?.includes("contains-task-list")) {
                      return (
                        <div className="my-3.5 p-3 rounded-[9px] bg-ivory/50 border border-border/80 space-y-1.5">
                          <div className="flex items-center space-x-1.5 text-[12px] font-[510] text-secondary tracking-[-0.08px] mb-2 px-1">
                            <ListTodo className="w-3.5 h-3.5 text-burgundy stroke-[1.75]" />
                            <span>Procedure Checklist (Click items to check off)</span>
                          </div>
                          <ul className="list-none pl-0 space-y-1.5">{children}</ul>
                        </div>
                      );
                    }
                    return <ul className="list-disc list-outside ml-5 my-2 space-y-1">{children}</ul>;
                  },
                  ol: ({ className, children }) => {
                    if (className?.includes("contains-task-list")) {
                      return (
                        <div className="my-3.5 p-3 rounded-[9px] bg-ivory/50 border border-border/80 space-y-1.5">
                          <div className="flex items-center space-x-1.5 text-[12px] font-[510] text-secondary tracking-[-0.08px] mb-2 px-1">
                            <ListTodo className="w-3.5 h-3.5 text-burgundy stroke-[1.75]" />
                            <span>Procedure Checklist (Click items to check off)</span>
                          </div>
                          <ol className="list-none pl-0 space-y-1.5">{children}</ol>
                        </div>
                      );
                    }
                    return <ol className="list-decimal list-outside ml-5 my-2 space-y-1">{children}</ol>;
                  },
                  li: ({ className, children, ...props }) => {
                    if (className?.includes("task-list-item")) {
                      const isChecked = (props as unknown as { checked?: boolean }).checked || false;
                      return <TaskListItem checked={isChecked}>{children}</TaskListItem>;
                    }
                    return <li className="leading-[24px] pl-1">{children}</li>;
                  },
                  input: ({ type }) => {
                    // Hide raw disabled HTML checkbox so our custom interactive checkbox handles it
                    if (type === "checkbox") return null;
                    return <input type={type} />;
                  },
                  p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-[24px]">{children}</p>,
                  h1: ({ children }) => <h1 className="text-[17px] font-semibold text-primary mt-3.5 mb-2 tracking-[-0.2px]">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-[16px] font-semibold text-primary mt-3 mb-1.5 tracking-[-0.15px]">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-[15px] font-semibold text-primary mt-2.5 mb-1 tracking-[-0.1px]">{children}</h3>,
                  strong: ({ children }) => <strong className="font-[600] text-primary">{children}</strong>,
                  em: ({ children }) => <em className="italic text-primary">{children}</em>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-burgundy/40 pl-3.5 my-2 text-secondary italic">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="text-[13px] bg-surface-secondary px-1.5 py-0.5 rounded text-primary font-mono border border-border">
                      {children}
                    </code>
                  ),
                }}
              >
                {normalizedText}
              </ReactMarkdown>
            </div>

            {/* Quick Action Button for Checklist Offer */}
            {hasChecklistOffer && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => onSendAction("Yes, please generate the step-by-step checklist.")}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-burgundy/10 hover:bg-burgundy text-burgundy hover:text-white text-[12px] font-[510] transition-colors border border-burgundy/20 active:scale-95 shadow-sm"
                >
                  <ListTodo className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span>Generate step-by-step checklist</span>
                </button>
              </div>
            )}

            {/* Citations section */}
            {message.citations && message.citations.length > 0 && (
              <div className="pt-3.5 border-t border-border space-y-2.5">
                <span className="text-[13px] font-[510] text-secondary tracking-[0px] block">
                  Handbook Source{message.citations.length > 1 ? "s" : ""}
                </span>
                <div className="space-y-2">
                  {message.citations.map((citation) => (
                    <CitationCard key={citation.id} citation={citation} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
