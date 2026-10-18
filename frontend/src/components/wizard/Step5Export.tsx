import React, { useState } from 'react';
import { Download, ExternalLink, CheckCircle, ArrowLeft, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { LivePreview } from '../preview/LivePreview';
import { TextAnnotation, SheetPreviewData } from '../../types';

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
      alert(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Step Header */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Step 5: Final Review & PDF Export</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Inspect the finished document. You can still modify cells or add notes in the preview before exporting.
          </p>
        </div>
        {generationResult && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Create Another Bill</span>
          </button>
        )}
      </div>

      {/* Two-panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Document Preview (7 cols) */}
        <div className="lg:col-span-7 h-[680px]">
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
            sheetData={sheetData}
            sheetNames={sheetNames}
            activeSheet={activeSheet}
            onSelectSheet={onSelectSheet}
            onSaveCellEdits={onSaveCellEdits}
            isSavingCellEdits={isSavingCellEdits}
          />
        </div>

        {/* Right: Export Actions (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          {!generationResult ? (
            <>
              {/* Output Filename */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Output Filename
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 pr-12 text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    placeholder="invoice_name"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                    .pdf
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  The generated file will be saved with this name.
                </p>
              </div>

              {/* Quality Guarantees Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Digital PDF Specifications</span>
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span><strong>100% Vector Quality:</strong> Sharp text at any zoom level</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span><strong>Selectable Text:</strong> Clients can highlight, copy, and search numbers</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span><strong>Embedded Letterhead:</strong> Clean vector or high-res pad underlay</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span><strong>Live Edits Included:</strong> All cell modifications and text notes baked in</span>
                  </li>
                </ul>
              </div>

              {/* Generate Action Button */}
              <button
                type="button"
                onClick={handleGenerateClick}
                disabled={isGenerating}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-900 text-white font-bold text-sm hover:bg-blue-800 disabled:opacity-50 transition-all shadow-md flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating High-Quality PDF...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-blue-200" />
                    <span>Generate Professional PDF</span>
                  </>
                )}
              </button>

              <div className="pt-2 flex items-center justify-start">
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Signature</span>
                </button>
              </div>
            </>
          ) : (
            /* Success Card */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">PDF Successfully Generated!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your Excel bill has been digitally printed onto the company letterhead.
                </p>
              </div>

              {/* Metadata Details */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Document Name:</span>
                  <span className="font-semibold text-slate-800">{generationResult.filename}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Total Pages:</span>
                  <span className="font-semibold text-slate-800">{generationResult.page_count}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">File Size:</span>
                  <span className="font-semibold text-slate-800">
                    {(generationResult.file_size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href={generationResult.download_url}
                  download={generationResult.filename}
                  className="w-full py-3 px-4 rounded-xl bg-blue-900 text-white font-bold text-sm hover:bg-blue-800 transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Finished PDF</span>
                </a>

                <a
                  href={generationResult.view_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-all flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open & Inspect in Browser</span>
                </a>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onReset}
                  className="text-xs font-semibold text-blue-900 hover:underline"
                >
                  Convert Another Excel Bill →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
