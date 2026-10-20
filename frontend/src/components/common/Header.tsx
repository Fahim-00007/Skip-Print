import React, { useState } from 'react';
import {
  FileSpreadsheet,
  LayoutTemplate,
  PenTool,
  History,
  Settings,
  Sparkles,
  HelpCircle,
  Type
} from 'lucide-react';
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

  const navItems = [
    { id: 'wizard' as const, label: 'Create Bill', icon: FileSpreadsheet },
    { id: 'templates' as const, label: 'Letterheads', icon: LayoutTemplate },
    { id: 'signatures' as const, label: 'Signatures', icon: PenTool },
    { id: 'recent' as const, label: 'Saved Bills', icon: History },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Product Identity */}
            <div
              className="flex items-center space-x-3 cursor-pointer py-1 group"
              onClick={() => setActiveTab('wizard')}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-slate-800 transition-colors">
                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg tracking-tight text-slate-900">BillCraft</span>
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                    Pro
                  </span>
                </div>
                <p className="text-xs text-slate-500">Print Excel onto Company Letterheads</p>
              </div>
            </div>

            {/* Navigation Tabs - Consistent Segmented Bar */}
            <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Action Utilities - Unified Styling */}
            <div className="flex items-center space-x-2">
              {/* Load Sample Test Bill */}
              <button
                type="button"
                onClick={onLoadSample}
                disabled={isLoadingSample}
                className="inline-flex items-center space-x-1.5 h-9 px-3 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
                title="Practice with a sample invoice"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">{isLoadingSample ? 'Loading...' : 'Try Sample Bill'}</span>
              </button>

              {/* Simple Guide Dialog */}
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="inline-flex items-center space-x-1.5 h-9 px-3 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-all active:scale-[0.98]"
                title="Easy beginner guide"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Simple Guide</span>
              </button>

              {/* Senior / Large Text Toggle */}
              {onToggleSeniorMode && (
                <button
                  type="button"
                  onClick={onToggleSeniorMode}
                  className={`inline-flex items-center space-x-1.5 h-9 px-3 rounded-lg text-xs font-semibold border transition-all active:scale-[0.98] ${
                    seniorMode
                      ? 'bg-blue-50 text-blue-900 border-blue-200 shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
                  }`}
                  title="Toggle large text reading mode"
                >
                  <Type className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden lg:inline">{seniorMode ? 'Large Text: ON' : 'Normal Text'}</span>
                </button>
              )}
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
