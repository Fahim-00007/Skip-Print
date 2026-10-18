import React, { useRef } from 'react';
import { Signature, SignaturePlacement, TextAnnotation, SheetPreviewData, BlockItem } from '../../types';
import { LivePreview } from '../preview/LivePreview';
import { Plus, Check, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

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

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Step 4: Add Authorized Signature (Optional)</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Place your transparent PNG signature onto the bill. Drag directly on the document preview to position it.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {signaturePlacement ? (
            <button
              type="button"
              onClick={() => onChangeSignature(null)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Signature</span>
            </button>
          ) : (
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              No signature added (Optional)
            </span>
          )}
        </div>
      </div>

      {/* Two-panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Document Preview with Draggable Signature (7 cols) */}
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
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          {/* Select Signature */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Signature
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-1 text-xs text-blue-800 hover:text-blue-950 font-semibold"
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

            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
              {signatures.map((sig) => {
                const isSelected = signaturePlacement?.signature_id === sig.id;
                return (
                  <div
                    key={sig.id}
                    onClick={() => handleSelectSignature(sig.id)}
                    className={`relative p-2 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-center justify-center bg-slate-50/60 hover:bg-slate-50 ${
                      isSelected
                        ? 'border-blue-900 ring-2 ring-blue-900/20 bg-blue-50/30'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="h-16 w-full flex items-center justify-center p-1 bg-white rounded border border-slate-200/80 shadow-2xs">
                      <img
                        src={sig.url}
                        alt={sig.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-800 truncate w-full text-center mt-1.5">
                      {sig.name}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-900 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Placement Settings */}
          {signaturePlacement && (
            <div className="space-y-4 pt-3 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Placement & Target Page
              </label>

              {/* Target Page */}
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Place Signature On:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdatePlacement({ page: 'last' })}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                      signaturePlacement.page === 'last'
                        ? 'bg-blue-900 text-white border-blue-900 font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Last Page (Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdatePlacement({ page: '1' })}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                      signaturePlacement.page === '1'
                        ? 'bg-blue-900 text-white border-blue-900 font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    First Page
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdatePlacement({ page: 'all' })}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                      signaturePlacement.page === 'all'
                        ? 'bg-blue-900 text-white border-blue-900 font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    All Pages
                  </button>
                </div>
              </div>

              {/* Size Controls */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">Width (pt):</span>
                    <span className="font-semibold text-slate-800">{signaturePlacement.width}</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="250"
                    step="5"
                    value={signaturePlacement.width}
                    onChange={(e) => handleUpdatePlacement({ width: Number(e.target.value) })}
                    className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">Height (pt):</span>
                    <span className="font-semibold text-slate-800">{signaturePlacement.height}</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="150"
                    step="5"
                    value={signaturePlacement.height}
                    onChange={(e) => handleUpdatePlacement({ height: Number(e.target.value) })}
                    className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Opacity & Rotation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">Opacity:</span>
                    <span className="font-semibold text-slate-800">{Math.round(signaturePlacement.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={signaturePlacement.opacity}
                    onChange={(e) => handleUpdatePlacement({ opacity: Number(e.target.value) })}
                    className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">Rotation:</span>
                    <span className="font-semibold text-slate-800">{signaturePlacement.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="5"
                    value={signaturePlacement.rotation}
                    onChange={(e) => handleUpdatePlacement({ rotation: Number(e.target.value) })}
                    className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Numerical fine-tuning */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">X Position (pt):</label>
                  <input
                    type="number"
                    value={signaturePlacement.x}
                    onChange={(e) => handleUpdatePlacement({ x: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">Y Position (pt):</label>
                  <input
                    type="number"
                    value={signaturePlacement.y}
                    onChange={(e) => handleUpdatePlacement({ y: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 shadow-sm transition-all"
            >
              <span>Review & Export PDF</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
