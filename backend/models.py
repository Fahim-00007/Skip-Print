"""
Pydantic data models for the BillCraft API.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class TextAnnotation(BaseModel):
    id: str
    text: str
    x: float
    y: float
    width: float = 180.0
    height: float = 36.0
    font_size: float = 12.0
    font_color: str = "#1E3A8A"
    is_bold: bool = False
    page: str = "all" # 'all', '1', '2', 'last'
    rotation: int = 0

class BlockItem(BaseModel):
    id: str # 'table', 'bill_meta', 'client_info', 'bank_notes'
    name: str # 'Line Items Table', 'Bill # & Date', 'Client Info', 'Bank Details'
    dx: float = 0.0
    dy: float = 0.0
    scale: float = 1.0
    visible: bool = True

class LayoutSettings(BaseModel):
    layout_mode: str = "fit_pad" # 'fit_pad' or 'preserve'
    paper_size: str = "A4"       # 'A4' or 'Letter'
    orientation: str = "portrait"# 'portrait' or 'landscape'
    margin_top: float = 105.0
    margin_bottom: float = 60.0
    margin_left: float = 36.0
    margin_right: float = 36.0
    scale_factor: float = 1.0
    offset_x: float = 0.0
    offset_y: float = 0.0
    repeat_letterhead: bool = True
    blocks: Optional[List[BlockItem]] = Field(default_factory=list)

class SignatureSettings(BaseModel):
    signature_id: Optional[str] = None
    page: str = "last" # 'all', 'last', 'each_bill', or '1', '2'...
    x: float = 380.0
    y: float = 680.0
    width: float = 140.0
    height: float = 60.0
    opacity: float = 1.0
    rotation: int = 0

class BillItem(BaseModel):
    excel_file_id: str
    sheet_name: Optional[str] = None
    title: Optional[str] = None

class RenderPreviewRequest(BaseModel):
    excel_file_id: Optional[str] = None
    sheet_name: Optional[str] = None
    bills: Optional[List[BillItem]] = None
    template_id: Optional[str] = None
    layout: LayoutSettings = Field(default_factory=LayoutSettings)
    signature: Optional[SignatureSettings] = None
    annotations: Optional[List[TextAnnotation]] = Field(default_factory=list)
    preview_page: int = 1

class RenderGenerateRequest(BaseModel):
    excel_file_id: Optional[str] = None
    sheet_name: Optional[str] = None
    bills: Optional[List[BillItem]] = None
    template_id: Optional[str] = None
    layout: LayoutSettings = Field(default_factory=LayoutSettings)
    signature: Optional[SignatureSettings] = None
    annotations: Optional[List[TextAnnotation]] = Field(default_factory=list)
    custom_filename: Optional[str] = None

class CustomTemplateBuildRequest(BaseModel):
    name: str
    company_name: str
    tagline: Optional[str] = ""
    phone: Optional[str] = ""
    email: Optional[str] = ""
    website: Optional[str] = ""
    address: Optional[str] = ""
    tax_id: Optional[str] = ""
    watermark_text: Optional[str] = ""
    primary_color: str = "#1E3A8A"
    accent_color: str = "#3B82F6"
    paper_size: str = "A4"
    orientation: str = "portrait"
    margin_top: float = 105.0
    margin_bottom: float = 60.0
    margin_left: float = 36.0
    margin_right: float = 36.0
    logo_file_id: Optional[str] = None

class TemplateUpdateMarginsRequest(BaseModel):
    name: Optional[str] = None
    margin_top: Optional[float] = None
    margin_bottom: Optional[float] = None
    margin_left: Optional[float] = None
    margin_right: Optional[float] = None
    paper_size: Optional[str] = None
    orientation: Optional[str] = None

class CellUpdateItem(BaseModel):
    coordinate: Optional[str] = None
    row: Optional[int] = None
    col: Optional[int] = None
    value: str

class BatchCellUpdateRequest(BaseModel):
    sheet_name: Optional[str] = None
    updates: List[CellUpdateItem]
