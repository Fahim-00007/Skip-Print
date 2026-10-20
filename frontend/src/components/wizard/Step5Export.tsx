import React, { useState } from 'react';
import { Download, ExternalLink, CheckCircle, ArrowLeft, RefreshCw, Sparkles, ShieldCheck, Printer, FileCheck } from 'lucide-react';
import { LivePreview } from '../preview/LivePreview';
import { TextAnnotation, SheetPreviewData, BlockItem } from '../../types';

interface Step5ExportProps {
  defaultFilename: string;
  previewUrl: string | null;
  isLoadingPreview: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  engineName?: string;
  warning?: string;

  // Text annotations
  annotations?: TextAnnotation[];
  onAddAnnotation?: () => void;
  onUpdateAnnotation?: (id: string, patch: Partial<TextAnnotation>) => void;
  onDeleteAnnotation?: (id: string) => void;

  // Movable Block Groups
  blocks?: BlockItem[];
  onUpdateBlock?: (id: string, patch: Partial<BlockItem>) => void;

  // Sheet data editing
  sheetData?: SheetPreviewData | null;
  sheetNames?: string[];
  activeSheet?: string;
  onSelectSheet?: (name: string) => void;
  onSaveCellEdits?: (updates: { coordinate: string; value: string }[]) => Promise<void>;
  isSavingCellEdits?: boolean;

  onGenerate: (filename: string) => Promise<{
    id: string;
    filename: string;
    download_url: string;
    view_url: string;
    page_count: number;
    file_size: number;
  }>;
  onBack: () => void;
  onReset: () => void;
}

export const Step5Export: React.FC<Step5ExportProps> = ({
  defaultFilename,
  previewUrl,
  isLoadingPreview,
  totalPages,
  currentPage,
  onPageChange,
  engineName,
  warning,
  annotations,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  blocks = [],
  onUpdateBlock,
  sheetData,
  sheetNames,
  activeSheet,
  onSelectSheet,
  onSaveCellEdits,
  isSavingCellEdits,
  onGenerate,
  onBack,
  onReset
}) => {
  const [filename, setFilename] = useState(defaultFilename);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<{
    id: string;
    filename: string;
    download_url: string;
    view_url: string;
    page_count: number;
    file_size: number;
  } | null>(null);

  const handleGenerateClick = async () => {
    setIsGenerating(true);
    try {
      const res = await onGenerate(filename);
      setGenerationResult(res);
    } catch (err: any) {
      alert(`Could not create PDF: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
              5
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Final Review & Download PDF
            </h2>
          </div>
          <p className="text-base text-slate-600 pl-9">
            Inspect the finished document on the left. When you are happy with it, click the button below to get your PDF!
          </p>
        </div>

        {generationResult && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-4 h-4 text-slate-600" />
            <span>Make Another Bill</span>
          </button>
        )}
      </div>

      {/* Two-panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Document Preview (7 cols) */}
        <div className="lg:col-span-7 h-[700px]">
          <LivePreview
            previewUrl={previewUrl}
            isLoading={isLoadingPreview || isGenerating}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
            engineName={engineName}
            warning={warning}
            annotations={annotations}
            onAddAnnotation={onAddAnnotation}
            onUpdateAnnotation={onUpdateAnnotation}
            onDeleteAnnotation={onDeleteAnnotation}
            blocks={blocks}
            onUpdateBlock={onUpdateBlock}
            sheetData={sheetData}
            sheetNames={sheetNames}
            activeSheet={activeSheet}
            onSelectSheet={onSelectSheet}
            onSaveCellEdits={onSaveCellEdits}
            isSavingCellEdits={isSavingCellEdits}
          />
        </div>

        {/* Right: Export Actions (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
          {!generationResult ? (
            <>
              {/* Output Filename */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 block">
                  Name for your PDF file:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="w-full text-base font-bold border-2 border-slate-300 rounded-xl px-4 py-3 pr-14 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="my_invoice"
                  />
                  <span className="absolute right-4 top-3.5 text-sm font-bold text-slate-400">
                    .pdf
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  This will be the file name when saved to your computer.
                </p>
              </div>

              {/* Quality & Reassurance Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span>Quality Guarantees:</span>
                </h4>
                <ul className="text-xs sm:text-sm text-slate-700 space-y-2">
                  <li className="flex items-center space-x-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    <span><strong>Crystal-Clear Text:</strong> Sharp at any zoom level, looks just like real printing.</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    <span><strong>Selectable & Searchable:</strong> Clients can highlight, copy, and search numbers.</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    <span><strong>Exact Company Letterhead:</strong> Placed cleanly behind your bill.</span>
                  </li>
                </ul>
              </div>

              {/* Giant Generate Button */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleGenerateClick}
                  disabled={isGenerating}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-3 active:scale-[0.98] disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Your PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-6 h-6 text-emerald-200" />
                      <span>Create & Download PDF</span>
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-slate-500">
                  Takes less than 1 second. You can inspect it before sharing.
                </p>
              </div>

              {/* Back Button */}
              <div className="pt-2 flex items-center justify-start">
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center space-x-2 text-sm font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Signature</span>
                </button>
              </div>
            </>
          ) : (
            /* Success Card - Extremely Clear for Senior Users */
            <div className="space-y-6 text-center py-4">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle className="w-12 h-12 stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Success! Your PDF is Ready.
                </h3>
                <p className="text-sm text-slate-600">
                  Your Excel bill has been digitally printed onto your company letterhead.
                </p>
              </div>

              {/* File Info */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Document Name:</span>
                  <span className="font-bold text-slate-900">{generationResult.filename}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Total Pages:</span>
                  <span className="font-bold text-slate-900">{generationResult.page_count} Page{generationResult.page_count > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">File Size:</span>
                  <span className="font-bold text-slate-900">
                    {(generationResult.file_size / 1024).toFixed(1)} KB (Fast to email)
                  </span>
                </div>
              </div>

              {/* Primary Action: Huge Green Download Button */}
              <div className="space-y-3 pt-2">
                <a
                  href={generationResult.download_url}
                  download={generationResult.filename}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-3 active:scale-[0.98]"
                >
                  <Download className="w-6 h-6 text-emerald-200" />
                  <span>📥 Save PDF to My Computer</span>
                </a>

                <a
                  href={generationResult.view_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-6 rounded-2xl border-2 border-slate-300 text-slate-800 font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center space-x-2"
                >
                  <Printer className="w-5 h-5 text-slate-600" />
                  <span>Open PDF in New Tab / Print</span>
                </a>
              </div>

              {/* Start Over Button */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex items-center space-x-1.5 text-sm font-bold text-blue-900 hover:underline"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Convert Another Excel Bill →</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
