import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Sparkles,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  FilePlus,
  ListOrdered
} from 'lucide-react';
import { ExcelUploadResponse, BillItem } from '../../types';
import { SpreadsheetGrid } from '../preview/SpreadsheetGrid';

interface Step1UploadProps {
  bills?: BillItem[];
  activeBillIndex?: number;
  onSelectBillIndex?: (index: number) => void;
  onAddFiles?: (files: FileList | File[]) => void;
  onAddAllSheetsAsBills?: (billIndex: number) => void;
  onRemoveBill?: (index: number) => void;
  onMoveBill?: (index: number, direction: 'up' | 'down') => void;
  onChangeBillSheet?: (index: number, newSheet: string) => void;

  // Backwards compatibility / fallbacks
  excelData?: ExcelUploadResponse | null;
  onFileUpload?: (file: File) => void;
  onSelectSheet?: (sheetName: string) => void;

  isLoading: boolean;
  onLoadSample: () => void;
  onSaveCellEdits?: (updates: { coordinate: string; value: string }[]) => Promise<void>;
  isSavingCellEdits?: boolean;
  onContinue?: () => void;
}

export const Step1Upload: React.FC<Step1UploadProps> = ({
  bills = [],
  activeBillIndex = 0,
  onSelectBillIndex,
  onAddFiles,
  onAddAllSheetsAsBills,
  onRemoveBill,
  onMoveBill,
  onChangeBillSheet,
  excelData,
  onFileUpload,
  onSelectSheet,
  isLoading,
  onLoadSample,
  onSaveCellEdits,
  isSavingCellEdits = false,
  onContinue
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showGridPreview, setShowGridPreview] = useState(false);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  // Normalize bill list
  const currentBills: BillItem[] =
    bills.length > 0
      ? bills
      : excelData
      ? [
          {
            id: 'bill-default',
            file_id: excelData.file_id,
            filename: excelData.filename,
            sheet_name: excelData.active_sheet,
            sheet_names: excelData.sheet_names,
            file_size: excelData.file_size,
            preview_grid: excelData.preview_grid
          }
        ]
      : [];

  const activeBill = currentBills[activeBillIndex] || currentBills[0] || null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (onAddFiles) {
        onAddFiles(e.dataTransfer.files);
      } else if (onFileUpload) {
        onFileUpload(e.dataTransfer.files[0]);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (onAddFiles) {
        onAddFiles(e.target.files);
      } else if (onFileUpload) {
        onFileUpload(e.target.files[0]);
      }
      e.target.value = '';
    }
  };

  // Check if any bill has unused worksheets
  const hasMultipleSheets = activeBill && activeBill.sheet_names && activeBill.sheet_names.length > 1;
  const unusedSheets = hasMultipleSheets
    ? activeBill.sheet_names.filter(
        (s) => !currentBills.some((b) => b.file_id === activeBill.file_id && b.sheet_name === s)
      )
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hidden file input for adding additional bill files */}
      <input
        ref={addFileInputRef}
        type="file"
        multiple
        accept=".xlsx,.xls,.xlsm"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Step Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Select Your Excel Bills
            </h2>
          </div>
          <p className="text-sm text-slate-600 mt-1 pl-8">
            Choose one bill or add multiple bills to combine into a single, professional PDF letterhead.
          </p>
        </div>

        <button
          type="button"
          onClick={onLoadSample}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 transition-all shadow-2xs shrink-0 active:scale-[0.98] disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>{isLoading ? 'Loading Sample...' : 'Try Practice Sample Bill'}</span>
        </button>
      </div>

      {/* Safety & Integrity Guarantee Notice */}
      <div className="flex items-center space-x-3 px-4 py-3 bg-slate-100/70 border border-slate-200 rounded-xl text-slate-700 text-xs sm:text-sm">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Safe & Secure:</strong> Your original Excel files are never altered or overwritten. We only read the data to generate your combined letterhead PDF.
        </span>
      </div>

      {/* Upload Zone (When no file is selected) */}
      {currentBills.length === 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center transition-all bg-white cursor-pointer ${
            isDragOver
              ? 'border-slate-900 bg-slate-50/70 shadow-xs'
              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/40 shadow-xs'
          }`}
        >
          <input
            type="file"
            id="excel-upload-input"
            multiple
            accept=".xlsx,.xls,.xlsm"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200 shadow-xs">
              <UploadCloud className="w-7 h-7 text-slate-700" />
            </div>

            <div>
              <p className="text-base font-bold text-slate-900">
                Click here to choose your Excel bills, or drag them into this box
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Select 1 bill or multiple files (.xlsx, .xls) to combine into one PDF
              </p>
            </div>

            <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xs">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Browse Files on Computer</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected Bills Management Card */}
      {currentBills.length > 0 && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
          {/* Header Row: Bill Count & Add Another Bill Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-sm shadow-2xs">
                  {currentBills.length}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {currentBills.length === 1
                      ? '1 Bill Selected for PDF'
                      : `${currentBills.length} Bills in this Combined PDF`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {currentBills.length === 1
                      ? 'You can add more bills below to combine them into a single PDF.'
                      : 'All bills listed below will be generated sequentially in order.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action: Add Another Bill File */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => addFileInputRef.current?.click()}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Another Bill File</span>
              </button>
            </div>
          </div>

          {/* Multiple Worksheets Assistant Banner (If active workbook has other sheets) */}
          {unusedSheets.length > 0 && onAddAllSheetsAsBills && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <Layers className="w-5 h-5 text-blue-700 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-900">
                    This workbook contains {unusedSheets.length} additional worksheet{unusedSheets.length > 1 ? 's' : ''}:
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    {unusedSheets.slice(0, 3).join(', ')}
                    {unusedSheets.length > 3 ? ` and ${unusedSheets.length - 3} more` : ''}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onAddAllSheetsAsBills(activeBillIndex)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-2xs shrink-0 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Remaining Sheets as Bills</span>
              </button>
            </div>
          )}

          {/* Bills List / Queue */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
              <span className="flex items-center space-x-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-slate-500" />
                <span>Bills Sequence in PDF</span>
              </span>
              <span>Actions</span>
            </div>

            <div className="space-y-2.5">
              {currentBills.map((bill, index) => {
                const isSelected = index === activeBillIndex;
                const isFirst = index === 0;
                const isLast = index === currentBills.length - 1;

                return (
                  <div
                    key={bill.id || `bill-${index}`}
                    onClick={() => onSelectBillIndex && onSelectBillIndex(index)}
                    className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-50/80 border-slate-900 ring-1 ring-slate-900/10 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Left: Bill Identification */}
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {index + 1}
                      </span>

                      <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="w-4 h-4 text-slate-700" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {bill.filename}
                          </h4>
                          {currentBills.length > 1 && isSelected && (
                            <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-full">
                              Selected
                            </span>
                          )}
                        </div>

                        {/* Worksheet indicator or dropdown */}
                        <div className="flex items-center space-x-2 mt-1">
                          {bill.sheet_names && bill.sheet_names.length > 1 && onChangeBillSheet ? (
                            <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                              <span className="text-xs text-slate-500">Sheet:</span>
                              <select
                                value={bill.sheet_name}
                                onChange={(e) => onChangeBillSheet(index, e.target.value)}
                                className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                              >
                                {bill.sheet_names.map((name) => (
                                  <option key={name} value={name}>
                                    {name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">
                              Sheet: <strong>{bill.sheet_name}</strong>
                            </span>
                          )}

                          {bill.file_size && (
                            <span className="text-xs text-slate-400">
                              • {(bill.file_size / 1024).toFixed(0)} KB
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Reorder & Remove Controls */}
                    <div
                      className="flex items-center space-x-1.5 self-end sm:self-center shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Move Up */}
                      {onMoveBill && currentBills.length > 1 && (
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => onMoveBill(index, 'up')}
                          title="Move earlier in PDF"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Move Down */}
                      {onMoveBill && currentBills.length > 1 && (
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => onMoveBill(index, 'down')}
                          title="Move later in PDF"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Remove Button */}
                      {onRemoveBill && currentBills.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveBill(index)}
                          title="Remove this bill from PDF"
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowGridPreview(!showGridPreview)}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              {showGridPreview ? (
                <EyeOff className="w-4 h-4 text-slate-500" />
              ) : (
                <Eye className="w-4 h-4 text-slate-500" />
              )}
              <span>
                {showGridPreview
                  ? 'Hide Cell Data'
                  : `Inspect & Edit Cell Values (${activeBill?.filename || 'Bill'})`}
              </span>
            </button>

            {onContinue && (
              <button
                type="button"
                onClick={onContinue}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-xs transition-all active:scale-[0.98]"
              >
                <span>
                  {currentBills.length > 1
                    ? `Continue with ${currentBills.length} Bills to Letterhead`
                    : 'Continue to Letterhead'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Spreadsheet Data Grid */}
          {showGridPreview && activeBill?.preview_grid && (
            <div className="pt-4 border-t border-slate-100">
              <div className="mb-2">
                <p className="text-xs font-bold text-slate-800">
                  Editing Bill #{activeBillIndex + 1}: {activeBill.filename} ({activeBill.sheet_name})
                </p>
                <p className="text-xs text-slate-500">
                  Click any cell to correct typos or update numbers right now before generating the PDF.
                </p>
              </div>
              <SpreadsheetGrid
                data={activeBill.preview_grid}
                sheetNames={activeBill.sheet_names || [activeBill.sheet_name]}
                activeSheet={activeBill.sheet_name}
                onSelectSheet={(sheet) => onChangeBillSheet && onChangeBillSheet(activeBillIndex, sheet)}
                onSaveEdits={onSaveCellEdits}
                isSavingEdits={isSavingCellEdits}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
