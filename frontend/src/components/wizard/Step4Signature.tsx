import React, { useRef } from 'react';
import { Signature, SignaturePlacement, SheetPreviewData } from '../../types';
import { LivePreview } from '../preview/LivePreview';
import {
  Plus,
  Check,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  PenTool,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Sliders,
  Calendar
} from 'lucide-react';

interface Step4SignatureProps {
  signatures: Signature[];
  signaturePlacement: SignaturePlacement | null;
  onChangeSignature: (placement: SignaturePlacement | null) => void;
  onUploadSignature: (file: File, name: string) => void;
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

  onBack: () => void;
  onContinue: () => void;

  // Backwards compatibility
  annotations?: any[];
  onAddAnnotation?: any;
  onUpdateAnnotation?: any;
  onDeleteAnnotation?: any;
  blocks?: any[];
  onUpdateBlock?: any;
}

export const Step4Signature: React.FC<Step4SignatureProps> = ({
  signatures,
  signaturePlacement,
  onChangeSignature,
  onUploadSignature,
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
  onBack,
  onContinue
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSig = signatures.find((s) => s.id === signaturePlacement?.signature_id);

  const getTodayFormatted = (fmt = 'dots') => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    if (fmt === 'slashes') return `${dd}/${mm}/${yyyy}`;
    if (fmt === 'date_dots') return `Date: ${dd}.${mm}.${yyyy}`;
    if (fmt === 'date_slashes') return `Date: ${dd}/${mm}/${yyyy}`;
    return `${dd}.${mm}.${yyyy}`;
  };

  const handleSelectSignature = (sigId: string) => {
    if (signaturePlacement?.signature_id === sigId) return;
    onChangeSignature({
      signature_id: sigId,
      page: 'last',
      x: 395,
      y: 645,
      width: 140,
      height: 65,
      opacity: 1.0,
      rotation: 0,
      include_date: true,
      date_text: getTodayFormatted('dots')
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const name = file.name.replace(/\.[^/.]+$/, '');
      onUploadSignature(file, name);
    }
  };

  const handleUpdatePlacement = (partial: Partial<SignaturePlacement>) => {
    if (!signaturePlacement) return;
    onChangeSignature({
      ...signaturePlacement,
      ...partial
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              4
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Add Signature (Optional)
            </h2>
          </div>
          <p className="text-sm text-slate-600 mt-1 pl-8">
            Select or upload your signature. You can drag it directly into position or skip if no signature is needed.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
            <span>Upload New Signature (PNG)</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Two-panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Document Preview (7 cols) */}
        <div className="lg:col-span-7 h-[680px]">
          <LivePreview
            previewUrl={previewUrl}
            isLoading={isLoadingPreview}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
            engineName={engineName}
            warning={warning}
            isSignatureMode={true}
            signature={signaturePlacement}
            signatureObj={activeSig}
            onUpdateSignature={handleUpdatePlacement}
            sheetData={sheetData}
            sheetNames={sheetNames}
            activeSheet={activeSheet}
            onSelectSheet={onSelectSheet}
            onSaveCellEdits={onSaveCellEdits}
            isSavingCellEdits={isSavingCellEdits}
          />
        </div>

        {/* Right: Signature Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
          {/* Select Signature */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Select Signature:
              </label>
              {signaturePlacement && (
                <button
                  type="button"
                  onClick={() => onChangeSignature(null)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  Remove Signature
                </button>
              )}
            </div>

            {signatures.length === 0 ? (
              <div className="p-5 text-center bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                <PenTool className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No saved signatures yet</p>
                <p className="text-xs text-slate-400">Upload a transparent PNG signature above, or skip this step.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
                {signatures.map((sig) => {
                  const isSelected = signaturePlacement?.signature_id === sig.id;
                  return (
                    <div
                      key={sig.id}
                      onClick={() => handleSelectSignature(sig.id)}
                      className={`relative p-3 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center bg-white ${
                        isSelected
                          ? 'border-2 border-slate-900 shadow-sm ring-2 ring-slate-900/10'
                          : 'border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="h-14 w-full flex items-center justify-center p-1 bg-slate-50/50 rounded-lg border border-slate-100">
                        <img
                          src={sig.url}
                          alt={sig.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate w-full text-center mt-2">
                        {sig.name}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Placement Shortcuts (If signature active) */}
          {signaturePlacement && (
            <div className="space-y-4 pt-3 border-t border-slate-100">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  1-Click Position:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdatePlacement({ x: 395, y: 645, width: 140, height: 60 })}
                    className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
                  >
                    Bottom-Right (Proprietor Signoff)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdatePlacement({ x: 50, y: 670, width: 140, height: 60 })}
                    className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
                  >
                    Bottom-Left
                  </button>
                </div>
              </div>

              {/* Target Page Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Apply Signature To:
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => handleUpdatePlacement({ page: 'each_bill' })}
                    title="Automatically signs the bottom of each bill"
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all text-center ${
                      signaturePlacement.page === 'each_bill' || signaturePlacement.page === 'each'
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Every Bill
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdatePlacement({ page: 'last' })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all text-center ${
                      signaturePlacement.page === 'last'
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Last Page
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdatePlacement({ page: 'all' })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all text-center ${
                      signaturePlacement.page === 'all'
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Pages
                  </button>
                </div>
              </div>

              {/* Handwritten Date with Signature Section */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-700" />
                    <span>Handwritten Date:</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer space-x-2">
                    <input
                      type="checkbox"
                      checked={signaturePlacement.include_date ?? true}
                      onChange={(e) =>
                        handleUpdatePlacement({
                          include_date: e.target.checked,
                          date_text: signaturePlacement.date_text || getTodayFormatted('dots')
                        })
                      }
                      className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">Write Date with Signature</span>
                  </label>
                </div>

                {(signaturePlacement.include_date ?? true) && (
                  <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 space-y-3">
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">Date Text to Write:</span>
                      <input
                        type="text"
                        value={signaturePlacement.date_text || ''}
                        onChange={(e) => handleUpdatePlacement({ date_text: e.target.value })}
                        placeholder="e.g. 26.10.2026 or Date: 26/10/2026"
                        className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                      />
                    </div>

                    {/* Quick Date Format Buttons */}
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Quick 1-Click Formats:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { label: getTodayFormatted('dots'), val: getTodayFormatted('dots') },
                          { label: getTodayFormatted('slashes'), val: getTodayFormatted('slashes') },
                          { label: getTodayFormatted('date_dots'), val: getTodayFormatted('date_dots') },
                          { label: getTodayFormatted('date_slashes'), val: getTodayFormatted('date_slashes') }
                        ].map((fmt) => (
                          <button
                            key={fmt.val}
                            type="button"
                            onClick={() => handleUpdatePlacement({ date_text: fmt.val })}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                              signaturePlacement.date_text === fmt.val
                                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                            }`}
                          >
                            {fmt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Handwriting Preview Card */}
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center space-y-1">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                        Handwriting Ink Preview
                      </span>
                      <div className="flex flex-col items-center justify-center py-1">
                        {activeSig && (
                          <img
                            src={activeSig.url}
                            alt="Signature preview"
                            className="h-10 object-contain"
                          />
                        )}
                        <span className="font-handwriting text-[#14235A] font-bold text-sm select-none tracking-wide mt-0.5">
                          {signaturePlacement.date_text || getTodayFormatted('dots')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-xs transition-all active:scale-[0.98]"
            >
              <span>{signaturePlacement ? 'Continue to Export' : 'Skip & Finish PDF'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
