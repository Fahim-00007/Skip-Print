import {
  ExcelUploadResponse,
  SheetPreviewData,
  Template,
  Signature,
  LayoutSettings,
  SignaturePlacement,
  TextAnnotation,
  RecentFile
} from '../types';

const API_BASE = '/api';

export const api = {
  // Health
  getHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Excel
  uploadExcel: async (file: File): Promise<ExcelUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/excel/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  loadSampleInvoice: async (): Promise<ExcelUploadResponse> => {
    const res = await fetch(`${API_BASE}/excel/load-sample`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Sample load failed' }));
      throw new Error(err.detail || 'Sample load failed');
    }
    return res.json();
  },

  getSheetPreview: async (fileId: string, sheetName: string): Promise<SheetPreviewData> => {
    const res = await fetch(`${API_BASE}/excel/${fileId}/sheet-preview?sheet=${encodeURIComponent(sheetName)}`);
    if (!res.ok) {
      throw new Error('Failed to fetch sheet preview');
    }
    return res.json();
  },

  updateCells: async (
    fileId: string,
    sheetName: string,
    updates: { coordinate?: string; row?: number; col?: number; value: string }[]
  ): Promise<{ success: boolean; sheet_name: string; preview_grid: SheetPreviewData }> => {
    const res = await fetch(`${API_BASE}/excel/${fileId}/update-cells`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sheet_name: sheetName,
        updates
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Cell update failed' }));
      throw new Error(err.detail || 'Cell update failed');
    }
    return res.json();
  },

  // Templates
  getTemplates: async (): Promise<Template[]> => {
    const res = await fetch(`${API_BASE}/templates`);
    if (!res.ok) throw new Error('Failed to fetch templates');
    return res.json();
  },

  uploadTemplate: async (formData: FormData): Promise<Template> => {
    const res = await fetch(`${API_BASE}/templates/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Template upload failed' }));
      throw new Error(err.detail || 'Template upload failed');
    }
    return res.json();
  },

  buildTemplate: async (data: any): Promise<{ id: string }> => {
    const res = await fetch(`${API_BASE}/templates/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Build failed' }));
      throw new Error(err.detail || 'Build failed');
    }
    return res.json();
  },

  uploadLogo: async (file: File): Promise<{ logo_file_id: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/templates/upload-logo`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Logo upload failed');
    return res.json();
  },

  setDefaultTemplate: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/templates/${id}/set-default`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to set default template');
  },

  duplicateTemplate: async (id: string): Promise<Template> => {
    const res = await fetch(`${API_BASE}/templates/${id}/duplicate`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to duplicate template');
    return res.json();
  },

  deleteTemplate: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/templates/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete template');
  },

  updateTemplateMargins: async (id: string, margins: Partial<Template>): Promise<void> => {
    const res = await fetch(`${API_BASE}/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(margins)
    });
    if (!res.ok) throw new Error('Failed to update template');
  },

  // Signatures
  getSignatures: async (): Promise<Signature[]> => {
    const res = await fetch(`${API_BASE}/signatures`);
    if (!res.ok) throw new Error('Failed to fetch signatures');
    return res.json();
  },

  uploadSignature: async (file: File, name: string): Promise<Signature> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    const res = await fetch(`${API_BASE}/signatures/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Signature upload failed' }));
      throw new Error(err.detail || 'Signature upload failed');
    }
    return res.json();
  },

  deleteSignature: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/signatures/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete signature');
  },

  // Render & Preview
  renderPreview: async (
    excelFileId: string,
    sheetName: string,
    templateId: string,
    layout: LayoutSettings,
    signature: SignaturePlacement | null,
    annotations: TextAnnotation[] = [],
    previewPage: number = 1,
    bills?: { excel_file_id: string; sheet_name?: string; title?: string }[]
  ): Promise<{
    success: boolean;
    total_pages: number;
    current_page: number;
    preview_data_url: string;
    engine: string;
    warning?: string;
  }> => {
    const res = await fetch(`${API_BASE}/render/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        excel_file_id: excelFileId,
        sheet_name: sheetName,
        bills: bills && bills.length > 0 ? bills : undefined,
        template_id: templateId,
        layout,
        signature: signature ? {
          signature_id: signature.signature_id,
          page: signature.page,
          x: signature.x,
          y: signature.y,
          width: signature.width,
          height: signature.height,
          opacity: signature.opacity,
          rotation: signature.rotation,
          include_date: signature.include_date,
          date_text: signature.date_text
        } : null,
        annotations,
        preview_page: previewPage
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Preview render failed' }));
      throw new Error(err.detail || 'Preview render failed');
    }
    return res.json();
  },

  generateFinalPdf: async (
    excelFileId: string,
    sheetName: string,
    templateId: string,
    layout: LayoutSettings,
    signature: SignaturePlacement | null,
    annotations: TextAnnotation[] = [],
    customFilename?: string,
    bills?: { excel_file_id: string; sheet_name?: string; title?: string }[]
  ): Promise<{
    id: string;
    filename: string;
    download_url: string;
    view_url: string;
    page_count: number;
    file_size: number;
  }> => {
    const res = await fetch(`${API_BASE}/render/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        excel_file_id: excelFileId,
        sheet_name: sheetName,
        bills: bills && bills.length > 0 ? bills : undefined,
        template_id: templateId,
        layout,
        signature: signature ? {
          signature_id: signature.signature_id,
          page: signature.page,
          x: signature.x,
          y: signature.y,
          width: signature.width,
          height: signature.height,
          opacity: signature.opacity,
          rotation: signature.rotation,
          include_date: signature.include_date,
          date_text: signature.date_text
        } : null,
        annotations,
        custom_filename: customFilename
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Generation failed' }));
      throw new Error(err.detail || 'Generation failed');
    }
    return res.json();
  },

  // Recent files
  getRecentFiles: async (): Promise<RecentFile[]> => {
    const res = await fetch(`${API_BASE}/recent`);
    if (!res.ok) throw new Error('Failed to fetch recent files');
    return res.json();
  },

  deleteRecentRecord: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/recent/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete recent record');
  },

  cleanupTemp: async (): Promise<{ cleaned_files_count: number }> => {
    const res = await fetch(`${API_BASE}/recent/cleanup`, { method: 'POST' });
    if (!res.ok) throw new Error('Cleanup failed');
    return res.json();
  }
};
