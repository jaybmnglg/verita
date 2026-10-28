import React from "react";
import { ChatInput } from "./ChatInput";

interface WelcomeViewProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

interface SuggestionItem {
  label: string;
  query: string;
}

const PHRASE_SUGGESTIONS: SuggestionItem[] = [
  {
    label: "Dean's List & academic honors",
    query: "What are the requirements to qualify for the Dean's List and academic honors?",
  },
  {
    label: "Scholarships & tuition discounts",
    query: "What scholarships, tuition discounts, and grants are available for students?",
  },
  {
    label: "Student rights & campus privileges",
    query: "What student rights and campus privileges are guaranteed in the handbook?",
  },
  {
    label: "Uniform schedule & wash day guidelines",
    query: "What is the schedule for wearing uniforms and wash day attire?",
  },
];

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onSubmit, isLoading }) => {
  return (
    <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 py-10 sm:py-16 max-w-2xl mx-auto w-full">
      {/* Greeting and Informative Subheading */}
      <div className="mb-6">
        <h1 className="text-[30px] sm:text-[44px] font-[510] leading-[38px] sm:leading-[52px] tracking-[-0.03em] sm:tracking-[-1.4px] text-primary mb-2">
          What would you like to know?
        </h1>
        <p className="text-[14px] sm:text-[15px] leading-[22px] tracking-[-0.165px] text-secondary">
          Ask questions about policies, academic guidelines, and student procedures with citations from the handbook.
        </p>
      </div>

      {/* Main Input Box */}
      <div className="w-full">
        <ChatInput
          onSubmit={onSubmit}
          isLoading={isLoading}
          autoFocus={true}
          placeholder="Ask a question about the handbook..."
        />

        {/* Suggested Prompts Hugging Input Box Length */}
        <div className="w-full mt-3.5">
          <div className="text-[12px] font-[510] text-secondary/70 mb-2 px-0.5 select-none">
            Suggested questions
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
            {PHRASE_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => onSubmit(item.query)}
                className="w-full text-left px-3.5 py-2.5 rounded-[9px] border border-border/80 hover:border-burgundy/40 bg-surface hover:bg-surface-secondary/70 text-secondary hover:text-primary transition-all duration-150 active:scale-[0.99] disabled:opacity-50 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-between group"
              >
                <span className="text-[13px] font-[510] leading-[18px] tracking-[0px] truncate">
                  {item.label}
                </span>
                <span className="text-secondary/35 group-hover:text-burgundy transition-colors text-[13px] shrink-0 ml-2">
                  →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
