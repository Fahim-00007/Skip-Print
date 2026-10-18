import React from 'react';
import { LayoutTemplate, Plus, Check, ArrowRight, ArrowLeft, Sparkles, FileText, Image as ImageIcon } from 'lucide-react';
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
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Step 2: Choose Company Letterhead</h2>
          <p className="text-sm text-slate-500 mt-1">
            Select the company pad or letterhead template your bill should be rendered on.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenUploadModal}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Existing Pad</span>
          </button>
          <button
            onClick={onOpenBuilderModal}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-900 text-white hover:bg-blue-800 transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>Design New Pad</span>
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
              className={`relative bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all flex flex-col shadow-xs group ${
                isSelected
                  ? 'border-blue-900 ring-4 ring-blue-900/10 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              {/* Thumbnail Area */}
              <div className="h-56 bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-200 relative p-3">
                <img
                  src={`/api/templates/${tpl.id}/preview-image`}
                  alt={tpl.name}
                  className="max-h-full max-w-full object-contain rounded shadow-sm bg-white border border-slate-200"
                  onError={(e) => {
                    // Fallback to placeholder if thumbnail image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />

                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}

                {/* Default Template Badge */}
                {tpl.is_default && (
                  <span className="absolute bottom-3 left-3 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full shadow-xs">
                    Default
                  </span>
                )}
              </div>

              {/* Template Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm group-hover:text-blue-900 transition-colors">
                    {tpl.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1.5 text-xs text-slate-500">
                    <span className="capitalize flex items-center space-x-1">
                      {tpl.type === 'uploaded_pdf' ? (
                        <>
                          <FileText className="w-3.5 h-3.5 text-red-500" />
                          <span>PDF Pad</span>
                        </>
                      ) : tpl.type === 'uploaded_image' ? (
                        <>
                          <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                          <span>Image Pad</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                          <span>Built-in Pad</span>
                        </>
                      )}
                    </span>
                    <span>•</span>
                    <span>{tpl.paper_size} {tpl.orientation}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Reserved Header: {tpl.margin_top}pt</span>
                  <span>Footer: {tpl.margin_bottom}pt</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Upload</span>
        </button>

        <button
          type="button"
          onClick={onContinue}
          disabled={!selectedTemplateId}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:hover:bg-blue-900 shadow-sm transition-all"
        >
          <span>Continue to Layout Adjustments</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
