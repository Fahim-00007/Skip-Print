import React, { useState } from 'react';
import { Template } from '../../types';
import { api } from '../../api/client';
import { Plus, Sparkles, Copy, Trash2, Star, FileText, Image as ImageIcon, Sliders, LayoutTemplate } from 'lucide-react';
import { TemplateUploadModal } from './TemplateUploadModal';
import { TemplateBuilderModal } from './TemplateBuilderModal';

interface TemplateManagerProps {
  templates: Template[];
  onRefresh: () => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  onRefresh
}) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const handleSetDefault = async (id: string) => {
    try {
      await api.setDefaultTemplate(id);
      onRefresh();
    } catch (err: any) {
      alert(`Error setting default: ${err.message}`);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.duplicateTemplate(id);
      onRefresh();
    } catch (err: any) {
      alert(`Error duplicating template: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete template '${name}'?`)) return;
    try {
      await api.deleteTemplate(id);
      onRefresh();
    } catch (err: any) {
      alert(`Error deleting template: ${err.message}`);
    }
  };

  const handleSaveMargins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    try {
      await api.updateTemplateMargins(editingTemplate.id, {
        name: editingTemplate.name,
        margin_top: editingTemplate.margin_top,
        margin_bottom: editingTemplate.margin_bottom,
        margin_left: editingTemplate.margin_left,
        margin_right: editingTemplate.margin_right
      });
      setEditingTemplate(null);
      onRefresh();
    } catch (err: any) {
      alert(`Error updating margins: ${err.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* View Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Letterhead Templates</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your company pads, upload existing pre-printed designs, or visually build custom templates.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Letterhead</span>
          </button>
          <button
            onClick={() => setIsBuilderOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>Design New Pad</span>
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
          >
            {/* Thumbnail */}
            <div className="h-60 bg-slate-100 p-3 flex items-center justify-center relative border-b border-slate-200 overflow-hidden">
              <img
                src={`/api/templates/${tpl.id}/preview-image`}
                alt={tpl.name}
                loading="lazy"
                className="max-h-full max-w-full object-contain rounded bg-white shadow-sm border border-slate-200"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.triedThumbnail) {
                    target.dataset.triedThumbnail = 'true';
                    target.src = `/api/templates/${tpl.id}/thumbnail`;
                    return;
                  }
                  target.style.display = 'none';
                  if (target.nextElementSibling) {
                    (target.nextElementSibling as HTMLElement).style.display = 'flex';
                  }
                }}
              />
              <div className="hidden flex-col items-center justify-center text-slate-400 space-y-2">
                <LayoutTemplate className="w-8 h-8 stroke-1" />
                <span className="text-xs font-medium">Letterhead Preview</span>
              </div>

              {tpl.is_default && (
                <span className="absolute top-3 left-3 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full shadow-xs flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                  <span>Default Template</span>
                </span>
              )}
            </div>

            {/* Template Info & Actions */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{tpl.name}</h4>
                <div className="flex items-center space-x-2 mt-1.5 text-xs text-slate-500">
                  <span className="capitalize flex items-center space-x-1">
                    {tpl.type === 'uploaded_pdf' ? (
                      <><FileText className="w-3.5 h-3.5 text-red-500" /><span>PDF Vector Pad</span></>
                    ) : tpl.type === 'uploaded_image' ? (
                      <><ImageIcon className="w-3.5 h-3.5 text-blue-500" /><span>Image Pad</span></>
                    ) : (
                      <><Sparkles className="w-3.5 h-3.5 text-purple-500" /><span>Visual Builder</span></>
                    )}
                  </span>
                  <span>•</span>
                  <span>{tpl.paper_size} {tpl.orientation}</span>
                </div>

                <div className="mt-2 text-[11px] text-slate-400 bg-slate-50 p-2 rounded border border-slate-100 space-y-0.5">
                  <div>Header Margin: <strong>{tpl.margin_top}pt</strong> | Footer Margin: <strong>{tpl.margin_bottom}pt</strong></div>
                  <div>Left/Right Margins: <strong>{tpl.margin_left}pt / {tpl.margin_right}pt</strong></div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                {!tpl.is_default ? (
                  <button
                    onClick={() => handleSetDefault(tpl.id)}
                    className="inline-flex items-center space-x-1 text-slate-600 hover:text-amber-600 font-medium"
                    title="Set as default template"
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Set Default</span>
                  </button>
                ) : (
                  <span className="text-amber-600 font-semibold text-[11px]">Primary Default</span>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingTemplate(tpl)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                    title="Edit Margins"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(tpl.id)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                    title="Duplicate Template"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tpl.id, tpl.name)}
                    className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                    title="Delete Template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      <TemplateUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => onRefresh()}
      />

      {/* Builder Modal */}
      <TemplateBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onSuccess={() => onRefresh()}
      />

      {/* Edit Margins Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Adjust Template Margins</h3>
            <form onSubmit={handleSaveMargins} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Template Name</label>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Header Margin (pt):</label>
                  <input
                    type="number"
                    value={editingTemplate.margin_top}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, margin_top: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Footer Margin (pt):</label>
                  <input
                    type="number"
                    value={editingTemplate.margin_bottom}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, margin_bottom: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Left Margin (pt):</label>
                  <input
                    type="number"
                    value={editingTemplate.margin_left}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, margin_left: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Right Margin (pt):</label>
                  <input
                    type="number"
                    value={editingTemplate.margin_right}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, margin_right: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
