import React from 'react';
import { FileSpreadsheet, LayoutTemplate, PenTool, History, Settings, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'wizard' | 'templates' | 'signatures' | 'recent' | 'settings';
  setActiveTab: (tab: 'wizard' | 'templates' | 'signatures' | 'recent' | 'settings') => void;
  onLoadSample: () => void;
  isLoadingSample: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onLoadSample,
  isLoadingSample
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('wizard')}>
            <div className="w-10 h-10 rounded-lg bg-blue-900 flex items-center justify-center text-white shadow-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">BillCraft</span>
                <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                  Pro PDF
                </span>
              </div>
              <p className="text-xs text-slate-500">Excel to Letterhead PDF Generator</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1">
            <button
              onClick={() => setActiveTab('wizard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'wizard'
                  ? 'bg-blue-50 text-blue-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Create PDF</span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'templates'
                  ? 'bg-blue-50 text-blue-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutTemplate className="w-4 h-4" />
              <span>My Templates</span>
            </button>

            <button
              onClick={() => setActiveTab('signatures')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'signatures'
                  ? 'bg-blue-50 text-blue-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Signatures</span>
            </button>

            <button
              onClick={() => setActiveTab('recent')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'recent'
                  ? 'bg-blue-50 text-blue-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Recent Bills</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-blue-50 text-blue-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Load Sample Bill Quick Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onLoadSample}
              disabled={isLoadingSample}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors shadow-sm disabled:opacity-50"
              title="Instantly test with pre-loaded realistic sample invoice and letterhead"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{isLoadingSample ? 'Loading...' : 'Try Sample Invoice'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
