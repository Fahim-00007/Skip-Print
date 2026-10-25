import React, { useState } from 'react';
import { X, Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { api } from '../../api/client';
import { Template } from '../../types';

interface TemplateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTemplate: Template) => void;
}

export const TemplateUploadModal: React.FC<TemplateUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [paperSize, setPaperSize] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [marginTop, setMarginTop] = useState(105);
  const [marginBottom, setMarginBottom] = useState(60);
  const [marginLeft, setMarginLeft] = useState(36);
  const [marginRight, setMarginRight] = useState(36);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF or image file for the letterhead.');
      return;
    }
    if (!name.trim()) {
      setError('Please enter a name for this template.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('paper_size', paperSize);
      formData.append('orientation', orientation);
      formData.append('margin_top', String(marginTop));
      formData.append('margin_bottom', String(marginBottom));
      formData.append('margin_left', String(marginLeft));
      formData.append('margin_right', String(marginRight));

      const newTpl = await api.uploadTemplate(formData);
      onSuccess(newTpl);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload template');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Upload Letterhead</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Template Name */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Letterhead Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corp Official Letterhead 2026"
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* File Picker */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Letterhead File (PDF, PNG, JPG)
            </label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setFile(e.target.files[0]);
                  if (!name) {
                    setName(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                  }
                }
              }}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100"
            />
          </div>

          {/* Paper Size & Orientation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Paper Size</label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="Letter">Letter (8.5 × 11 in)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Orientation</label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          </div>

          {/* Reserved Margins for Letterhead */}
          <div className="pt-2 border-t border-slate-100">
            <label className="font-semibold text-slate-700 block mb-1.5">
              Reserved Header & Footer Margins (Points)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-500 block">Top (Header Height):</span>
                <input
                  type="number"
                  value={marginTop}
                  onChange={(e) => setMarginTop(Number(e.target.value))}
                  className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 text-slate-800"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Bottom (Footer Height):</span>
                <input
                  type="number"
                  value={marginBottom}
                  onChange={(e) => setMarginBottom(Number(e.target.value))}
                  className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 text-slate-800"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Left Margin:</span>
                <input
                  type="number"
                  value={marginLeft}
                  onChange={(e) => setMarginLeft(Number(e.target.value))}
                  className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 text-slate-800"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Right Margin:</span>
                <input
                  type="number"
                  value={marginRight}
                  onChange={(e) => setMarginRight(Number(e.target.value))}
                  className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Uploading...' : 'Save Letterhead Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
