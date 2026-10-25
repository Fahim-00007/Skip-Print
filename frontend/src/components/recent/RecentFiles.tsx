import React from 'react';
import { RecentFile } from '../../types';
import { api } from '../../api/client';
import { Download, ExternalLink, Trash2, FileText, CheckCircle, Clock } from 'lucide-react';

interface RecentFilesProps {
  recentFiles: RecentFile[];
  onRefresh: () => void;
}

export const RecentFiles: React.FC<RecentFilesProps> = ({
  recentFiles,
  onRefresh
}) => {
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete record for '${name}'?`)) return;
    try {
      await api.deleteRecentRecord(id);
      onRefresh();
    } catch (err: any) {
      alert(`Error deleting record: ${err.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Saved Bills</h2>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {recentFiles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Generated PDF</th>
                  <th className="py-3 px-4">Source Excel</th>
                  <th className="py-3 px-4">Letterhead Template</th>
                  <th className="py-3 px-4">Pages & Size</th>
                  <th className="py-3 px-4">Generated At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* PDF name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-slate-900 truncate max-w-xs">
                          {file.output_pdf_filename}
                        </span>
                      </div>
                    </td>

                    {/* Excel name */}
                    <td className="py-3 px-4 text-slate-600 truncate max-w-xs">
                      {file.excel_filename}
                    </td>

                    {/* Template name */}
                    <td className="py-3 px-4">
                      <span className="inline-block bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded text-[11px] font-medium">
                        {file.template_name}
                      </span>
                    </td>

                    {/* Pages & Size */}
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {file.page_count} page{file.page_count > 1 ? 's' : ''} • {(file.file_size / 1024).toFixed(1)} KB
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(file.created_at).toLocaleString()}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <a
                          href={file.download_url}
                          download={file.output_pdf_filename}
                          className="p-1.5 rounded-md hover:bg-blue-50 text-blue-900 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>

                        <a
                          href={file.view_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                          title="Open PDF in new tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => handleDelete(file.id, file.output_pdf_filename)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No bills generated yet</p>
            <p className="text-xs text-slate-400 mt-1">Generated documents will appear here automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
};
