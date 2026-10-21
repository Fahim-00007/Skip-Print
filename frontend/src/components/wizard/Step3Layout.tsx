import React from 'react';
import { LayoutSettings, Template, SheetPreviewData } from '../../types';
import { LivePreview } from '../preview/LivePreview';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft as ArrowL,
  ArrowRight as ArrowR,
  ZoomIn,
  ZoomOut,
  Move,
  FileText,
  Building2,
  Minimize2,
  CheckCircle2
} from 'lucide-react';

interface Step3LayoutProps {
  layout: LayoutSettings;
  onChangeLayout: (newLayout: Partial<LayoutSettings>) => void;
  selectedTemplate: Template | null;
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

  // Deprecated backwards compatibility
  annotations?: any[];
  onAddAnnotation?: any;
  onUpdateAnnotation?: any;
  onDeleteAnnotation?: any;
  blocks?: any[];
  onUpdateBlock?: any;
}

export const Step3Layout: React.FC<Step3LayoutProps> = ({
  layout,
  onChangeLayout,
  selectedTemplate,
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
  const handleResetToTemplate = () => {
    if (!selectedTemplate) return;
    onChangeLayout({
      margin_top: selectedTemplate.margin_top || 105.0,
      margin_bottom: selectedTemplate.margin_bottom || 65.0,
      margin_left: selectedTemplate.margin_left || 36.0,
      margin_right: selectedTemplate.margin_right || 36.0,
      paper_size: (selectedTemplate.paper_size as any) || 'A4',
      orientation: (selectedTemplate.orientation as any) || 'portrait',
      scale_factor: 1.0,
      offset_x: 0,
      offset_y: 0
    });
  };

  const handleNudge = (direction: 'up' | 'down' | 'left' | 'right', amount: number = 12) => {
    if (direction === 'up') onChangeLayout({ offset_y: layout.offset_y - amount });
    if (direction === 'down') onChangeLayout({ offset_y: layout.offset_y + amount });
    if (direction === 'left') onChangeLayout({ offset_x: layout.offset_x - amount });
    if (direction === 'right') onChangeLayout({ offset_x: layout.offset_x + amount });
  };

  const handleScale = (delta: number) => {
    const nextScale = Math.min(1.4, Math.max(0.6, Math.round((layout.scale_factor + delta) * 100) / 100));
    onChangeLayout({ scale_factor: nextScale });
  };

  const handleResetPosition = () => {
    onChangeLayout({ offset_x: 0, offset_y: 0, scale_factor: 1.0 });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              3
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Position Bill on Letterhead
            </h2>
          </div>
          <p className="text-sm text-slate-600 mt-1 pl-8">
            Check the live preview. Use the position controls to place the bill cleanly without covering your company logo or footer.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetToTemplate}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shrink-0 shadow-2xs active:scale-[0.98]"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Defaults</span>
        </button>
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
            sheetData={sheetData}
            sheetNames={sheetNames}
            activeSheet={activeSheet}
            onSelectSheet={onSelectSheet}
            onSaveCellEdits={onSaveCellEdits}
            isSavingCellEdits={isSavingCellEdits}
          />
        </div>

        {/* Right: Position Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
          {/* Presets */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Quick Positions:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onChangeLayout({ margin_top: 105.0, offset_x: 0, offset_y: 0, scale_factor: 1.0 })}
                className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold text-center transition-all shadow-2xs active:scale-[0.98] flex flex-col items-center space-y-1"
              >
                <FileText className="w-4 h-4 text-slate-600" />
                <span>SGS Standard Pad</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeLayout({ margin_top: 145.0, offset_x: 0, offset_y: 0, scale_factor: 1.0 })}
                className="py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-900 text-xs font-semibold text-center transition-all shadow-2xs active:scale-[0.98] flex flex-col items-center space-y-1"
              >
                <Building2 className="w-4 h-4 text-blue-700" />
                <span>Tall Header Space</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeLayout({ scale_factor: 0.90, offset_x: 0, offset_y: 0 })}
                className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold text-center transition-all shadow-2xs active:scale-[0.98] flex flex-col items-center space-y-1"
              >
                <Minimize2 className="w-4 h-4 text-slate-600" />
                <span>Compact (90%)</span>
              </button>
            </div>
          </div>

          {/* Directional Pad */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Move className="w-3.5 h-3.5 text-slate-600" />
                <span>Nudge Position:</span>
              </label>
              <span className="text-[11px] text-slate-400">
                12pt per click
              </span>
            </div>

            <div className="flex flex-col items-center space-y-2 py-2">
              {/* Up Button */}
              <button
                type="button"
                onClick={() => handleNudge('up')}
                className="w-32 py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-all shadow-xs flex items-center justify-center space-x-1.5 active:scale-[0.97]"
                title="Move bill higher on the page"
              >
                <ArrowUp className="w-4 h-4 text-slate-700" />
                <span>Move Up</span>
              </button>

              {/* Middle Row */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleNudge('left')}
                  className="w-28 py-2.5 px-3 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-all shadow-xs flex items-center justify-center space-x-1.5 active:scale-[0.97]"
                  title="Move bill left"
                >
                  <ArrowL className="w-4 h-4 text-slate-700" />
                  <span>Left</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetPosition}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all shadow-2xs active:scale-[0.97]"
                  title="Reset to center"
                >
                  Center
                </button>

                <button
                  type="button"
                  onClick={() => handleNudge('right')}
                  className="w-28 py-2.5 px-3 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-all shadow-xs flex items-center justify-center space-x-1.5 active:scale-[0.97]"
                  title="Move bill right"
                >
                  <span>Right</span>
                  <ArrowR className="w-4 h-4 text-slate-700" />
                </button>
              </div>

              {/* Down Button */}
              <button
                type="button"
                onClick={() => handleNudge('down')}
                className="w-32 py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-all shadow-xs flex items-center justify-center space-x-1.5 active:scale-[0.97]"
                title="Move bill lower on the page"
              >
                <ArrowDown className="w-4 h-4 text-slate-700" />
                <span>Move Down</span>
              </button>
            </div>
          </div>

          {/* Scale Size Stepper */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Bill Scale:
              </label>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {Math.round(layout.scale_factor * 100)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleScale(-0.05)}
                className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 transition-all shadow-2xs flex items-center justify-center space-x-1.5 active:scale-[0.98]"
              >
                <ZoomOut className="w-3.5 h-3.5 text-slate-600" />
                <span>Smaller (-5%)</span>
              </button>

              <button
                type="button"
                onClick={() => handleScale(0.05)}
                className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 transition-all shadow-2xs flex items-center justify-center space-x-1.5 active:scale-[0.98]"
              >
                <ZoomIn className="w-3.5 h-3.5 text-slate-600" />
                <span>Bigger (+5%)</span>
              </button>
            </div>
          </div>

          {/* Readout Pill */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between font-medium">
            <span>Current Offset:</span>
            <span className="font-mono font-bold text-slate-800">
              X: {layout.offset_x >= 0 ? `+${layout.offset_x}` : layout.offset_x}pt • Y: {layout.offset_y >= 0 ? `+${layout.offset_y}` : layout.offset_y}pt
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
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
              <span>Continue to Signature</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
