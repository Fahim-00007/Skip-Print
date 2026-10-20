import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Sparkles,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
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
  onContinue?: () => void;
}

export const Step1Upload: React.FC<Step1UploadProps> = ({
  excelData,
  isLoading,
  onFileUpload,
  onLoadSample,
  onSelectSheet,
  onSaveCellEdits,
  isSavingCellEdits = false,
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
      {/* Step Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Select Your Excel Bill
            </h2>
          </div>
          <p className="text-sm text-slate-600 mt-1 pl-8">
            Choose your bill or invoice spreadsheet. We will place it directly onto your company letterhead.
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
          <strong>Safe & Secure:</strong> Your original Excel file is never altered or deleted. We only read it to create your finished letterhead PDF.
        </span>
      </div>

      {/* Upload Zone (When no file is selected) */}
      {!excelData && (
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
                Click here to choose your Excel bill, or drag it into this box
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Standard Excel files (.xlsx, .xls) supported up to 50MB
              </p>
            </div>

            <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xs">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Browse Files on Computer</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected File Confirmation Card */}
      {excelData && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-900">{excelData.filename}</h3>
                  <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                    Ready
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {(excelData.file_size / 1024).toFixed(1)} KB • {excelData.sheet_count} worksheet
                  {excelData.sheet_count > 1 ? 's' : ''} detected
                </p>
              </div>
            </div>

            <label
              htmlFor="change-excel-input"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors shrink-0 shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
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

          {/* Worksheet selector if multiple sheets */}
          {excelData.sheet_names.length > 1 && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-800">Select Worksheet to Print:</p>
                <p className="text-xs text-slate-500">This workbook contains multiple sheets.</p>
              </div>
              <select
                value={excelData.active_sheet}
                onChange={(e) => onSelectSheet(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 font-semibold text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
              >
                {excelData.sheet_names.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowGridPreview(!showGridPreview)}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              {showGridPreview ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
              <span>{showGridPreview ? 'Hide Cell Data' : 'Inspect & Edit Cell Values (Optional)'}</span>
            </button>

            {onContinue && (
              <button
                type="button"
                onClick={onContinue}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-xs transition-all active:scale-[0.98]"
              >
                <span>Continue to Letterhead</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Spreadsheet Data Grid */}
          {showGridPreview && (
            <div className="pt-4 border-t border-slate-100">
              <div className="mb-2">
                <p className="text-xs font-bold text-slate-800">Direct Cell Editor:</p>
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
