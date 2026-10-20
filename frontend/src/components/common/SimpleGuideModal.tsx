import React from 'react';
import { X, FileSpreadsheet, LayoutTemplate, Sliders, Download, CheckCircle, Sparkles, ShieldCheck } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              Simple Beginner's Guide
            </span>
            <h2 className="text-2xl font-bold text-slate-900">
              How BillCraft Works in 4 Easy Steps
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              You do not need to be a computer expert. Follow these simple steps to make your PDF:
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close Guide"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
              1
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-800" />
                <span>Select Your Excel Bill</span>
              </h4>
              <p className="text-sm text-slate-600">
                Click the big blue box on your screen to find your Excel file (.xlsx or .xls) on your computer.
              </p>
              <p className="text-xs text-emerald-700 font-semibold flex items-center space-x-1 pt-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Your original Excel file is 100% safe and will never be modified or deleted.</span>
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
              2
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <LayoutTemplate className="w-5 h-5 text-blue-800" />
                <span>Choose Your Company Letterhead</span>
              </h4>
              <p className="text-sm text-slate-600">
                Click on the picture of the company pad you want. BillCraft will place your bill directly on top of your company logo and header.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
              3
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-blue-800" />
                <span>Check the Preview & Adjust Position</span>
              </h4>
              <p className="text-sm text-slate-600">
                Look at the picture on the left side of your screen. If your bill text is too high or covers your logo, simply click the <strong>"Move Down"</strong> button until it looks just right!
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
              4
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Download className="w-5 h-5 text-emerald-700" />
                <span>Click "Download PDF" — That's It!</span>
              </h4>
              <p className="text-sm text-slate-600">
                Click the big green download button. Your finished professional PDF is saved directly to your computer, ready to email to clients or print.
              </p>
            </div>
          </div>
        </div>

        {/* Practice Test Invitation */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-amber-900 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Want to practice first without your own files?</span>
            </p>
            <p className="text-xs text-amber-800">
              You can load a test bill with 1 click to see how easy it is!
            </p>
          </div>
          <button
            onClick={() => {
              onClose();
              onLoadSample();
            }}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shrink-0 shadow-xs"
          >
            Try Practice Test Bill
          </button>
        </div>

        {/* Bottom Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>I Understand, Let's Start!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
