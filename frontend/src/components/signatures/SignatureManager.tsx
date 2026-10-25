import React, { useState, useRef } from 'react';
import { Signature } from '../../types';
import { api } from '../../api/client';
import { PenTool, Upload, Trash2, Plus } from 'lucide-react';

interface SignatureManagerProps {
  signatures: Signature[];
  onRefresh: () => void;
}

export const SignatureManager: React.FC<SignatureManagerProps> = ({
  signatures,
  onRefresh
}) => {
  const [name, setName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const defaultName = file.name.replace(/\.[^/.]+$/, '');
      const sigName = prompt('Enter a name for this signature:', defaultName) || defaultName;

      setIsUploading(true);
      try {
        await api.uploadSignature(file, sigName);
        onRefresh();
      } catch (err: any) {
        alert(`Error uploading signature: ${err.message}`);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete signature '${name}'?`)) return;
    try {
      await api.deleteSignature(id);
      onRefresh();
    } catch (err: any) {
      alert(`Error deleting signature: ${err.message}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* View Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Signatures</h2>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs active:scale-[0.98] disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{isUploading ? 'Uploading...' : 'Upload PNG Signature'}</span>
          </button>
        </div>
      </div>

      {/* Signatures Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {signatures.map((sig) => (
          <div
            key={sig.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
          >
            {/* Transparent checkerboard preview box */}
            <div
              className="h-36 rounded-lg border border-slate-200 flex items-center justify-center p-3 overflow-hidden shadow-inner relative"
              style={{
                backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                backgroundSize: '12px 12px',
                backgroundColor: '#f8fafc'
              }}
            >
              <img
                src={sig.url}
                alt={sig.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-900 text-xs">{sig.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Saved on {new Date(sig.created_at).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => handleDelete(sig.id, sig.name)}
                className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                title="Delete signature"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {signatures.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
            <PenTool className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No signatures uploaded yet</p>
            <p className="text-xs text-slate-400 mt-1">Upload a transparent PNG signature above.</p>
          </div>
        )}
      </div>
    </div>
  );
};
