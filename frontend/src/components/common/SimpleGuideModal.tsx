import React from 'react';
import { X, FileSpreadsheet, LayoutTemplate, Move, Download, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';

interface SimpleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSample: () => void;
}

export const SimpleGuideModal: React.FC<SimpleGuideModalProps> = ({
  isOpen,
  onClose,
  onLoadSample
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-xl border border-slate-200/90 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold mb-1 border border-slate-200">
              Quick Guide
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Simple Guide
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {/* Step 1 */}
          <div className="flex items-start space-x-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              1
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Upload Excel Bill</h4>
              <p className="text-xs text-slate-500 mt-0.5">Select one or more Excel files from your computer.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              2
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Choose Letterhead</h4>
              <p className="text-xs text-slate-500 mt-0.5">Pick the company letterhead design.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              3
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Position Bill</h4>
              <p className="text-xs text-slate-500 mt-0.5">Use the arrow buttons to position the text cleanly.</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start space-x-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              4
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Signature & Date</h4>
              <p className="text-xs text-slate-500 mt-0.5">Select a signature or skip if not needed.</p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex items-start space-x-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              5
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Download PDF</h4>
              <p className="text-xs text-slate-500 mt-0.5">Click Create PDF to save your completed document.</p>
            </div>
          </div>
        </div>

        {/* Practice Test Invitation */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-blue-950 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-blue-700" />
              <span>Practice without your own files</span>
            </p>
            <p className="text-xs text-blue-800 mt-0.5">
              Load a realistic commercial invoice to see how the whole process works.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onLoadSample();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold transition-colors shrink-0 shadow-xs"
          >
            Load Sample Bill
          </button>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5 active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Got it, let's start</span>
          </button>
        </div>
      </div>
    </div>
  );
};
