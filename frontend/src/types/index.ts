export interface GridCell {
  coordinate: string;
  row: number;
  col: number;
  value: string;
  bold: boolean;
  fontSize: number;
  color?: string | null;
  fill?: string | null;
  alignH: string;
  alignV: string;
  hasBorder: boolean;
}

export interface SheetPreviewData {
  sheet_name: string;
  total_rows: number;
  total_cols: number;
  merged_ranges: string[];
  col_widths: Record<string, number>;
  row_heights: Record<string, number>;
  rows: GridCell[][];
}

export interface ExcelUploadResponse {
  file_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  sheet_names: string[];
  active_sheet: string;
  sheet_count: number;
  preview_grid: SheetPreviewData;
}

export interface BillItem {
  id: string; // unique key for UI list
  file_id: string;
  filename: string;
  sheet_name: string;
  sheet_names: string[];
  file_size: number;
  preview_grid?: SheetPreviewData;
}

export interface Template {
  id: string;
  name: string;
  type: 'uploaded_pdf' | 'uploaded_image' | 'custom_builder';
  paper_size: string;
  orientation: string;
  margin_top: number;
  margin_bottom: number;
  margin_left: number;
  margin_right: number;
  config?: any;
  is_default: boolean;
  has_preview: boolean;
  created_at: string;
}

export interface Signature {
  id: string;
  name: string;
  created_at: string;
  url: string;
}

export interface BlockItem {
  id: string; // 'table' | 'bill_meta' | 'client_info' | 'bank_notes'
  name: string;
  dx: number;
  dy: number;
  scale: number;
  visible: boolean;
}

export interface LayoutSettings {
  layout_mode: 'fit_pad' | 'preserve';
  paper_size: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margin_top: number;
  margin_bottom: number;
  margin_left: number;
  margin_right: number;
  scale_factor: number;
  offset_x: number;
  offset_y: number;
  repeat_letterhead: boolean;
  blocks?: BlockItem[];
}

export interface SignaturePlacement {
  signature_id: string;
  page: string; // 'last', 'all', or '1', '2'
  x: number; // in pt
  y: number; // in pt
  width: number;
  height: number;
  opacity: number;
  rotation: number;
  include_date?: boolean;
  date_text?: string;
}

export interface TextAnnotation {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  font_size: number;
  font_color: string;
  is_bold: boolean;
  page: string;
  rotation: number;
}

export interface RecentFile {
  id: string;
  excel_filename: string;
  output_pdf_filename: string;
  template_name: string;
  page_count: number;
  file_size: number;
  created_at: string;
  original_available: boolean;
  pdf_available: boolean;
  download_url: string;
  view_url: string;
}
