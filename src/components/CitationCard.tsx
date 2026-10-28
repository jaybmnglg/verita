import React from "react";
import { Citation } from "@/types/chat";
import { ExternalLink } from "lucide-react";
import { usePdfViewer } from "@/context/PdfViewerContext";

interface CitationCardProps {
  citation: Citation;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation }) => {
  const { openPdf } = usePdfViewer();

  const handleOpenPdf = () => {
    openPdf({
      page: citation.page,
      title: citation.title || "Student Handbook 2025–2026",
      section: citation.section,
    });
  };

  return (
    <button
      type="button"
      onClick={handleOpenPdf}
      className="w-full text-left px-3.5 py-2.5 rounded-[9px] border border-border bg-ivory/60 hover:bg-surface hover:border-burgundy/40 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-sm flex items-center justify-between gap-3 group focus:outline-none focus-visible:ring-1 focus-visible:ring-burgundy active:scale-[0.99]"
      title={`Open handbook on Page ${citation.page || "1"}`}
    >
      <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
        <span className="font-[510] text-primary text-[13px] leading-tight">
          {citation.title || "Student Handbook"}
        </span>
        {citation.section && (
          <span className="text-secondary text-[12px] truncate">
            • {citation.section}
          </span>
        )}
        {citation.page && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-[510] bg-gold/15 text-primary border border-gold/30">
            Page {citation.page}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-1 shrink-0 text-[12px] font-[510] text-burgundy group-hover:text-burgundy-pressed tracking-[-0.08px]">
        <span>Open PDF</span>
        <ExternalLink className="w-3 h-3 stroke-[2]" aria-hidden="true" />
      </div>
    </button>
  );
};
