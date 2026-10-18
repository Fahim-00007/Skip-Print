import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Type,
  Trash2,
  Edit3,
  FileText,
  Layers,
  Table,
  Calendar,
  UserCheck,
  CreditCard
} from 'lucide-react';
import { SignaturePlacement, Signature, TextAnnotation, SheetPreviewData, BlockItem } from '../../types';
import { SpreadsheetGrid } from './SpreadsheetGrid';

interface LivePreviewProps {
  previewUrl: string | null;
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  engineName?: string;
  warning?: string;

  // Signature placement
  isSignatureMode?: boolean;
  signature?: SignaturePlacement | null;
  signatureObj?: Signature | null;
  onUpdateSignature?: (placement: Partial<SignaturePlacement>) => void;

  // Text annotations
  annotations?: TextAnnotation[];
  onAddAnnotation?: () => void;
  onUpdateAnnotation?: (id: string, patch: Partial<TextAnnotation>) => void;
  onDeleteAnnotation?: (id: string) => void;

  // Movable Block Groups (Table, Bill # & Date, Client Info, Bank Details)
  blocks?: BlockItem[];
  onUpdateBlock?: (id: string, patch: Partial<BlockItem>) => void;

  // Spreadsheet cell data editing
  sheetData?: SheetPreviewData | null;
  sheetNames?: string[];
  activeSheet?: string;
  onSelectSheet?: (name: string) => void;
  onSaveCellEdits?: (updates: { coordinate: string; value: string }[]) => Promise<void>;
  isSavingCellEdits?: boolean;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  previewUrl,
  isLoading,
  totalPages,
  currentPage,
  onPageChange,
  engineName,
  warning,
  isSignatureMode = false,
  signature,
  signatureObj,
  onUpdateSignature,
  annotations = [],
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  blocks = [],
  onUpdateBlock,
  sheetData,
  sheetNames = [],
  activeSheet = '',
  onSelectSheet,
  onSaveCellEdits,
  isSavingCellEdits = false
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'preview' | 'edit_cells'>('preview');
  const [activeElement, setActiveElement] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Dragging & resizing state
  const [dragTarget, setDragTarget] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number; startScale: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
    startScale: 1.0
  });

  const PDF_WIDTH = 595.28;
  const PDF_HEIGHT = 841.89;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 15, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 15, 40));
  const handleResetZoom = () => setZoom(100);

  // Default block bounding boxes (on A4 at default margins)
  const defaultBlockBoxes: Record<string, { x: number; y: number; w: number; h: number; icon: any; label: string }> = {
    bill_meta: { x: 36, y: 105, w: 523, h: 90, icon: Calendar, label: 'Bill # & Date' },
    client_info: { x: 36, y: 205, w: 523, h: 65, icon: UserCheck, label: 'Client Info' },
    table: { x: 36, y: 280, w: 523, h: 290, icon: Table, label: 'Whole Line Items Table' },
    bank_notes: { x: 36, y: 580, w: 523, h: 120, icon: CreditCard, label: 'Bank Details & Notes' },
  };

  const getBlockConfig = (id: string) => blocks.find((b) => b.id === id) || { dx: 0, dy: 0, scale: 1.0, visible: true };

  const startDrag = (target: string, initX: number, initY: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveElement(target);
    setDragTarget(target);
    setIsResizing(false);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: initX,
      startY: initY,
      startScale: 1.0
    };
  };

  const startResize = (target: string, initScale: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveElement(target);
    setDragTarget(target);
    setIsResizing(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: 0,
      startY: 0,
      startScale: initScale
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragTarget || !imageRef.current) return;

      const imgRect = imageRef.current.getBoundingClientRect();
      const scaleX = PDF_WIDTH / imgRect.width;
      const scaleY = PDF_HEIGHT / imgRect.height;

      const deltaX = (e.clientX - dragStartRef.current.mouseX) * scaleX;
      const deltaY = (e.clientY - dragStartRef.current.mouseY) * scaleY;

      if (dragTarget === 'signature' && signature && onUpdateSignature) {
        if (!isResizing) {
          const newX = Math.max(0, Math.min(PDF_WIDTH - signature.width, dragStartRef.current.startX + deltaX));
          const newY = Math.max(0, Math.min(PDF_HEIGHT - signature.height, dragStartRef.current.startY + deltaY));
          onUpdateSignature({ x: Math.round(newX), y: Math.round(newY) });
        } else {
          const newW = Math.max(50, Math.min(300, 140 + deltaX));
          const newH = Math.max(25, Math.min(200, 60 + deltaY));
          onUpdateSignature({ width: Math.round(newW), height: Math.round(newH) });
        }
      } else if (dragTarget.startsWith('block:') && onUpdateBlock) {
        const blockId = dragTarget.replace('block:', '');
        const currentB = getBlockConfig(blockId);
        if (!isResizing) {
          onUpdateBlock(blockId, {
            dx: Math.round(dragStartRef.current.startX + deltaX),
            dy: Math.round(dragStartRef.current.startY + deltaY)
          });
        } else {
          const newScale = Math.max(0.6, Math.min(1.4, dragStartRef.current.startScale + (deltaX / 300)));
          onUpdateBlock(blockId, { scale: Math.round(newScale * 100) / 100 });
        }
      } else if (onUpdateAnnotation && dragTarget.startsWith('ann:')) {
        const annId = dragTarget.replace('ann:', '');
        const ann = annotations.find((a) => a.id === annId);
        if (ann) {
          if (!isResizing) {
            const newX = Math.max(0, Math.min(PDF_WIDTH - ann.width, dragStartRef.current.startX + deltaX));
            const newY = Math.max(0, Math.min(PDF_HEIGHT - ann.height, dragStartRef.current.startY + deltaY));
            onUpdateAnnotation(ann.id, { x: Math.round(newX), y: Math.round(newY) });
          } else {
            const newW = Math.max(70, Math.min(400, 180 + deltaX));
            const newH = Math.max(20, Math.min(150, 36 + deltaY));
            onUpdateAnnotation(ann.id, { width: Math.round(newW), height: Math.round(newH) });
          }
        }
      }
    };

    const handleMouseUp = () => {
      setDragTarget(null);
      setIsResizing(false);
    };

    if (dragTarget) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragTarget, isResizing, signature, annotations, blocks, onUpdateSignature, onUpdateAnnotation, onUpdateBlock]);

  const showSigOverlay = isSignatureMode && signature && signatureObj && (
    signature.page === 'all' ||
    signature.page === String(currentPage) ||
    (signature.page === 'last' && currentPage === totalPages)
  );

  const activeAnn = annotations.find((a) => a.id === (activeElement?.startsWith('ann:') ? activeElement.replace('ann:', '') : null));
  const activeBlockId = activeElement?.startsWith('block:') ? activeElement.replace('block:', '') : null;
  const activeBlockCfg = activeBlockId ? getBlockConfig(activeBlockId) : null;

  return (
    <div className="flex flex-col h-full bg-slate-100/70 rounded-xl border border-slate-200 overflow-hidden shadow-inner select-none">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-white border-b border-slate-200 text-xs gap-2">
        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'preview'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Document Preview</span>
          </button>

          {sheetData && (
            <button
              type="button"
              onClick={() => setViewMode('edit_cells')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'edit_cells'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Bill Cells</span>
            </button>
          )}
        </div>

        {/* Movable Element Quick Selector Pills */}
        {viewMode === 'preview' && (
          <div className="hidden sm:flex items-center space-x-1 overflow-x-auto">
            <span className="text-[10px] text-slate-400 font-semibold uppercase mr-1">Move:</span>
            {[
              { id: 'table', label: 'Table', icon: Table },
              { id: 'bill_meta', label: 'Bill #', icon: Calendar },
              { id: 'client_info', label: 'Client', icon: UserCheck },
              { id: 'bank_notes', label: 'Bank', icon: CreditCard },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = activeElement === `block:${item.id}`;
              const cfg = getBlockConfig(item.id);
              const isMoved = cfg.dx !== 0 || cfg.dy !== 0 || cfg.scale !== 1.0;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveElement(isSelected ? null : `block:${item.id}`)}
                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-900 text-white shadow-xs font-semibold'
                      : isMoved
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={`Select and move ${item.label}`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{item.label}</span>
                  {isMoved && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-0.5" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Right Tools: Zoom, Page Navigation & Add Note */}
        {viewMode === 'preview' && (
          <div className="flex items-center space-x-1.5">
            {onAddAnnotation && (
              <button
                type="button"
                onClick={onAddAnnotation}
                className="inline-flex items-center space-x-1 px-2 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs shadow-2xs"
                title="Add a custom text note or stamp onto the bill"
              >
                <Type className="w-3.5 h-3.5 text-blue-800" />
                <span>+ Text Note</span>
              </button>
            )}

            {totalPages > 1 && (
              <div className="flex items-center space-x-1 bg-slate-100 rounded p-0.5 border border-slate-200">
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1 || isLoading}
                  className="p-1 rounded hover:bg-white text-slate-600 disabled:opacity-30"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-semibold text-slate-700 px-1 text-[11px]">
                  {currentPage}/{totalPages}
                </span>
                <button
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages || isLoading}
                  className="p-1 rounded hover:bg-white text-slate-600 disabled:opacity-30"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center space-x-0.5 bg-slate-100 rounded p-0.5 border border-slate-200">
              <button onClick={handleZoomOut} className="p-1 rounded hover:bg-white text-slate-600" title="Zoom Out">
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="w-8 text-center font-medium text-slate-700 text-[10px]">{zoom}%</span>
              <button onClick={handleZoomIn} className="p-1 rounded hover:bg-white text-slate-600" title="Zoom In">
                <ZoomIn className="w-3 h-3" />
              </button>
              <button onClick={handleResetZoom} className="p-1 rounded hover:bg-white text-slate-600 border-l border-slate-300 ml-0.5 pl-0.5" title="Reset Zoom">
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Viewport */}
      {viewMode === 'preview' ? (
        <div
          ref={containerRef}
          className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center relative min-h-[460px]"
          onClick={() => setActiveElement(null)}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-2xs flex flex-col items-center justify-center z-30 transition-opacity">
              <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-[11px] font-semibold text-slate-700">Updating preview...</p>
            </div>
          )}

          {previewUrl ? (
            <div
              className="relative shadow-2xl rounded-sm bg-white border border-slate-300 transition-all duration-75"
              style={{
                width: `${(595 * zoom) / 100}px`,
                maxWidth: '100%'
              }}
            >
              <img
                ref={imageRef}
                src={previewUrl}
                alt={`Page ${currentPage} preview`}
                className="w-full h-auto block rounded-sm pointer-events-none select-none"
              />

              {/* Interactive Group Movable Overlays (Table, Bill #, Client, Bank) */}
              {Object.entries(defaultBlockBoxes).map(([bId, def]) => {
                const cfg = getBlockConfig(bId);
                const isSelected = activeElement === `block:${bId}`;
                const Icon = def.icon;

                const curX = def.x + cfg.dx;
                const curY = def.y + cfg.dy;
                const curW = def.w * cfg.scale;
                const curH = def.h * cfg.scale;

                return (
                  <div
                    key={bId}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveElement(`block:${bId}`);
                    }}
                    onMouseDown={(e) => startDrag(`block:${bId}`, cfg.dx, cfg.dy, e)}
                    style={{
                      left: `${(curX / PDF_WIDTH) * 100}%`,
                      top: `${(curY / PDF_HEIGHT) * 100}%`,
                      width: `${(curW / PDF_WIDTH) * 100}%`,
                      height: `${(curH / PDF_HEIGHT) * 100}%`,
                    }}
                    className={`absolute cursor-move rounded transition-colors group select-none ${
                      isSelected
                        ? 'border-2 border-blue-600 bg-blue-50/20 ring-2 ring-blue-500/20 z-20'
                        : 'border border-dashed border-slate-400/40 hover:border-blue-400 hover:bg-blue-50/10 z-10'
                    }`}
                    title={`Click & drag to move ${def.label}. Drag bottom-right handle to scale.`}
                  >
                    {/* Floating label badge */}
                    <div
                      className={`absolute -top-5 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center space-x-1 shadow-xs pointer-events-none transition-opacity ${
                        isSelected
                          ? 'bg-blue-900 text-white opacity-100'
                          : 'bg-slate-700/80 text-white opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Icon className="w-2.5 h-2.5" />
                      <span>{def.label}</span>
                      {cfg.scale !== 1.0 && <span className="opacity-80">({Math.round(cfg.scale * 100)}%)</span>}
                    </div>

                    {/* Resize handle (bottom right) */}
                    {isSelected && (
                      <div
                        onMouseDown={(e) => startResize(`block:${bId}`, cfg.scale, e)}
                        className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-blue-700 border-2 border-white rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                        title="Drag to scale group"
                      />
                    )}
                  </div>
                );
              })}

              {/* Draggable & Resizable Interactive Signature Overlay */}
              {showSigOverlay && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveElement('signature');
                  }}
                  onMouseDown={(e) => startDrag('signature', signature.x, signature.y, e)}
                  style={{
                    left: `${(signature.x / PDF_WIDTH) * 100}%`,
                    top: `${(signature.y / PDF_HEIGHT) * 100}%`,
                    width: `${(signature.width / PDF_WIDTH) * 100}%`,
                    height: `${(signature.height / PDF_HEIGHT) * 100}%`,
                    opacity: signature.opacity,
                    transform: `rotate(${signature.rotation}deg)`,
                  }}
                  className={`absolute cursor-move border-2 border-dashed border-emerald-600 rounded bg-emerald-50/20 group select-none transition-shadow z-25 ${
                    activeElement === 'signature' ? 'shadow-lg border-emerald-800 ring-2 ring-emerald-500/20' : 'hover:border-emerald-700'
                  }`}
                  title="Drag to position signature"
                >
                  <img
                    src={signatureObj.url}
                    alt="Signature"
                    className="w-full h-full object-contain pointer-events-none"
                  />
                  <div
                    onMouseDown={(e) => startResize('signature', 1.0, e)}
                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-emerald-700 border-2 border-white rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                    title="Drag to resize signature"
                  />
                </div>
              )}

              {/* Interactive Draggable Text Annotations */}
              {annotations.map((ann) => {
                const isAnnPage = (
                  ann.page === 'all' ||
                  ann.page === String(currentPage) ||
                  (ann.page === 'last' && currentPage === totalPages)
                );
                if (!isAnnPage) return null;

                const isSelected = activeElement === `ann:${ann.id}`;

                return (
                  <div
                    key={ann.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveElement(`ann:${ann.id}`);
                    }}
                    onMouseDown={(e) => startDrag(`ann:${ann.id}`, ann.x, ann.y, e)}
                    style={{
                      left: `${(ann.x / PDF_WIDTH) * 100}%`,
                      top: `${(ann.y / PDF_HEIGHT) * 100}%`,
                      width: `${(ann.width / PDF_WIDTH) * 100}%`,
                      height: `${(ann.height / PDF_HEIGHT) * 100}%`,
                      color: ann.font_color,
                      fontSize: `${(ann.font_size * zoom) / 100}px`,
                      fontWeight: ann.is_bold ? 'bold' : 'normal',
                      transform: `rotate(${ann.rotation}deg)`,
                    }}
                    className={`absolute cursor-move border-2 rounded p-1 flex items-center justify-start select-none transition-shadow z-25 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/30'
                        : 'border-dashed border-slate-400 hover:border-blue-500 bg-white/50'
                    }`}
                  >
                    <span className="truncate w-full">{ann.text || 'Type note...'}</span>
                    <div
                      onMouseDown={(e) => startResize(`ann:${ann.id}`, 1.0, e)}
                      className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-nwse-resize shadow"
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-8 text-slate-400">
              <p className="text-sm">No preview available. Upload an Excel file to begin.</p>
            </div>
          )}
        </div>
      ) : (
        /* Edit Cells Mode (Spreadsheet Grid directly in the preview pane) */
        <div className="flex-1 p-4 overflow-auto">
          {sheetData && (
            <SpreadsheetGrid
              data={sheetData}
              sheetNames={sheetNames}
              activeSheet={activeSheet}
              onSelectSheet={onSelectSheet || (() => {})}
              onSaveEdits={onSaveCellEdits}
              isSavingEdits={isSavingCellEdits}
            />
          )}
        </div>
      )}

      {/* Active Element Fine-tuning Control Bar */}
      {viewMode === 'preview' && activeBlockId && onUpdateBlock && activeBlockCfg && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 flex flex-wrap items-center justify-between text-xs gap-2 animate-in fade-in duration-100">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-blue-900 capitalize">
              Selected: {defaultBlockBoxes[activeBlockId]?.label || activeBlockId}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600">Drag directly on preview to position</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <span className="text-slate-500 text-[11px]">Nudge X:</span>
              <input
                type="number"
                value={activeBlockCfg.dx}
                onChange={(e) => onUpdateBlock(activeBlockId, { dx: Number(e.target.value) })}
                className="w-14 text-xs bg-white border border-slate-300 rounded px-1.5 py-0.5 font-mono text-center"
              />
            </div>

            <div className="flex items-center space-x-1">
              <span className="text-slate-500 text-[11px]">Nudge Y:</span>
              <input
                type="number"
                value={activeBlockCfg.dy}
                onChange={(e) => onUpdateBlock(activeBlockId, { dy: Number(e.target.value) })}
                className="w-14 text-xs bg-white border border-slate-300 rounded px-1.5 py-0.5 font-mono text-center"
              />
            </div>

            <div className="flex items-center space-x-1">
              <span className="text-slate-500 text-[11px]">Scale:</span>
              <span className="font-semibold text-slate-800 text-[11px]">
                {Math.round(activeBlockCfg.scale * 100)}%
              </span>
              <input
                type="range"
                min="0.6"
                max="1.4"
                step="0.05"
                value={activeBlockCfg.scale}
                onChange={(e) => onUpdateBlock(activeBlockId, { scale: Number(e.target.value) })}
                className="w-20 accent-blue-900 h-1.5 bg-slate-200 rounded cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={() => onUpdateBlock(activeBlockId, { dx: 0, dy: 0, scale: 1.0 })}
              className="text-[11px] font-semibold text-blue-800 hover:underline ml-1"
            >
              Reset Group
            </button>
          </div>
        </div>
      )}

      {/* Selected Text Annotation Toolbar */}
      {viewMode === 'preview' && activeAnn && onUpdateAnnotation && onDeleteAnnotation && (
        <div className="px-4 py-2 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2 animate-in fade-in duration-100">
          <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
            <span className="font-bold text-slate-700">Text:</span>
            <input
              type="text"
              value={activeAnn.text}
              onChange={(e) => onUpdateAnnotation(activeAnn.id, { text: e.target.value })}
              className="text-xs border border-slate-300 rounded px-2 py-1 flex-1 text-slate-900 font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none"
              placeholder="e.g. PAID, APPROVED, or custom note"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Size:</span>
            <input
              type="number"
              min="8"
              max="48"
              value={activeAnn.font_size}
              onChange={(e) => onUpdateAnnotation(activeAnn.id, { font_size: Number(e.target.value) })}
              className="w-12 text-xs border border-slate-300 rounded px-1.5 py-1 text-center"
            />

            <button
              type="button"
              onClick={() => onUpdateAnnotation(activeAnn.id, { is_bold: !activeAnn.is_bold })}
              className={`px-2 py-1 rounded font-bold border ${
                activeAnn.is_bold ? 'bg-blue-900 text-white border-blue-900' : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              B
            </button>

            <input
              type="color"
              value={activeAnn.font_color}
              onChange={(e) => onUpdateAnnotation(activeAnn.id, { font_color: e.target.value })}
              className="w-6 h-6 rounded border border-slate-300 cursor-pointer p-0"
              title="Text Color"
            />

            <button
              type="button"
              onClick={() => onDeleteAnnotation(activeAnn.id)}
              className="p-1 rounded text-red-500 hover:bg-red-50"
              title="Delete text note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Signature Placement Bottom Hint */}
      {viewMode === 'preview' && isSignatureMode && signature && (
        <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-100 text-xs text-emerald-900 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <span>Interactive Signature: Drag directly on preview to position. Bottom-right handle scales.</span>
          </span>
          <span className="font-mono text-[11px] text-emerald-700">
            X: {signature.x}pt | Y: {signature.y}pt | {signature.width}×{signature.height}pt
          </span>
        </div>
      )}
    </div>
  );
};
