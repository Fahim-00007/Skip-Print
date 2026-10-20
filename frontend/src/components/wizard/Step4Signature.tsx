import React, { useRef } from 'react';
import { Signature, SignaturePlacement, TextAnnotation, SheetPreviewData, BlockItem } from '../../types';
import { LivePreview } from '../preview/LivePreview';
import { Plus, Check, Trash2, ArrowLeft, ArrowRight, ShieldCheck, PenTool, CheckCircle, ZoomIn, ZoomOut, MoveRight, MoveLeft } from 'lucide-react';

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

  onBack: () => void;
  onContinue: () => void;
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
  onBack,
  onContinue
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSig = signatures.find((s) => s.id === signaturePlacement?.signature_id);

  const handleSelectSignature = (sigId: string) => {
    if (signaturePlacement?.signature_id === sigId) {
      return;
    }
    onChangeSignature({
      signature_id: sigId,
      page: 'last',
      x: 380,
      y: 670,
      width: 140,
      height: 60,
      opacity: 1.0,
      rotation: 0
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

  const handlePresetPosition = (preset: 'bottom_right' | 'bottom_left') => {
    if (!signaturePlacement) return;
    if (preset === 'bottom_right') {
      handleUpdatePlacement({ x: 380, y: 670 });
    } else if (preset === 'bottom_left') {
      handleUpdatePlacement({ x: 60, y: 670 });
    }
  };

  const handleScaleSignature = (delta: number) => {
    if (!signaturePlacement) return;
    const factor = delta > 0 ? 1.15 : 0.85;
    const newWidth = Math.round(signaturePlacement.width * factor);
    const newHeight = Math.round(signaturePlacement.height * factor);
    handleUpdatePlacement({ width: newWidth, height: newHeight });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
              4
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Add Your Signature (Optional)
            </h2>
          </div>
          <p className="text-base text-slate-600 pl-9">
            If you want your signature on the bill, pick it below. If you don't need one, you can skip right to download!
          </p>
        </div>

        {signaturePlacement ? (
          <button
            type="button"
            onClick={() => onChangeSignature(null)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-sm font-bold text-red-700 hover:bg-red-100 transition-colors shadow-2xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>Remove Signature</span>
          </button>
        ) : (
          <div className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200">
            No signature added yet (Optional)
          </div>
        )}
      </div>

      {/* Reassurance Banner */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-sm flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <span className="font-medium">
            <strong>Don't need a signature?</strong> No problem at all! Just click the big button at the bottom to continue directly to your finished PDF.
          </span>
        </div>
      </div>

      {/* Two-panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Document Preview with Draggable Signature (7 cols) */}
        <div className="lg:col-span-7 h-[700px]">
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

        {/* Right: Signature Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          {/* Select Signature */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900">
                1. Select a Saved Signature:
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-1.5 text-xs text-blue-900 hover:text-blue-950 font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload New (PNG)</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".png"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1">
              {signatures.map((sig) => {
                const isSelected = signaturePlacement?.signature_id === sig.id;
                return (
                  <div
                    key={sig.id}
                    onClick={() => handleSelectSignature(sig.id)}
                    className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center bg-slate-50/60 hover:bg-slate-50 ${
                      isSelected
                        ? 'border-blue-900 ring-4 ring-blue-900/15 bg-blue-50/40'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="h-16 w-full flex items-center justify-center p-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
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
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Placement & Size Buttons */}
          {signaturePlacement ? (
            <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-200">
                2. Position & Size of Signature:
              </h4>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700">Quick 1-Click Placement:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handlePresetPosition('bottom_right')}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-300 text-slate-800 font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5"
                  >
                    <MoveRight className="w-4 h-4 text-blue-900" />
                    <span>Bottom-Right (Standard)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetPosition('bottom_left')}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-300 text-slate-800 font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5"
                  >
                    <MoveLeft className="w-4 h-4 text-blue-900" />
                    <span>Bottom-Left</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-700">Signature Size:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleScaleSignature(-1)}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-300 text-slate-800 font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5"
                  >
                    <ZoomOut className="w-4 h-4 text-slate-600" />
                    <span>Make Smaller</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleScaleSignature(1)}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-300 text-slate-800 font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5"
                  >
                    <ZoomIn className="w-4 h-4 text-slate-600" />
                    <span>Make Bigger</span>
                  </button>
                </div>
              </div>

              {/* Target Page */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Show signature on:</span>
                <select
                  value={signaturePlacement.page}
                  onChange={(e) => handleUpdatePlacement({ page: e.target.value })}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-800"
                >
                  <option value="last">Last Page Only (Normal)</option>
                  <option value="all">Every Page</option>
                  <option value="1">Page 1</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-200 text-center space-y-2">
              <PenTool className="w-8 h-8 text-blue-900 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No Signature Selected</p>
              <p className="text-xs text-slate-600">
                You can select one of the saved signatures above, or simply click the button below to continue without a signature.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Layout</span>
            </button>

            <button
              type="button"
              onClick={onContinue}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl bg-blue-900 text-white text-base font-extrabold hover:bg-blue-800 shadow-md hover:shadow-lg transition-all"
            >
              <span>{signaturePlacement ? 'Continue to Final Review' : 'Skip & Finish PDF (No Signature)'}</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
