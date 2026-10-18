import React from 'react';
import { LayoutSettings, Template, TextAnnotation, SheetPreviewData } from '../../types';
import { LivePreview } from '../preview/LivePreview';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

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

  onBack: () => void;
  onContinue: () => void;
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
  onBack,
  onContinue
}) => {
  const handleResetToTemplate = () => {
    if (!selectedTemplate) return;
    onChangeLayout({
      margin_top: selectedTemplate.margin_top,
      margin_bottom: selectedTemplate.margin_bottom,
      margin_left: selectedTemplate.margin_left,
      margin_right: selectedTemplate.margin_right,
      scale_factor: 1.0,
      offset_x: 0,
      offset_y: 0,
      paper_size: (selectedTemplate.paper_size as any) || 'A4',
      orientation: (selectedTemplate.orientation as any) || 'portrait'
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Step Header */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Step 3: Bill Layout & Alignment</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Preview the bill positioned over the letterhead. You can adjust margins, add custom text notes, or switch to "Edit Bill Cells" to modify invoice data.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleResetToTemplate}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            title="Reset layout to template default margins"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>
        </div>
      </div>

      {/* Two-panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Document Preview & Cell Editor (7 cols) */}
        <div className="lg:col-span-7 h-[680px]">
          <LivePreview
            previewUrl={previewUrl}
            isLoading={isLoadingPreview}
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

        {/* Right: Layout Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          {/* Layout Mode */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Layout Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeLayout({ layout_mode: 'fit_pad' })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  layout.layout_mode === 'fit_pad'
                    ? 'border-blue-900 bg-blue-50/60 ring-2 ring-blue-900/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-xs text-slate-900">Fit to Company Pad</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Positions bill inside reserved printable area below header & above footer.
                </div>
              </button>

              <button
                type="button"
                onClick={() => onChangeLayout({ layout_mode: 'preserve' })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  layout.layout_mode === 'preserve'
                    ? 'border-blue-900 bg-blue-50/60 ring-2 ring-blue-900/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-xs text-slate-900">Preserve Excel Setup</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Maintains Excel original margins and pagination.
                </div>
              </button>
            </div>
          </div>

          {/* Margins */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Printable Margins (Points)
              </label>
              <span className="text-[11px] text-slate-400">72pt = 1 inch</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Top Margin (Header):</span>
                  <span className="font-semibold text-slate-800">{layout.margin_top}pt</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="5"
                  value={layout.margin_top}
                  onChange={(e) => onChangeLayout({ margin_top: Number(e.target.value) })}
                  className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Bottom Margin (Footer):</span>
                  <span className="font-semibold text-slate-800">{layout.margin_bottom}pt</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="150"
                  step="5"
                  value={layout.margin_bottom}
                  onChange={(e) => onChangeLayout({ margin_bottom: Number(e.target.value) })}
                  className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Left Margin:</span>
                  <span className="font-semibold text-slate-800">{layout.margin_left}pt</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="2"
                  value={layout.margin_left}
                  onChange={(e) => onChangeLayout({ margin_left: Number(e.target.value) })}
                  className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Right Margin:</span>
                  <span className="font-semibold text-slate-800">{layout.margin_right}pt</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="2"
                  value={layout.margin_right}
                  onChange={(e) => onChangeLayout({ margin_right: Number(e.target.value) })}
                  className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Scale & Offset Tuning */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Scale & Position Tuning
            </label>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Content Scaling:</span>
                <span className="font-semibold text-slate-800">{Math.round(layout.scale_factor * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={layout.scale_factor}
                onChange={(e) => onChangeLayout({ scale_factor: Number(e.target.value) })}
                className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs text-slate-600 block mb-1">Nudge X (pt):</label>
                <input
                  type="number"
                  value={layout.offset_x}
                  onChange={(e) => onChangeLayout({ offset_x: Number(e.target.value) })}
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 block mb-1">Nudge Y (pt):</label>
                <input
                  type="number"
                  value={layout.offset_y}
                  onChange={(e) => onChangeLayout({ offset_y: Number(e.target.value) })}
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Multi-page options */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Multi-page Options
            </label>
            <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={layout.repeat_letterhead}
                onChange={(e) => onChangeLayout({ repeat_letterhead: e.target.checked })}
                className="rounded text-blue-900 focus:ring-blue-800 h-4 w-4"
              />
              <span className="font-medium">Repeat letterhead background on all pages</span>
            </label>
          </div>

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
              <span>Continue to Signature</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
