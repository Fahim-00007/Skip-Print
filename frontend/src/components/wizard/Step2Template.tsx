import React from 'react';
import {
  LayoutTemplate,
  Plus,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { Template } from '../../types';

interface Step2TemplateProps {
  templates: Template[];
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string) => void;
  onOpenUploadModal: () => void;
  onOpenBuilderModal: () => void;
  onBack: () => void;
  onContinue: () => void;
}

export const Step2Template: React.FC<Step2TemplateProps> = ({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onOpenUploadModal,
  onOpenBuilderModal,
  onBack,
  onContinue
}) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              2
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Choose Company Letterhead
            </h2>
          </div>
          <p className="text-sm text-slate-600 mt-1 pl-8">
            Click on the letterhead design you want your bill to be printed onto.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
            <span>Upload Letterhead</span>
          </button>
          <button
            type="button"
            onClick={onOpenBuilderModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Design New</span>
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {templates.map((tpl) => {
          const isSelected = selectedTemplateId === tpl.id;
          return (
            <div
              key={tpl.id}
              onClick={() => onSelectTemplate(tpl.id)}
              className={`group relative bg-white rounded-2xl border cursor-pointer transition-all flex flex-col overflow-hidden ${
                isSelected
                  ? 'border-2 border-slate-900 shadow-sm ring-2 ring-slate-900/10'
                  : 'border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="h-60 bg-slate-50 flex items-center justify-center overflow-hidden border-b border-slate-100 relative p-4">
                <img
                  src={`http://127.0.0.1:8000/api/templates/${tpl.id}/thumbnail`}
                  alt={tpl.name}
                  className="max-h-full max-w-full object-contain shadow-xs rounded-sm border border-slate-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div className="hidden flex-col items-center justify-center text-slate-400 space-y-2">
                  <LayoutTemplate className="w-8 h-8 stroke-1" />
                  <span className="text-xs font-medium">Letterhead Preview</span>
                </div>

                {/* Selection Badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3 bg-slate-900 text-white rounded-full p-1 shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Card Meta & Action */}
              <div className="p-4 flex flex-col justify-between flex-1 space-y-3 bg-white">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 truncate">{tpl.name}</h3>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                      {tpl.paper_size} {tpl.orientation}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 capitalize">
                    {tpl.type.replace('_', ' ')} letterhead
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplate(tpl.id);
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Letterhead Selected</span>
                    </>
                  ) : (
                    <span>Select This Letterhead</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Excel Bill</span>
        </button>

        <button
          type="button"
          onClick={onContinue}
          disabled={!selectedTemplateId}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold text-sm shadow-xs transition-all active:scale-[0.98]"
        >
          <span>Continue to Adjust Position</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
