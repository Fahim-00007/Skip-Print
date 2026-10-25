import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileText,
  Move
} from 'lucide-react';
import { SignaturePlacement, Signature, SheetPreviewData } from '../../types';
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

  // Spreadsheet cell data editing
  sheetData?: SheetPreviewData | null;
  sheetNames?: string[];
  activeSheet?: string;
  onSelectSheet?: (name: string) => void;
  onSaveCellEdits?: (updates: { coordinate: string; value: string }[]) => Promise<void>;
  isSavingCellEdits?: boolean;

  // Deprecated/optional backwards compatibility
  blocks?: any[];
  onUpdateBlock?: any;
  annotations?: any[];
  onAddAnnotation?: any;
  onUpdateAnnotation?: any;
  onDeleteAnnotation?: any;
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
  sheetData,
  sheetNames = [],
  activeSheet = '',
  onSelectSheet,
  onSaveCellEdits,
  isSavingCellEdits = false
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'preview' | 'edit_cells'>('preview');

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Dragging & resizing state for signature
  const [isDraggingSig, setIsDraggingSig] = useState(false);
  const [isResizingSig, setIsResizingSig] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number; startW: number; startH: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
    startW: 140,
    startH: 60
  });

  const PDF_WIDTH = 595.28;
  const PDF_HEIGHT = 841.89;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 15, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 15, 40));
  const handleResetZoom = () => setZoom(100);

  const startDragSig = (e: React.MouseEvent) => {
    if (!signature) return;
    e.stopPropagation();
    setIsDraggingSig(true);
    setIsResizingSig(false);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: signature.x,
      startY: signature.y,
      startW: signature.width,
      startH: signature.height
    };
  };

  const startResizeSig = (e: React.MouseEvent) => {
    if (!signature) return;
    e.stopPropagation();
    setIsResizingSig(true);
    setIsDraggingSig(false);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: signature.x,
      startY: signature.y,
      startW: signature.width,
      startH: signature.height
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!imageRef.current || !onUpdateSignature || !signature) return;
      const rect = imageRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const scaleX = PDF_WIDTH / rect.width;
      const scaleY = PDF_HEIGHT / rect.height;

      const deltaX = (e.clientX - dragStartRef.current.mouseX) * scaleX;
      const deltaY = (e.clientY - dragStartRef.current.mouseY) * scaleY;

      if (isDraggingSig) {
        const nextX = Math.round(Math.max(0, Math.min(PDF_WIDTH - signature.width, dragStartRef.current.startX + deltaX)));
        const nextY = Math.round(Math.max(0, Math.min(PDF_HEIGHT - signature.height, dragStartRef.current.startY + deltaY)));
        onUpdateSignature({ x: nextX, y: nextY });
      } else if (isResizingSig) {
        const nextW = Math.round(Math.max(50, Math.min(300, dragStartRef.current.startW + deltaX)));
        const nextH = Math.round(Math.max(25, Math.min(180, dragStartRef.current.startH + deltaY)));
        onUpdateSignature({ width: nextW, height: nextH });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingSig(false);
      setIsResizingSig(false);
    };

    if (isDraggingSig || isResizingSig) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSig, isResizingSig, signature, onUpdateSignature]);

  const showSigOverlay = isSignatureMode && signature && signatureObj && (
    signature.page === 'all' ||
    signature.page === 'each_bill' ||
    signature.page === 'each' ||
    signature.page === String(currentPage) ||
    (signature.page === 'last' && currentPage === totalPages)
  );

  return (
    <div className="flex flex-col h-full bg-slate-100/70 rounded-2xl border border-slate-200 overflow-hidden shadow-xs select-none">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 text-sm gap-3">
        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'preview'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-slate-700" />
            <span>Document Preview</span>
          </button>

          {sheetData && (
            <button
              type="button"
              onClick={() => setViewMode('edit_cells')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'edit_cells'
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Bill Text in Table</span>
            </button>
          )}
        </div>

        {/* Page Navigation & Zoom Tools */}
        {viewMode === 'preview' && (
          <div className="flex items-center space-x-2">
            {totalPages > 1 && (
              <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1 || isLoading}
                  className="px-2 py-1 rounded-md hover:bg-white text-slate-700 disabled:opacity-30 flex items-center space-x-1 text-xs font-semibold transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                <span className="font-semibold text-slate-800 px-2 text-xs">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages || isLoading}
                  className="px-2 py-1 rounded-md hover:bg-white text-slate-700 disabled:opacity-30 flex items-center space-x-1 text-xs font-semibold transition-colors"
                  title="Next Page"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center space-x-0.5 bg-slate-100 rounded-lg p-0.5 border border-slate-200/80">
              <button
                type="button"
                onClick={handleZoomOut}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white text-slate-700 font-bold transition-colors"
                title="Zoom Out (Make Smaller)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-semibold text-slate-800 text-xs">{zoom}%</span>
              <button
                type="button"
                onClick={handleZoomIn}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white text-slate-700 font-bold transition-colors"
                title="Zoom In (Make Bigger)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="h-7 px-1.5 flex items-center justify-center rounded-md hover:bg-white text-slate-600 border-l border-slate-200 ml-0.5 text-xs font-semibold transition-colors"
                title="Reset Zoom to 100%"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                <span>100%</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Viewport */}
      {viewMode === 'preview' ? (
        <div
          ref={containerRef}
          className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center relative min-h-[480px]"
        >
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex flex-col items-center justify-center z-30 transition-opacity">
              <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs font-bold text-slate-800">Updating preview...</p>
            </div>
          )}

          {previewUrl ? (
            <div
              className="relative shadow-xl rounded-sm bg-white border border-slate-300 transition-all duration-75"
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

              {/* Interactive Signature Overlay (Active only when placing a signature) */}
              {showSigOverlay && (
                <div
                  onMouseDown={startDragSig}
                  style={{
                    left: `${(signature.x / PDF_WIDTH) * 100}%`,
                    top: `${(signature.y / PDF_HEIGHT) * 100}%`,
                    width: `${(signature.width / PDF_WIDTH) * 100}%`,
                    height: `${(signature.height / PDF_HEIGHT) * 100}%`,
                    opacity: signature.opacity,
                    transform: `rotate(${signature.rotation}deg)`,
                  }}
                  className="absolute cursor-move border-2 border-dashed border-emerald-600 rounded bg-emerald-50/30 group select-none transition-shadow z-25 hover:border-emerald-700 shadow-sm"
                  title="Click and drag to position your signature"
                >
                  <img
                    src={signatureObj.url}
                    alt="Signature"
                    className="w-full h-full object-contain pointer-events-none"
                  />
                  {/* Floating badge */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-emerald-800 text-white text-[10px] font-bold shadow-xs flex items-center space-x-1 pointer-events-none whitespace-nowrap">
                    <Move className="w-3 h-3" />
                    <span>Your Signature (Drag to move)</span>
                  </div>
                  {/* Resize handle */}
                  <div
                    onMouseDown={startResizeSig}
                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-emerald-700 border-2 border-white rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                    title="Drag to resize signature"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8 text-slate-500 space-y-2">
              <p className="text-base font-bold text-slate-700">No Preview Available</p>
              <p className="text-sm">Please pick an Excel file to begin.</p>
            </div>
          )}
        </div>
      ) : (
        /* Edit Cells Mode (Spreadsheet Grid) */
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

      {/* Signature Placement Bottom Hint */}
      {viewMode === 'preview' && isSignatureMode && signature && (
        <div className="px-4 py-2.5 bg-emerald-50 border-t border-emerald-200 text-xs text-emerald-950 flex items-center justify-between font-medium">
          <span className="flex items-center space-x-1.5">
            <span className="font-bold">Signature Placement:</span>
            <span>You can drag the signature directly on the paper above, or use the quick placement buttons on the right.</span>
          </span>
        </div>
      )}
    </div>
  );
};
