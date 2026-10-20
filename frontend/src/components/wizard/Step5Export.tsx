import React, { useState } from 'react';
import {
  Download,
  ExternalLink,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Printer,
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { LivePreview } from '../preview/LivePreview';
import { SheetPreviewData } from '../../types';

interface Step5ExportProps {
  defaultFilename: string;
  previewUrl: string | null;
  isLoadingPreview: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  engineName?: string;
  warning?: string;

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

  // Backwards compatibility
  annotations?: any[];
  onAddAnnotation?: any;
  onUpdateAnnotation?: any;
  onDeleteAnnotation?: any;
  blocks?: any[];
  onUpdateBlock?: any;
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

  const handleDownload = () => {
    if (!generationResult) return;
    const a = document.createElement('a');
    a.href = generationResult.download_url;
    a.download = generationResult.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenNewTab = () => {
    if (!generationResult) return;
    window.open(generationResult.view_url, '_blank');
  };

  const handlePrint = () => {
    if (!generationResult) return;
    const printWindow = window.open(generationResult.view_url, '_blank');
    if (printWindow) {
      printWindow.focus();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              5
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Export Finished PDF
            </h2>
          </div>
          <p className="text-sm text-slate-600 mt-1 pl-8">
            Your bill has been digitally placed onto your company letterhead. You can download or print it now.
          </p>
        </div>

        {generationResult && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-all active:scale-[0.98]"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Start Another Bill</span>
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
            sheetData={sheetData}
            sheetNames={sheetNames}
            activeSheet={activeSheet}
            onSelectSheet={onSelectSheet}
            onSaveCellEdits={onSaveCellEdits}
            isSavingCellEdits={isSavingCellEdits}
          />
        </div>

        {/* Right: Export Actions (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
          {!generationResult ? (
            <>
              {/* Output Filename */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  PDF Filename:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="w-full text-sm font-semibold border border-slate-300 rounded-xl px-3.5 py-2.5 pr-12 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    placeholder="invoice_name"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">
                    .pdf
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  This file will be saved directly into your computer's Downloads folder.
                </p>
              </div>

              {/* Quality Standards Summary */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Quality Guarantees:</span>
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 pl-1">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span><strong>100% Vector Text:</strong> Sharp at any zoom level, looks printed.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span><strong>Selectable:</strong> Numbers and details can be highlighted and copied.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                    <span><strong>Accurate Placement:</strong> Cleanly aligned with your company pad.</span>
                  </li>
                </ul>
              </div>

              {/* Primary Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerateClick}
                  disabled={isGenerating}
                  className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-xs transition-all flex items-center justify-center space-x-2 active:scale-[0.98] disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Finished PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4 text-blue-400" />
                      <span>Create & Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Download Ready State */
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">PDF Ready to Save!</h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    {generationResult.filename} • {(generationResult.file_size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              {/* Main Download Action */}
              <button
                type="button"
                onClick={handleDownload}
                className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-xs transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Save PDF to Computer</span>
              </button>

              {/* Secondary Options */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleOpenNewTab}
                  className="inline-flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>Open in Tab</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print Directly</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Back Button */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Signature</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
