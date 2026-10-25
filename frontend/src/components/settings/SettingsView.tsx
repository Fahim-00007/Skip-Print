import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { ShieldCheck, Server, Database, Trash2, CheckCircle2, Lock } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [cleaning, setCleaning] = useState(false);
  const [cleanResult, setCleanResult] = useState<string | null>(null);

  useEffect(() => {
    api.getHealth().then(setHealth).catch(console.error);
  }, []);

  const handleCleanTemp = async () => {
    setCleaning(true);
    setCleanResult(null);
    try {
      const res = await api.cleanupTemp();
      setCleanResult(`Cleaned ${res.cleaned_files_count} temporary preview file(s).`);
    } catch (err: any) {
      setCleanResult(`Cleanup error: ${err.message}`);
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Settings</h2>
      </div>

      {/* Engine Status Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Server className="w-4 h-4 text-blue-900" />
          <span>Document Processing Engines</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-900">Microsoft Excel Native COM</span>
              {health?.excel_com_available ? (
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Active & Ready</span>
                </span>
              ) : (
                <span className="text-[11px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                  Not Installed
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600">
              Exports Excel sheets with 100% vector fidelity, preserving font faces, exact row heights, column widths, print areas, and page setup without rasterization.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-900">Python ReportLab Fallback</span>
              <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Active Fallback</span>
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Parses .xlsx / .xls cells and formats with openpyxl/xlrd and renders clean vector table documents even in standalone environments.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy & Security Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>Local Data Privacy & Storage</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-600">
          <p>
            BillCraft operates <strong>100% locally</strong> on your workstation. No invoices, client data, prices, or signatures are ever transmitted to third-party servers or external AI services.
          </p>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
            <div>Database: <code>storage/billcraft.db</code> (SQLite)</div>
            <div>Templates & Signatures: <code>storage/templates/</code>, <code>storage/signatures/</code></div>
            <div>Output Documents: <code>storage/outputs/</code></div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="font-semibold text-xs text-slate-800 block">Clean Temporary Files</span>
            <span className="text-[11px] text-slate-400">Clears temporary page preview images and intermediate PDFs</span>
          </div>
          <button
            onClick={handleCleanTemp}
            disabled={cleaning}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{cleaning ? 'Cleaning...' : 'Clear Temp Cache'}</span>
          </button>
        </div>
        {cleanResult && (
          <div className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
            {cleanResult}
          </div>
        )}
      </div>
    </div>
  );
};
