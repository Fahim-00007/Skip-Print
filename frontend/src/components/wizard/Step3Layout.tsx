import React, { useState } from 'react';
import { LayoutSettings, Template, TextAnnotation, SheetPreviewData, BlockItem } from '../../types';
import { LivePreview } from '../preview/LivePreview';
import { ArrowLeft, ArrowRight, RotateCcw, Table, Calendar, UserCheck, CreditCard } from 'lucide-react';

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
  const [selectedGroupId, setSelectedGroupId] = useState<string>('table');

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
      orientation: (selectedTemplate.orientation as any) || 'portrait',
      blocks: [
        { id: 'table', name: 'Line Items Table', dx: 0, dy: 0, scale: 1.0, visible: true },
        { id: 'bill_meta', name: 'Bill # & Date', dx: 0, dy: 0, scale: 1.0, visible: true },
        { id: 'client_info', name: 'Client Info', dx: 0, dy: 0, scale: 1.0, visible: true },
        { id: 'bank_notes', name: 'Bank Details & Notes', dx: 0, dy: 0, scale: 1.0, visible: true }
      ]
    });
  };

  const activeBlockCfg = blocks.find((b) => b.id === selectedGroupId) || { dx: 0, dy: 0, scale: 1.0, visible: true };

  const groupOptions = [
    { id: 'table', label: 'Whole Table', icon: Table, desc: 'Headers, line items rows, totals & taxes' },
    { id: 'bill_meta', label: 'Bill # & Date', icon: Calendar, desc: 'Invoice number, billing date, due date' },
    { id: 'client_info', label: 'Client Info', icon: UserCheck, desc: 'Billed to recipient & customer address' },
    { id: 'bank_notes', label: 'Bank Details', icon: CreditCard, desc: 'Payment wire info & footer terms' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Step Header */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Step 3: Bill Layout & Group Positioning</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Every section of your bill (Whole Table, Date, Bill Number, Client Info) is freely movable and scalable like the signature!
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleResetToTemplate}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            title="Reset layout and group positions to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Positions</span>
          </button>
        </div>
      </div>

      {/* Two-panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Document Preview & Group Overlays (7 cols) */}
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

        {/* Right: Layout Controls & Movable Groups (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          {/* Movable Groups Controller */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <span>Movable & Scalable Groups</span>
              </label>
              <span className="text-[10px] text-blue-800 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Drag on preview or use sliders
              </span>
            </div>

            {/* Group Selector Cards */}
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
                    className={`p-2.5 rounded-lg border text-left transition-all relative ${
                      isSelected
                        ? 'border-blue-900 bg-blue-50/70 ring-2 ring-blue-900/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-900">
                      <Icon className="w-3.5 h-3.5 text-blue-900" />
                      <span>{opt.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 truncate">
                      {opt.desc}
                    </div>
                    {isMoved && (
                      <span className="absolute top-1.5 right-1.5 text-[9px] font-bold text-blue-700 bg-blue-100 px-1 rounded">
                        Moved
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Group Position & Scale Sliders */}
            {onUpdateBlock && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-800">
                    Adjust {groupOptions.find((o) => o.id === selectedGroupId)?.label}:
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateBlock(selectedGroupId, { dx: 0, dy: 0, scale: 1.0 })}
                    className="text-[11px] font-semibold text-blue-800 hover:underline"
                  >
                    Reset Position
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600">Nudge Left / Right:</span>
                      <span className="font-mono font-semibold">{activeBlockCfg.dx}pt</span>
                    </div>
                    <input
                      type="range"
                      min="-120"
                      max="120"
                      step="2"
                      value={activeBlockCfg.dx}
                      onChange={(e) => onUpdateBlock(selectedGroupId, { dx: Number(e.target.value) })}
                      className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-600">Nudge Up / Down:</span>
                      <span className="font-mono font-semibold">{activeBlockCfg.dy}pt</span>
                    </div>
                    <input
                      type="range"
                      min="-150"
                      max="150"
                      step="2"
                      value={activeBlockCfg.dy}
                      onChange={(e) => onUpdateBlock(selectedGroupId, { dy: Number(e.target.value) })}
                      className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-600">Group Scale (Size):</span>
                    <span className="font-mono font-semibold">{Math.round(activeBlockCfg.scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.4"
                    step="0.05"
                    value={activeBlockCfg.scale}
                    onChange={(e) => onUpdateBlock(selectedGroupId, { scale: Number(e.target.value) })}
                    className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Margins */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Letterhead Header & Footer Margins
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Header Margin:</span>
                  <span className="font-semibold text-slate-800">{layout.margin_top}pt</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="5"
                  value={layout.margin_top}
                  onChange={(e) => onChangeLayout({ margin_top: Number(e.target.value) })}
                  className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Footer Margin:</span>
                  <span className="font-semibold text-slate-800">{layout.margin_bottom}pt</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="150"
                  step="5"
                  value={layout.margin_bottom}
                  onChange={(e) => onChangeLayout({ margin_bottom: Number(e.target.value) })}
                  className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Multi-page options */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
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
