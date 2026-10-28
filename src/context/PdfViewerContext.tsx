"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { PdfViewerModal } from "@/components/PdfViewerModal";

export interface OpenPdfOptions {
  page?: string | number;
  title?: string;
  section?: string;
  pdfUrl?: string;
}

interface PdfViewerContextValue {
  openPdf: (options?: OpenPdfOptions) => void;
  closePdf: () => void;
  isOpen: boolean;
  currentPage?: string | number;
}

const PdfViewerContext = createContext<PdfViewerContextValue | undefined>(undefined);

export const PdfViewerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<OpenPdfOptions>({});

  const openPdf = useCallback((opts?: OpenPdfOptions) => {
    setOptions(opts || {});
    setIsOpen(true);
  }, []);

  const closePdf = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <PdfViewerContext.Provider
      value={{
        openPdf,
        closePdf,
        isOpen,
        currentPage: options.page,
      }}
    >
      {children}
      <PdfViewerModal
        isOpen={isOpen}
        onClose={closePdf}
        page={options.page}
        title={options.title}
        section={options.section}
        pdfUrl={options.pdfUrl || "/student-handbook.pdf"}
      />
    </PdfViewerContext.Provider>
  );
};

export const usePdfViewer = (): PdfViewerContextValue => {
  const context = useContext(PdfViewerContext);
  if (!context) {
    throw new Error("usePdfViewer must be used within a PdfViewerProvider");
  }
  return context;
};
