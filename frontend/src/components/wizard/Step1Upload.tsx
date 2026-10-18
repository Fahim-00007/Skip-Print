import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Sparkles, Eye, EyeOff, ArrowRight } from 'lucide-react';
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
      {/* Introduction Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Step 1: Upload Excel Bill</h2>
          <p className="text-sm text-slate-500 mt-1">
            Upload your Excel bill or invoice (.xlsx or .xls). You can inspect and edit any cell directly before printing.
          </p>
        </div>
        <button
          onClick={onLoadSample}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 transition-colors shrink-0 shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Load Sample Commercial Invoice</span>
        </button>
      </div>

      {/* Upload Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all bg-white ${
          isDragOver
            ? 'border-blue-600 bg-blue-50/40 ring-4 ring-blue-500/10'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <input
          type="file"
          id="excel-upload-input"
          accept=".xlsx,.xls,.xlsm"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-800 border border-blue-100 shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <p className="text-base font-semibold text-slate-800">
              Drag & drop your Excel bill here, or <span className="text-blue-800 hover:underline">browse files</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports standard Microsoft Excel (.xlsx) and legacy workbooks (.xls) up to 50MB
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded File Details Card */}
      {excelData && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">{excelData.filename}</h4>
                <p className="text-xs text-slate-500">
                  {(excelData.file_size / 1024).toFixed(1)} KB • {excelData.sheet_count} worksheet{excelData.sheet_count > 1 ? 's' : ''} detected
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowGridPreview(!showGridPreview)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                {showGridPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showGridPreview ? 'Hide Sheet Data' : 'Inspect & Edit Sheet Cells'}</span>
              </button>

              <button
                type="button"
                onClick={onContinue}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 shadow-sm transition-all"
              >
                <span>Continue to Letterhead</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Worksheet selector if multiple */}
          {excelData.sheet_names.length > 1 && (
            <div className="flex items-center space-x-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-medium text-slate-700">Select Sheet to Print:</span>
              <select
                value={excelData.active_sheet}
                onChange={(e) => onSelectSheet(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {excelData.sheet_names.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Spreadsheet Data Grid with Cell Editing */}
          {showGridPreview && (
            <div className="pt-2">
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
