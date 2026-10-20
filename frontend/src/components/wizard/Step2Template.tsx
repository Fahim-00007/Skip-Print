import React from 'react';
import { LayoutTemplate, Plus, Check, ArrowRight, ArrowLeft, Sparkles, FileText, Image as ImageIcon, CheckCircle } from 'lucide-react';
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
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
              2
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Choose Your Company Letterhead
            </h2>
          </div>
          <p className="text-base text-slate-600 pl-9">
            Click on the company pad design you want your bill to be printed onto.
          </p>
        </div>

        {/* Action Buttons for Custom Letterheads */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenUploadModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4 text-blue-900" />
            <span>Upload My Company Pad</span>
          </button>
          <button
            onClick={onOpenBuilderModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-bold rounded-xl bg-blue-900 text-white hover:bg-blue-800 transition-colors shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>Design New Pad</span>
          </button>
        </div>
      </div>

      {/* Helpful Hint */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 text-sm flex items-center justify-between">
        <span className="font-medium">
          💡 <strong>Tip:</strong> Simply click any card below to pick it. You can see how it looks with your bill in the next step.
        </span>
        {selectedTemplateId && (
          <span className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
            <CheckCircle className="w-4 h-4" />
            <span>Pad Selected</span>
          </span>
        )}
      </div>

      {/* Templates Grid with Clear Previews & Easy Touch Targets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {templates.map((tpl) => {
          const isSelected = selectedTemplateId === tpl.id;
          return (
            <div
              key={tpl.id}
              onClick={() => onSelectTemplate(tpl.id)}
              className={`relative bg-white rounded-2xl border-3 overflow-hidden cursor-pointer transition-all flex flex-col shadow-xs hover:shadow-md ${
                isSelected
                  ? 'border-blue-900 ring-4 ring-blue-900/15 bg-blue-50/20'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              {/* Thumbnail Area */}
              <div className="h-64 bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-200 relative p-4">
                <img
                  src={`/api/templates/${tpl.id}/preview-image`}
                  alt={tpl.name}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-sm bg-white border border-slate-200"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />

                {/* Selected Indicator Badge */}
                {isSelected ? (
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-blue-900 text-white flex items-center space-x-1.5 shadow-md">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span className="text-xs font-extrabold uppercase tracking-wide">Selected</span>
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-slate-600 border border-slate-300 text-xs font-semibold shadow-xs">
                    Click to Pick
                  </div>
                )}

                {/* Default Template Badge */}
                {tpl.is_default && (
                  <span className="absolute bottom-3 left-3 text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg shadow-xs">
                    Standard Pad
                  </span>
                )}
              </div>

              {/* Template Info & Select Button */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-base leading-snug">
                    {tpl.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-2 text-xs text-slate-600 font-medium">
                    <span className="capitalize flex items-center space-x-1.5">
                      {tpl.type === 'uploaded_pdf' ? (
                        <>
                          <FileText className="w-4 h-4 text-red-600" />
                          <span>PDF Letterhead</span>
                        </>
                      ) : tpl.type === 'uploaded_image' ? (
                        <>
                          <ImageIcon className="w-4 h-4 text-blue-600" />
                          <span>Image Letterhead</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-blue-700" />
                          <span>Built-in Pad</span>
                        </>
                      )}
                    </span>
                    <span>•</span>
                    <span>{tpl.paper_size} {tpl.orientation}</span>
                  </div>
                </div>

                {/* Big Select Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplate(tpl.id);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${
                    isSelected
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Using This Letterhead</span>
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

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Excel File</span>
        </button>

        <button
          type="button"
          onClick={onContinue}
          disabled={!selectedTemplateId}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl bg-blue-900 text-white text-base font-extrabold hover:bg-blue-800 disabled:opacity-50 disabled:hover:bg-blue-900 shadow-md hover:shadow-lg transition-all"
        >
          <span>Next: Check Layout & Position</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
