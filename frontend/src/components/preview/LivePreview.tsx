import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Move,
  ShieldCheck,
  AlertCircle,
  Type,
  Trash2,
  Edit3,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { SignaturePlacement, Signature, TextAnnotation, SheetPreviewData } from '../../types';
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
  sheetData,
  sheetNames = [],
  activeSheet = '',
  onSelectSheet,
  onSaveCellEdits,
  isSavingCellEdits = false
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'preview' | 'edit_cells'>('preview');
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Dragging & resizing state
  const [dragTarget, setDragTarget] = useState<'signature' | string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number; startW: number; startH: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
    startW: 0,
    startH: 0
  });

  const PDF_WIDTH = 595.28;
  const PDF_HEIGHT = 841.89;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 15, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 15, 40));
  const handleResetZoom = () => setZoom(100);

  // Mouse handlers for dragging
  const startDrag = (target: 'signature' | string, initX: number, initY: number, initW: number, initH: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDragTarget(target);
    setIsResizing(false);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: initX,
      startY: initY,
      startW: initW,
      startH: initH
    };
  };

  const startResize = (target: 'signature' | string, initX: number, initY: number, initW: number, initH: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDragTarget(target);
    setIsResizing(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: initX,
      startY: initY,
      startW: initW,
      startH: initH
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
          const newW = Math.max(50, Math.min(300, dragStartRef.current.startW + deltaX));
          const newH = Math.max(25, Math.min(200, dragStartRef.current.startH + deltaY));
          onUpdateSignature({ width: Math.round(newW), height: Math.round(newH) });
        }
      } else if (onUpdateAnnotation && typeof dragTarget === 'string' && dragTarget !== 'signature') {
        const ann = annotations.find((a) => a.id === dragTarget);
        if (ann) {
          if (!isResizing) {
            const newX = Math.max(0, Math.min(PDF_WIDTH - ann.width, dragStartRef.current.startX + deltaX));
            const newY = Math.max(0, Math.min(PDF_HEIGHT - ann.height, dragStartRef.current.startY + deltaY));
            onUpdateAnnotation(ann.id, { x: Math.round(newX), y: Math.round(newY) });
          } else {
            const newW = Math.max(80, Math.min(400, dragStartRef.current.startW + deltaX));
            const newH = Math.max(24, Math.min(150, dragStartRef.current.startH + deltaY));
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
  }, [dragTarget, isResizing, signature, annotations, onUpdateSignature, onUpdateAnnotation]);

  const showSigOverlay = isSignatureMode && signature && signatureObj && (
    signature.page === 'all' ||
    signature.page === String(currentPage) ||
    (signature.page === 'last' && currentPage === totalPages)
  );

  const activeAnnotation = annotations.find((a) => a.id === activeAnnotationId);

  return (
    <div className="flex flex-col h-full bg-slate-100/70 rounded-xl border border-slate-200 overflow-hidden shadow-inner select-none">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-white border-b border-slate-200 text-xs gap-2">
        {/* View Mode Switcher (Document Preview vs Edit Cells) */}
        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
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
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
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

        {/* Engine status indicator */}
        {viewMode === 'preview' && (
          <div className="hidden sm:flex items-center space-x-2">
            <span className="flex items-center space-x-1 font-medium text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{engineName || 'PDF Engine'}</span>
            </span>
            {warning && (
              <span className="flex items-center space-x-1 text-amber-600 text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <AlertCircle className="w-3 h-3" />
                <span>{warning}</span>
              </span>
            )}
          </div>
        )}

        {/* Right Tools: Page Switcher & Zoom */}
        {viewMode === 'preview' && (
          <div className="flex items-center space-x-2">
            {/* Add Custom Text Note button */}
            {onAddAnnotation && (
              <button
                type="button"
                onClick={onAddAnnotation}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs shadow-2xs"
                title="Add a custom text note or stamp onto the bill"
              >
                <Type className="w-3.5 h-3.5 text-blue-800" />
                <span>+ Text Note</span>
              </button>
            )}

            {/* Page Switcher */}
            {totalPages > 1 && (
              <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1 || isLoading}
                  className="p-1 rounded hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-semibold text-slate-700 px-1 text-[11px]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages || isLoading}
                  className="p-1 rounded hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Zoom controls */}
            <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button
                onClick={handleZoomOut}
                className="p-1 rounded hover:bg-white text-slate-600"
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="w-10 text-center font-medium text-slate-700 text-[10px]">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 rounded hover:bg-white text-slate-600"
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1 rounded hover:bg-white text-slate-600 border-l border-slate-300 ml-1 pl-1"
                title="Reset Zoom"
              >
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
          className="flex-1 overflow-auto p-6 flex items-center justify-center relative min-h-[460px]"
          onClick={() => setActiveAnnotationId(null)}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center z-20">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-semibold text-slate-700">Updating live document preview...</p>
            </div>
          )}

          {previewUrl ? (
            <div
              className="relative shadow-2xl rounded-sm bg-white border border-slate-300 transition-all duration-150"
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

              {/* Draggable & Resizable Interactive Signature Overlay */}
              {showSigOverlay && (
                <div
                  onMouseDown={(e) => startDrag('signature', signature.x, signature.y, signature.width, signature.height, e)}
                  style={{
                    left: `${(signature.x / PDF_WIDTH) * 100}%`,
                    top: `${(signature.y / PDF_HEIGHT) * 100}%`,
                    width: `${(signature.width / PDF_WIDTH) * 100}%`,
                    height: `${(signature.height / PDF_HEIGHT) * 100}%`,
                    opacity: signature.opacity,
                    transform: `rotate(${signature.rotation}deg)`,
                  }}
                  className={`absolute cursor-move border-2 border-dashed border-blue-600 rounded bg-blue-50/20 group select-none transition-shadow ${
                    dragTarget === 'signature' ? 'shadow-lg border-blue-800' : 'hover:border-blue-700'
                  }`}
                  title="Drag to position signature"
                >
                  <img
                    src={signatureObj.url}
                    alt="Signature"
                    className="w-full h-full object-contain pointer-events-none"
                  />
                  <div
                    onMouseDown={(e) => startResize('signature', signature.x, signature.y, signature.width, signature.height, e)}
                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-700 border-2 border-white rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
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

                const isSelected = activeAnnotationId === ann.id;

                return (
                  <div
                    key={ann.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveAnnotationId(ann.id);
                    }}
                    onMouseDown={(e) => startDrag(ann.id, ann.x, ann.y, ann.width, ann.height, e)}
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
                    className={`absolute cursor-move border-2 rounded p-1 flex items-center justify-start select-none transition-shadow ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-500/30'
                        : 'border-dashed border-slate-400/80 hover:border-blue-500 bg-white/40'
                    }`}
                  >
                    <span className="truncate w-full">{ann.text || 'Type note...'}</span>
                    <div
                      onMouseDown={(e) => startResize(ann.id, ann.x, ann.y, ann.width, ann.height, e)}
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

      {/* Selected Text Annotation Toolbar */}
      {viewMode === 'preview' && activeAnnotation && onUpdateAnnotation && onDeleteAnnotation && (
        <div className="px-4 py-2 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2 animate-in fade-in duration-100">
          <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
            <span className="font-bold text-slate-700">Text:</span>
            <input
              type="text"
              value={activeAnnotation.text}
              onChange={(e) => onUpdateAnnotation(activeAnnotation.id, { text: e.target.value })}
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
              value={activeAnnotation.font_size}
              onChange={(e) => onUpdateAnnotation(activeAnnotation.id, { font_size: Number(e.target.value) })}
              className="w-12 text-xs border border-slate-300 rounded px-1.5 py-1 text-center"
            />

            <button
              type="button"
              onClick={() => onUpdateAnnotation(activeAnnotation.id, { is_bold: !activeAnnotation.is_bold })}
              className={`px-2 py-1 rounded font-bold border ${
                activeAnnotation.is_bold ? 'bg-blue-900 text-white border-blue-900' : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              B
            </button>

            <input
              type="color"
              value={activeAnnotation.font_color}
              onChange={(e) => onUpdateAnnotation(activeAnnotation.id, { font_color: e.target.value })}
              className="w-6 h-6 rounded border border-slate-300 cursor-pointer p-0"
              title="Text Color"
            />

            <button
              type="button"
              onClick={() => onDeleteAnnotation(activeAnnotation.id)}
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
        <div className="px-4 py-2 bg-blue-50/80 border-t border-blue-100 text-xs text-blue-800 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <Move className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive Signature: Drag directly on the document preview to position. Use bottom-right dot to resize.</span>
          </span>
          <span className="font-mono text-[11px] text-blue-600">
            X: {signature.x}pt | Y: {signature.y}pt | {signature.width}×{signature.height}pt
          </span>
        </div>
      )}
    </div>
  );
};
