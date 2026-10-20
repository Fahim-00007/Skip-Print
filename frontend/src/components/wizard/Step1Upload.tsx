import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Sparkles, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle, FolderOpen, RefreshCw } from 'lucide-react';
import { ExcelUploadResponse } from '../../types';
import { SpreadsheetGrid } from '../preview/SpreadsheetGrid';

interface Step1UploadProps {
  excelData: ExcelUploadResponse | null;
  isLoading: boolean;
  onFileUpload: (file: File) => void;
  onLoadSample: () => void;
  onSelectSheet: (sheetName: string) => void;
  onSaveCellEdits?: (updates: { coordinate: string; value: string }[]) => Promise<void>;
  isSavingCellEdits?: boolean;
  onContinue: () => void;
}

export const Step1Upload: React.FC<Step1UploadProps> = ({
  excelData,
  isLoading,
  onFileUpload,
  onLoadSample,
  onSelectSheet,
  onSaveCellEdits,
  isSavingCellEdits,
  onContinue
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showGridPreview, setShowGridPreview] = useState(false);

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
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Friendly Reassurance Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
              1
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Select Your Excel Bill File
            </h2>
          </div>
          <p className="text-base text-slate-600 pl-9">
            Choose your bill or invoice from your computer. We will place it onto your company letterhead.
          </p>
        </div>

        {/* Practice test button */}
        <button
          onClick={onLoadSample}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 transition-colors shrink-0 shadow-xs disabled:opacity-50"
          title="Try with a ready-made sample invoice"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>{isLoading ? 'Loading Sample...' : 'Try a Practice Sample Bill'}</span>
        </button>
      </div>

      {/* Safety Reassurance Notice */}
      <div className="flex items-center space-x-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
        <span className="font-medium">
          <strong>Safe & Secure:</strong> Your original Excel file will never be altered or deleted. We only read it to produce your finished PDF.
        </span>
      </div>

      {/* Upload Drop Zone - Made Very Large and Obvious */}
      {!excelData && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-3 border-dashed rounded-2xl p-10 sm:p-14 text-center transition-all bg-white cursor-pointer ${
            isDragOver
              ? 'border-blue-700 bg-blue-50/70 ring-4 ring-blue-500/20 shadow-md'
              : 'border-slate-300 hover:border-blue-600 hover:bg-blue-50/20 shadow-xs'
          }`}
        >
          <input
            type="file"
            id="excel-upload-input"
            accept=".xlsx,.xls,.xlsm"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center shadow-inner">
              <UploadCloud className="w-10 h-10" />
            </div>

            <div className="space-y-1.5 max-w-lg">
              <h3 className="text-xl font-bold text-slate-900">
                Click here to choose your Excel bill
              </h3>
              <p className="text-sm text-slate-500">
                or drag and drop your file into this box from your desktop or folder
              </p>
            </div>

            <div className="pt-2">
              <span className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all pointer-events-none">
                <FolderOpen className="w-5 h-5" />
                <span>Browse Files on Computer (.xlsx or .xls)</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 pt-2">
              Supports Microsoft Excel (.xlsx), older Excel workbooks (.xls), and Excel macro files (.xlsm)
            </p>
          </div>
        </div>
      )}

      {/* Uploaded File Confirmation Card */}
      {excelData && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-emerald-300 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-start sm:items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0 shadow-xs">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    File Ready
                  </span>
                  <span className="text-xs text-slate-500">
                    {(excelData.file_size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                  {excelData.filename}
                </h3>
                <p className="text-sm text-slate-600">
                  Detected {excelData.sheet_count} worksheet{excelData.sheet_count > 1 ? 's' : ''} in this workbook.
                </p>
              </div>
            </div>

            {/* Choose Different File Button */}
            <label
              htmlFor="change-excel-input"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shrink-0"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <span>Change File</span>
              <input
                id="change-excel-input"
                type="file"
                accept=".xlsx,.xls,.xlsm"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Worksheet Selector if multi-sheet */}
          {excelData.sheet_names.length > 1 && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">Which sheet do you want to print?</p>
                <p className="text-xs text-slate-500">This Excel file has more than one sheet.</p>
              </div>
              <select
                value={excelData.active_sheet}
                onChange={(e) => onSelectSheet(e.target.value)}
                className="bg-white border-2 border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-bold text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {excelData.sheet_names.map((name) => (
                  <option key={name} value={name}>
                    Worksheet: {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Bottom Action Buttons: Big & Friendly */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowGridPreview(!showGridPreview)}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {showGridPreview ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
              <span>{showGridPreview ? 'Hide Sheet Data' : 'Inspect & Edit Cell Values (Optional)'}</span>
            </button>

            {/* Giant Next Step Button */}
            <button
              type="button"
              onClick={onContinue}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-3.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-base shadow-md hover:shadow-lg transition-all"
            >
              <span>Next: Choose Company Letterhead</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Spreadsheet Data Grid with Cell Editing */}
          {showGridPreview && (
            <div className="pt-4 border-t border-slate-200">
              <div className="mb-2">
                <p className="text-sm font-bold text-slate-900">Direct Cell Editor:</p>
                <p className="text-xs text-slate-500">Click any cell to correct typos or update numbers right now.</p>
              </div>
              <SpreadsheetGrid
                data={excelData.preview_grid}
                sheetNames={excelData.sheet_names}
                activeSheet={excelData.active_sheet}
                onSelectSheet={onSelectSheet}
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
