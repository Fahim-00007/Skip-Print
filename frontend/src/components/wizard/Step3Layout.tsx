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
  CheckCircle,
  HelpCircle,
  Move
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

  // Deprecated props retained for zero-breakage interface
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
      margin_bottom: selectedTemplate.margin_bottom || 60.0,
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
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
              3
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Position Your Bill on the Letterhead
            </h2>
          </div>
          <p className="text-base text-slate-600 pl-9">
            Check the preview on the left. Use the large buttons on the right to move or resize the bill so it fits your company paper.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetToTemplate}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors shrink-0 shadow-2xs"
          title="Reset position back to original default"
        >
          <RotateCcw className="w-4 h-4 text-slate-600" />
          <span>Reset to Default</span>
        </button>
      </div>

      {/* Senior-Friendly Quick Instruction Banner */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-sm flex items-start space-x-3">
        <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Simple Check:</span>
          <p className="text-emerald-900 mt-0.5 text-sm">
            Does your company logo at the top have enough room? If the bill is touching the logo, simply press the big <strong>"Move Down"</strong> button or click <strong>"Space for Tall Logo"</strong>.
          </p>
        </div>
      </div>

      {/* Two-panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Document Preview (7 cols) */}
        <div className="lg:col-span-7 h-[700px]">
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

        {/* Right: Big, Senior-Friendly Position Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          {/* Quick 1-Click Placement Presets */}
          <div className="space-y-2.5">
            <label className="text-sm font-bold text-slate-900 block">
              1-Click Quick Positions:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onChangeLayout({ margin_top: 105.0, offset_x: 0, offset_y: 0, scale_factor: 1.0 })}
                className="py-3 px-3 rounded-xl border border-slate-200 hover:border-blue-700 hover:bg-blue-50 text-slate-800 text-xs font-bold text-center transition-all shadow-2xs"
              >
                📄 Standard Position
              </button>

              <button
                type="button"
                onClick={() => onChangeLayout({ margin_top: 145.0, offset_x: 0, offset_y: 0, scale_factor: 1.0 })}
                className="py-3 px-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-950 text-xs font-bold text-center transition-all shadow-2xs"
              >
                🏛️ Space for Tall Logo
              </button>

              <button
                type="button"
                onClick={() => onChangeLayout({ scale_factor: 0.90, offset_x: 0, offset_y: 0 })}
                className="py-3 px-3 rounded-xl border border-slate-200 hover:border-blue-700 hover:bg-blue-50 text-slate-800 text-xs font-bold text-center transition-all shadow-2xs"
              >
                🔍 Compact Bill (90%)
              </button>
            </div>
          </div>

          {/* Directional Pad */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <Move className="w-4 h-4 text-blue-900" />
                <span>Move Bill Position:</span>
              </label>
              <span className="text-xs font-semibold text-slate-500">
                Click arrows to nudge
              </span>
            </div>

            <div className="flex flex-col items-center space-y-2 py-1">
              {/* Up Button */}
              <button
                type="button"
                onClick={() => handleNudge('up')}
                className="w-36 py-3 px-4 bg-slate-100 hover:bg-blue-900 hover:text-white text-slate-900 font-bold text-sm rounded-xl border border-slate-300 transition-all shadow-xs flex items-center justify-center space-x-2"
                title="Move bill higher on the page"
              >
                <ArrowUp className="w-4 h-4" />
                <span>Move Up</span>
              </button>

              {/* Middle Row: Left, Reset, Right */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleNudge('left')}
                  className="w-28 py-3 px-3 bg-slate-100 hover:bg-blue-900 hover:text-white text-slate-900 font-bold text-sm rounded-xl border border-slate-300 transition-all shadow-xs flex items-center justify-center space-x-1.5"
                  title="Move bill to the left"
                >
                  <ArrowL className="w-4 h-4" />
                  <span>Left</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetPosition}
                  className="py-3 px-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all shadow-2xs"
                  title="Center bill back to middle"
                >
                  Center
                </button>

                <button
                  type="button"
                  onClick={() => handleNudge('right')}
                  className="w-28 py-3 px-3 bg-slate-100 hover:bg-blue-900 hover:text-white text-slate-900 font-bold text-sm rounded-xl border border-slate-300 transition-all shadow-xs flex items-center justify-center space-x-1.5"
                  title="Move bill to the right"
                >
                  <span>Right</span>
                  <ArrowR className="w-4 h-4" />
                </button>
              </div>

              {/* Down Button */}
              <button
                type="button"
                onClick={() => handleNudge('down')}
                className="w-36 py-3 px-4 bg-slate-100 hover:bg-blue-900 hover:text-white text-slate-900 font-bold text-sm rounded-xl border border-slate-300 transition-all shadow-xs flex items-center justify-center space-x-2"
                title="Move bill lower on the page to leave room for your letterhead logo"
              >
                <ArrowDown className="w-4 h-4" />
                <span>Move Down</span>
              </button>
            </div>
          </div>

          {/* Scale Size Controls */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900">
                Bill Size (Scale):
              </label>
              <span className="font-extrabold text-blue-900 text-sm">
                {Math.round(layout.scale_factor * 100)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleScale(-0.05)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-all shadow-2xs flex items-center justify-center space-x-1.5"
              >
                <ZoomOut className="w-4 h-4" />
                <span>Make Smaller (-5%)</span>
              </button>

              <button
                type="button"
                onClick={() => handleScale(0.05)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-all shadow-2xs flex items-center justify-center space-x-1.5"
              >
                <ZoomIn className="w-4 h-4" />
                <span>Make Bigger (+5%)</span>
              </button>
            </div>
          </div>

          {/* Position Status Badge */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
            <span className="font-semibold">Current Adjustment:</span>
            <span className="font-mono font-bold text-slate-900">
              X: {layout.offset_x > 0 ? `+${layout.offset_x}` : layout.offset_x}pt | Y: {layout.offset_y > 0 ? `+${layout.offset_y}` : layout.offset_y}pt
            </span>
          </div>

          {/* Bottom Step Navigation */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Letterhead</span>
            </button>

            <button
              type="button"
              onClick={onContinue}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-base shadow-md hover:shadow-lg transition-all"
            >
              <span>Next: Signature (Optional)</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
