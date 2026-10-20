import React, { useState } from 'react';
import { LayoutSettings, Template, TextAnnotation, SheetPreviewData, BlockItem } from '../../types';
import { LivePreview } from '../preview/LivePreview';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Table,
  Calendar,
  UserCheck,
  CreditCard,
  ArrowUp,
  ArrowDown,
  ArrowLeft as ArrowL,
  ArrowRight as ArrowR,
  ZoomIn,
  ZoomOut,
  Sliders,
  CheckCircle,
  HelpCircle,
  Layers
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
  const [controlMode, setControlMode] = useState<'entire' | 'section'>('entire');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('table');
  const [showAdvancedSliders, setShowAdvancedSliders] = useState<boolean>(false);

  const handleResetToTemplate = () => {
    if (!selectedTemplate) return;
    onChangeLayout({
      margin_top: selectedTemplate.margin_top,
      margin_bottom: selectedTemplate.margin_bottom,
      margin_left: selectedTemplate.margin_left,
      margin_right: selectedTemplate.margin_right,
      paper_size: (selectedTemplate.paper_size as any) || 'A4',
      orientation: (selectedTemplate.orientation as any) || 'portrait',
      scale_factor: 1.0,
      offset_x: 0,
      offset_y: 0
    });
    if (onUpdateBlock) {
      blocks.forEach((b) => {
        onUpdateBlock(b.id, { dx: 0, dy: 0, scale: 1.0 });
      });
    }
  };

  const groupOptions = [
    { id: 'table', label: 'Item Table', desc: 'Prices & items', icon: Table },
    { id: 'bill_meta', label: 'Bill # & Date', desc: 'Invoice number', icon: Calendar },
    { id: 'client_info', label: 'Customer Details', desc: 'Billed to', icon: UserCheck },
    { id: 'bank_notes', label: 'Bank Details', desc: 'Payment notes', icon: CreditCard },
  ];

  const activeBlockCfg = blocks.find((b) => b.id === selectedGroupId) || { dx: 0, dy: 0, scale: 1.0 };

  // Easy Nudge Handlers
  const handleNudge = (direction: 'up' | 'down' | 'left' | 'right', amount: number = 10) => {
    if (controlMode === 'entire') {
      if (direction === 'up') onChangeLayout({ offset_y: layout.offset_y - amount });
      if (direction === 'down') onChangeLayout({ offset_y: layout.offset_y + amount });
      if (direction === 'left') onChangeLayout({ offset_x: layout.offset_x - amount });
      if (direction === 'right') onChangeLayout({ offset_x: layout.offset_x + amount });
    } else if (onUpdateBlock) {
      if (direction === 'up') onUpdateBlock(selectedGroupId, { dy: activeBlockCfg.dy - amount });
      if (direction === 'down') onUpdateBlock(selectedGroupId, { dy: activeBlockCfg.dy + amount });
      if (direction === 'left') onUpdateBlock(selectedGroupId, { dx: activeBlockCfg.dx - amount });
      if (direction === 'right') onUpdateBlock(selectedGroupId, { dx: activeBlockCfg.dx + amount });
    }
  };

  const handleScale = (delta: number) => {
    if (controlMode === 'entire') {
      const nextScale = Math.min(1.5, Math.max(0.6, Math.round((layout.scale_factor + delta) * 100) / 100));
      onChangeLayout({ scale_factor: nextScale });
    } else if (onUpdateBlock) {
      const nextScale = Math.min(1.6, Math.max(0.6, Math.round((activeBlockCfg.scale + delta) * 100) / 100));
      onUpdateBlock(selectedGroupId, { scale: nextScale });
    }
  };

  const handleResetCurrent = () => {
    if (controlMode === 'entire') {
      onChangeLayout({ offset_x: 0, offset_y: 0, scale_factor: 1.0 });
    } else if (onUpdateBlock) {
      onUpdateBlock(selectedGroupId, { dx: 0, dy: 0, scale: 1.0 });
    }
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
              Check How Your Bill Looks on the Letterhead
            </h2>
          </div>
          <p className="text-base text-slate-600 pl-9">
            Look at the preview on the left. Use the big arrow buttons below to adjust the position so it fits your company paper.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetToTemplate}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors shrink-0 shadow-2xs"
          title="Reset everything back to starting position"
        >
          <RotateCcw className="w-4 h-4 text-slate-600" />
          <span>Reset Everything to Default</span>
        </button>
      </div>

      {/* Senior-Friendly Quick Instruction Banner */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-sm flex items-start space-x-3">
        <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">How to make sure it looks great:</span>
          <p className="text-emerald-900 mt-0.5 text-xs sm:text-sm">
            Check that your company logo at the very top is not covered. If the bill text is too high, click the big <strong>"Move Down"</strong> button. If it already looks good, click <strong>"Next Step"</strong>!
          </p>
        </div>
      </div>

      {/* Two-panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Document Preview & Visual Canvas (7 cols) */}
        <div className="lg:col-span-7 h-[700px]">
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

        {/* Right: Senior-Friendly Adjustment Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          {/* Mode Selector Tabs: Whole Bill vs Specific Section */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900 block">
              What would you like to adjust?
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setControlMode('entire')}
                className={`py-2.5 px-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  controlMode === 'entire'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Move Entire Bill</span>
              </button>

              <button
                type="button"
                onClick={() => setControlMode('section')}
                className={`py-2.5 px-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  controlMode === 'section'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Move One Section</span>
              </button>
            </div>
          </div>

          {/* If Specific Section: Big Clear Selector */}
          {controlMode === 'section' && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-700">Choose which part to move:</p>
              <div className="grid grid-cols-2 gap-2">
                {groupOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedGroupId === opt.id;
                  const bCfg = blocks.find((b) => b.id === opt.id) || { dx: 0, dy: 0, scale: 1.0 };
                  const isMoved = bCfg.dx !== 0 || bCfg.dy !== 0 || bCfg.scale !== 1.0;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedGroupId(opt.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-blue-900 bg-blue-50/80 ring-2 ring-blue-900/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2 font-bold text-sm text-slate-900">
                        <Icon className="w-4 h-4 text-blue-900" />
                        <span>{opt.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                      {isMoved && (
                        <span className="inline-block mt-1 text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                          Adjusted
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Big Friendly Directional Arrow Pad */}
          <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm">
                {controlMode === 'entire' ? 'Nudge Entire Bill:' : `Nudge ${groupOptions.find((o) => o.id === selectedGroupId)?.label}:`}
              </h4>
              <button
                type="button"
                onClick={handleResetCurrent}
                className="text-xs font-bold text-blue-900 hover:underline"
              >
                Center Again
              </button>
            </div>

            {/* Cross Arrows Controller: Large touch targets */}
            <div className="flex flex-col items-center justify-center space-y-2 py-2">
              {/* Up */}
              <button
                type="button"
                onClick={() => handleNudge('up', 10)}
                className="w-36 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-300 hover:border-blue-900 text-slate-800 font-bold text-sm shadow-xs transition-all flex items-center justify-center space-x-2 active:scale-95"
              >
                <ArrowUp className="w-5 h-5 text-blue-900" />
                <span>Move Up</span>
              </button>

              {/* Left / Right Row */}
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => handleNudge('left', 10)}
                  className="w-32 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-300 hover:border-blue-900 text-slate-800 font-bold text-sm shadow-xs transition-all flex items-center justify-center space-x-2 active:scale-95"
                >
                  <ArrowL className="w-5 h-5 text-blue-900" />
                  <span>Left</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNudge('right', 10)}
                  className="w-32 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-300 hover:border-blue-900 text-slate-800 font-bold text-sm shadow-xs transition-all flex items-center justify-center space-x-2 active:scale-95"
                >
                  <span>Right</span>
                  <ArrowR className="w-5 h-5 text-blue-900" />
                </button>
              </div>

              {/* Down */}
              <button
                type="button"
                onClick={() => handleNudge('down', 10)}
                className="w-36 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-300 hover:border-blue-900 text-slate-800 font-bold text-sm shadow-xs transition-all flex items-center justify-center space-x-2 active:scale-95"
              >
                <ArrowDown className="w-5 h-5 text-blue-900" />
                <span>Move Down</span>
              </button>
            </div>

            {/* Size Adjustment Controls: Bigger / Smaller */}
            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs font-bold text-slate-700 mb-2 text-center">Adjust Overall Size (Scaling):</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleScale(-0.05)}
                  className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-300 text-slate-800 font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5 active:scale-95"
                >
                  <ZoomOut className="w-4 h-4 text-slate-600" />
                  <span>Make Smaller</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleScale(0.05)}
                  className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-300 text-slate-800 font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5 active:scale-95"
                >
                  <ZoomIn className="w-4 h-4 text-slate-600" />
                  <span>Make Bigger</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick 1-Click Presets */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700">Quick 1-Click Layout Presets:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeLayout({ offset_x: 0, offset_y: 0, scale_factor: 1.0 })}
                className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs text-center"
              >
                ⭐ Standard Position
              </button>

              <button
                type="button"
                onClick={() => onChangeLayout({ offset_x: 0, offset_y: 35, scale_factor: 0.95 })}
                className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs text-center"
              >
                ⬇ Space for Tall Logo
              </button>
            </div>
          </div>

          {/* Optional Expandable Slider Controls for Fine Precision */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvancedSliders(!showAdvancedSliders)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
            >
              {showAdvancedSliders ? 'Hide Precise Sliders' : 'Need millimeter precision? Show fine sliders'}
            </button>

            {showAdvancedSliders && (
              <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600">Top Margin (Header clearance):</span>
                    <span className="font-bold text-slate-900">{Math.round(layout.margin_top)} pt</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="220"
                    step="5"
                    value={layout.margin_top}
                    onChange={(e) => onChangeLayout({ margin_top: Number(e.target.value) })}
                    className="w-full accent-blue-900 h-2 bg-slate-200 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600">Bottom Margin (Footer clearance):</span>
                    <span className="font-bold text-slate-900">{Math.round(layout.margin_bottom)} pt</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="160"
                    step="5"
                    value={layout.margin_bottom}
                    onChange={(e) => onChangeLayout({ margin_bottom: Number(e.target.value) })}
                    className="w-full accent-blue-900 h-2 bg-slate-200 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons: Big & Friendly */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Letterhead</span>
            </button>

            <button
              type="button"
              onClick={onContinue}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl bg-blue-900 text-white text-base font-extrabold hover:bg-blue-800 shadow-md hover:shadow-lg transition-all"
            >
              <span>Next: Add Signature (Optional)</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
