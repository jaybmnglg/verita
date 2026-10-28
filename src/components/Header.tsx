import React from "react";
import { RotateCcw } from "lucide-react";

interface HeaderProps {
  hasMessages: boolean;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ hasMessages, onReset }) => {
  return (
    <header className="w-full border-b border-border bg-ivory/95 backdrop-blur-sm sticky top-0 z-20 transition-all">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="text-[15px] font-[510] tracking-[-0.12px] text-primary">
            Verita
          </span>
          <span className="hidden sm:inline-block text-[13px] text-secondary tracking-[-0.08px] font-normal pl-2.5 border-l border-border/80">
            Student Handbook Assistant
          </span>
        </div>

        {hasMessages && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center space-x-1.5 text-[13px] font-[510] tracking-[-0.08px] text-secondary hover:text-primary px-3.5 py-1.5 rounded-full hover:bg-surface-secondary border border-border/80 hover:border-border transition-all duration-150 active:scale-[0.98]"
            aria-label="Start a new conversation"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[1.75]" aria-hidden="true" />
            <span>New question</span>
          </button>
        )}
      </div>
    </header>
  );
};
