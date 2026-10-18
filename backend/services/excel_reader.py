"""
Excel inspection service for .xlsx and .xls files.
Extracts sheet lists, dimensions, merged ranges, and spreadsheet grid preview.
"""
import os
import openpyxl
from openpyxl.utils import get_column_letter

def inspect_workbook(file_path: str):
    """
    Returns workbook overview: sheet names, active sheet, file size.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == ".xlsx" or ext == ".xlsm":
        # Load workbook with data_only=True to get calculated formula values
        try:
            wb = openpyxl.load_workbook(file_path, data_only=True, read_only=False)
            sheet_names = wb.sheetnames
            active_sheet = wb.active.title if wb.active else sheet_names[0]
            wb.close()
            return {
                "file_type": ext,
                "sheet_names": sheet_names,
                "active_sheet": active_sheet,
                "sheet_count": len(sheet_names)
            }
        except Exception as e:
            raise ValueError(f"Could not read Excel file: {str(e)}")

    elif ext == ".xls":
        try:
            import xlrd
            book = xlrd.open_workbook(file_path, on_demand=True)
            sheet_names = book.sheet_names()
            return {
                "file_type": ext,
                "sheet_names": sheet_names,
                "active_sheet": sheet_names[0] if sheet_names else None,
                "sheet_count": len(sheet_names)
            }
        except Exception as e:
            raise ValueError(f"Could not read legacy .xls file: {str(e)}")
    else:
        raise ValueError(f"Unsupported file format: {ext}. Only .xlsx and .xls are supported.")

def get_sheet_preview(file_path: str, sheet_name: str = None, max_rows: int = 60, max_cols: int = 20):
    """
    Extracts cell values, merged cell ranges, column widths, row heights, and styling for UI grid.
    """
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext in [".xlsx", ".xlsm"]:
        wb = openpyxl.load_workbook(file_path, data_only=True)
        if sheet_name and sheet_name in wb.sheetnames:
            ws = wb[sheet_name]
        else:
            ws = wb.active

        # Extract merged cells
        merged_ranges = [str(r) for r in ws.merged_cells.ranges]

        # Determine dimensions
        max_r = min(ws.max_row or 1, max_rows)
        max_c = min(ws.max_column or 1, max_cols)

        # Column widths
        col_widths = {}
        for col_idx in range(1, max_c + 1):
            col_letter = get_column_letter(col_idx)
            dim = ws.column_dimensions.get(col_letter)
            width = dim.width if dim and dim.width else 10
            col_widths[col_letter] = round(float(width), 1)

        # Row heights
        row_heights = {}
        for row_idx in range(1, max_r + 1):
            dim = ws.row_dimensions.get(row_idx)
            height = dim.height if dim and dim.height else 20
            row_heights[str(row_idx)] = round(float(height), 1)

        # Grid cells
        rows_data = []
        for r in range(1, max_r + 1):
            row_cells = []
            for c in range(1, max_c + 1):
                cell = ws.cell(row=r, column=c)
                val = cell.value
                val_str = ""
                if val is not None:
                    if isinstance(val, float):
                        val_str = f"{val:,.2f}" if (abs(val) >= 0.01 and '.' in str(val)) else str(val)
                    else:
                        val_str = str(val)

                # Style properties
                font_bold = bool(cell.font and cell.font.bold)
                font_size = cell.font.size if (cell.font and cell.font.size) else 11
                font_color = None
                if cell.font and cell.font.color and cell.font.color.rgb:
                    rgb = str(cell.font.color.rgb)
                    font_color = f"#{rgb[-6:]}" if len(rgb) >= 6 else None

                fill_color = None
                if cell.fill and cell.fill.start_color and cell.fill.start_color.rgb:
                    rgb = str(cell.fill.start_color.rgb)
                    if rgb != "00000000" and len(rgb) >= 6:
                        fill_color = f"#{rgb[-6:]}"

                align_h = cell.alignment.horizontal if cell.alignment else "left"
                align_v = cell.alignment.vertical if cell.alignment else "center"

                has_border = bool(
                    cell.border and (
                        (cell.border.left and cell.border.left.style) or
                        (cell.border.top and cell.border.top.style) or
                        (cell.border.right and cell.border.right.style) or
                        (cell.border.bottom and cell.border.bottom.style)
                    )
                )

                row_cells.append({
                    "coordinate": cell.coordinate,
                    "row": r,
                    "col": c,
                    "value": val_str,
                    "bold": font_bold,
                    "fontSize": font_size,
                    "color": font_color,
                    "fill": fill_color,
                    "alignH": align_h or "left",
                    "alignV": align_v or "center",
                    "hasBorder": has_border,
                })
            rows_data.append(row_cells)

        wb.close()

        return {
            "sheet_name": ws.title,
            "total_rows": ws.max_row,
            "total_cols": ws.max_column,
            "merged_ranges": merged_ranges,
            "col_widths": col_widths,
            "row_heights": row_heights,
            "rows": rows_data
        }

    elif ext == ".xls":
        import xlrd
        book = xlrd.open_workbook(file_path, formatting_info=True)
        if sheet_name and sheet_name in book.sheet_names():
            sheet = book.sheet_by_name(sheet_name)
        else:
            sheet = book.sheet_by_index(0)

        max_r = min(sheet.nrows, max_rows)
        max_c = min(sheet.ncols, max_cols)

        merged_ranges = []
        for crange in sheet.merged_cells:
            rlo, rhi, clo, chi = crange
            c1 = f"{get_column_letter(clo + 1)}{rlo + 1}"
            c2 = f"{get_column_letter(chi)}{rhi}"
            merged_ranges.append(f"{c1}:{c2}")

        rows_data = []
        for r in range(max_r):
            row_cells = []
            for c in range(max_c):
                val = sheet.cell_value(r, c)
                val_str = str(val) if val is not None else ""
                row_cells.append({
                    "coordinate": f"{get_column_letter(c + 1)}{r + 1}",
                    "row": r + 1,
                    "col": c + 1,
                    "value": val_str,
                    "bold": False,
                    "fontSize": 10,
                    "alignH": "left",
                    "alignV": "center",
                    "hasBorder": False
                })
            rows_data.append(row_cells)

        return {
            "sheet_name": sheet.name,
            "total_rows": sheet.nrows,
            "total_cols": sheet.ncols,
            "merged_ranges": merged_ranges,
            "col_widths": {},
            "row_heights": {},
            "rows": rows_data
        }
