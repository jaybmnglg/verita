"use client";

import React, { useEffect } from "react";
import { X, ExternalLink } from "lucide-react";

export interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  page?: string | number;
  title?: string;
  section?: string;
  pdfUrl?: string;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  page,
  title = "Student Handbook 2025–2026",
  pdfUrl = "/student-handbook.pdf",
}) => {
  const parsePageNumber = (rawPage?: string | number): number => {
    if (!rawPage) return 1;
    const match = String(rawPage).match(/\d+/);
    return match ? Math.max(1, parseInt(match[0], 10)) : 1;
  };

  const targetPage = parsePageNumber(page);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pdfSrc = `${pdfUrl}#page=${targetPage}&view=FitH`;

  return (
    <>
      {/* Mobile-only overlay to allow easy dismissal by tapping outside */}
      <div
        className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px] md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Right-Side Slide-Over Handbook Panel */}
      <aside
        role="region"
        aria-label={title}
        className="fixed top-0 right-0 bottom-0 z-40 w-full sm:w-[480px] md:w-[480px] lg:w-[540px] xl:w-[46vw] bg-surface border-l border-border shadow-[-4px_0_24px_rgba(0,0,0,0.08)] flex flex-col animate-in slide-in-from-right duration-300"
      >
        {/* Minimal Header */}
        <header className="px-4 py-2.5 border-b border-border bg-ivory flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="text-[14px] font-[510] text-primary truncate">
              {title}
            </span>
            {page && (
              <span className="text-[12px] font-[510] text-burgundy bg-burgundy/10 px-2.5 py-0.5 rounded-full shrink-0">
                Page {page}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <a
              href={pdfSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-[6px] text-secondary hover:text-burgundy hover:bg-surface-secondary transition-colors"
              title="Open in new tab"
              aria-label="Open PDF in new tab"
            >
              <ExternalLink className="w-4 h-4 stroke-[1.75]" />
            </a>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close handbook panel"
              className="p-1.5 rounded-[6px] text-secondary hover:text-primary hover:bg-surface-secondary transition-colors"
            >
              <X className="w-5 h-5 stroke-[1.75]" />
            </button>
          </div>
        </header>

        {/* Embedded PDF - portrait layout optimized for reading document pages */}
        <div className="flex-1 w-full h-full bg-surface-secondary">
          <iframe
            key={`pdf-${targetPage}`}
            src={pdfSrc}
            title={`${title} - Page ${targetPage}`}
            className="w-full h-full border-0"
          />
        </div>
      </aside>
    </>
  );
};
