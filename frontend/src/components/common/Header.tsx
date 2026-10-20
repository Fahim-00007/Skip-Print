import React, { useState } from 'react';
import { FileSpreadsheet, LayoutTemplate, PenTool, History, Settings, Sparkles, HelpCircle } from 'lucide-react';
import { SimpleGuideModal } from './SimpleGuideModal';

interface HeaderProps {
  activeTab: 'wizard' | 'templates' | 'signatures' | 'recent' | 'settings';
  setActiveTab: (tab: 'wizard' | 'templates' | 'signatures' | 'recent' | 'settings') => void;
  onLoadSample: () => void;
  isLoadingSample: boolean;
  seniorMode?: boolean;
  onToggleSeniorMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onLoadSample,
  isLoadingSample,
  seniorMode = true,
  onToggleSeniorMode
}) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 select-none shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo & Title */}
            <div
              className="flex items-center space-x-3 cursor-pointer py-1"
              onClick={() => setActiveTab('wizard')}
            >
              <div className="w-11 h-11 rounded-xl bg-blue-900 flex items-center justify-center text-white shadow-sm">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">BillCraft</span>
                  <span className="text-xs font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Easy Mode
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600">Print Excel Bills Directly onto Company Letterheads</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex space-x-1">
              <button
                onClick={() => setActiveTab('wizard')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'wizard'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>1. Make Bill</span>
              </button>

              <button
                onClick={() => setActiveTab('templates')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'templates'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutTemplate className="w-4 h-4" />
                <span>Letterheads</span>
              </button>

              <button
                onClick={() => setActiveTab('signatures')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'signatures'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span>Signatures</span>
              </button>

              <button
                onClick={() => setActiveTab('recent')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'recent'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Saved Bills</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </nav>

            {/* Senior Assistance & Helper Controls */}
            <div className="flex items-center space-x-2.5">
              {/* Simple Guide Button */}
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs hover:bg-emerald-100 transition-colors shadow-2xs"
                title="Open easy beginner's instructions"
              >
                <HelpCircle className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">Simple Guide</span>
              </button>

              {/* Large Text / Easy Reading Mode Toggle */}
              {onToggleSeniorMode && (
                <button
                  type="button"
                  onClick={onToggleSeniorMode}
                  className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition-all ${
                    seniorMode
                      ? 'bg-blue-50 text-blue-900 border-blue-300 ring-2 ring-blue-500/20 shadow-2xs'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                  title="Toggle larger fonts and simplified controls"
                >
                  <span className="text-base leading-none">🔍</span>
                  <span className="hidden lg:inline">{seniorMode ? 'Large Text: ON' : 'Normal Text'}</span>
                </button>
              )}

              {/* Load Sample Bill Quick Button */}
              <button
                onClick={onLoadSample}
                disabled={isLoadingSample}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-lg text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors shadow-2xs disabled:opacity-50"
                title="Test with a realistic pre-loaded bill without needing your own files"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{isLoadingSample ? 'Loading...' : 'Try Test Bill'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Beginner / Senior Simple Guide Modal */}
      <SimpleGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onLoadSample={onLoadSample}
      />
    </>
  );
};
