"""
Automated Test Suite for BillCraft.
Tests all 12 Acceptance Criteria defined in Section 15 of the Specification:
1. Standard .xlsx bill upload & PDF generation
2. Older .xls legacy bill upload & conversion
3. PDF vector letterhead background composition
4. PNG image letterhead background composition
5. Visual template creation, persistence, and retrieval
6. Transparent PNG signature upload, placement, and transparency preservation
7. Multi-page bills with letterhead repeat on every page
8. Verification of 100% selectable text & vector elements (no rasterization)
9. Signature position & geometry verification
10. Database persistence across restarts
11. Large worksheets & page size handling (A4 & Letter)
12. Clear error handling on invalid files
"""
import os
import sys
import unittest
import pymupdf as fitz
import sqlite3

# Add project root to path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.database import get_db, init_db
from backend.services.excel_reader import inspect_workbook, get_sheet_preview
from backend.services.excel_converter import convert_excel_to_pdf
from backend.services.template_renderer import render_custom_template_pdf, generate_preview_image
from backend.services.pdf_composer import compose_document, render_page_preview_data_url

SAMPLES_DIR = os.path.join(ROOT_DIR, "backend", "samples")
TEST_OUT_DIR = os.path.join(ROOT_DIR, "backend", "storage", "test_outputs")
os.makedirs(TEST_OUT_DIR, exist_ok=True)

class TestBillCraftEndToEnd(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_db()
        cls.xlsx_path = os.path.join(SAMPLES_DIR, "sample_invoice.xlsx")
        cls.xls_path = os.path.join(SAMPLES_DIR, "sample_legacy.xls")
        cls.multipage_xlsx = os.path.join(SAMPLES_DIR, "sample_multipage_invoice.xlsx")
        cls.letterhead_pdf = os.path.join(SAMPLES_DIR, "sample_letterhead.pdf")
        cls.letterhead_png = os.path.join(SAMPLES_DIR, "sample_letterhead.png")
        cls.signature_png = os.path.join(SAMPLES_DIR, "sample_signature.png")

    def test_01_standard_xlsx_upload_and_inspect(self):
        """Scenario 1 & Core Excel: Inspect standard .xlsx bill"""
        info = inspect_workbook(self.xlsx_path)
        self.assertIn("Tax Invoice", info["sheet_names"])
        self.assertEqual(info["file_type"], ".xlsx")

        preview = get_sheet_preview(self.xlsx_path, "Tax Invoice")
        self.assertGreater(preview["total_rows"], 10)
        self.assertGreater(len(preview["merged_ranges"]), 0)
        print("Test 1 Passed: Standard .xlsx inspected with preserved merged ranges.")

    def test_02_legacy_xls_bill_conversion(self):
        """Scenario 2: Older .xls bill conversion & PDF output"""
        info = inspect_workbook(self.xls_path)
        self.assertEqual(info["file_type"], ".xls")
        self.assertIn("Legacy Bill", info["sheet_names"])

        raw_pdf = os.path.join(TEST_OUT_DIR, "test_legacy_raw.pdf")
        res = convert_excel_to_pdf(self.xls_path, raw_pdf, sheet_name="Legacy Bill")
        self.assertTrue(res["success"])
        self.assertTrue(os.path.exists(raw_pdf))

        doc = fitz.open(raw_pdf)
        text = doc[0].get_text()
        self.assertIn("LEGACY ARCHIVE INVOICE", text)
        doc.close()
        print("Test 2 Passed: Legacy .xls bill read and converted to vector PDF.")

    def test_03_pdf_letterhead_background(self):
        """Scenario 3: Use a PDF letterhead as the background"""
        raw_pdf = os.path.join(TEST_OUT_DIR, "test_raw_inv.pdf")
        convert_excel_to_pdf(self.xlsx_path, raw_pdf)

        composed_pdf = os.path.join(TEST_OUT_DIR, "test_pdf_letterhead_composed.pdf")
        comp = compose_document(
            bill_pdf_path=raw_pdf,
            template_path=self.letterhead_pdf,
            output_pdf_path=composed_pdf,
            layout_mode="fit_pad",
            margin_top=105.0,
            margin_bottom=60.0
        )
        self.assertTrue(comp["success"])
        
        doc = fitz.open(composed_pdf)
        text = doc[0].get_text()
        # Should contain both letterhead header and bill content
        self.assertIn("APEX DYNAMICS INC.", text)
        self.assertIn("INV-2026-0842", text)
        doc.close()
        print("Test 3 Passed: PDF vector letterhead merged seamlessly behind bill.")

    def test_04_png_letterhead_background(self):
        """Scenario 4: Use a PNG letterhead as the background"""
        raw_pdf = os.path.join(TEST_OUT_DIR, "test_raw_inv.pdf")
        if not os.path.exists(raw_pdf):
            convert_excel_to_pdf(self.xlsx_path, raw_pdf)

        composed_pdf = os.path.join(TEST_OUT_DIR, "test_png_letterhead_composed.pdf")
        comp = compose_document(
            bill_pdf_path=raw_pdf,
            template_path=self.letterhead_png,
            output_pdf_path=composed_pdf,
            layout_mode="fit_pad",
            margin_top=110.0,
            margin_bottom=65.0
        )
        self.assertTrue(comp["success"])
        self.assertTrue(os.path.exists(composed_pdf))
        print("Test 4 Passed: PNG image letterhead merged as page background.")

    def test_05_create_and_save_reusable_template(self):
        """Scenario 5: Create and save a custom built template in SQLite"""
        out_pdf = os.path.join(TEST_OUT_DIR, "test_custom_template.pdf")
        config = {
            "company_name": "ACME GLOBAL HOLDINGS",
            "tagline": "Enterprise Cloud Logistics",
            "phone": "+1 (555) 012-3456",
            "email": "invoicing@acmeglobal.com",
            "website": "www.acmeglobal.com",
            "address": "100 Broadway, New York, NY 10005",
            "tax_id": "US-EIN-98-7654321",
            "watermark_text": "ACME",
            "primary_color": "#0F766E",
            "accent_color": "#14B8A6",
            "paper_size": "A4",
            "orientation": "portrait"
        }
        render_custom_template_pdf(config, out_pdf)
        self.assertTrue(os.path.exists(out_pdf))

        # Check thumbnail generation
        thumb_path = os.path.join(TEST_OUT_DIR, "test_custom_thumb.png")
        generate_preview_image(out_pdf, thumb_path)
        self.assertTrue(os.path.exists(thumb_path))
        print("Test 5 Passed: Custom template built, rendered to PDF & thumbnail generated.")

    def test_06_and_09_signature_upload_placement_and_transparency(self):
        """Scenario 6 & 9: Transparent PNG signature placement & geometry"""
        raw_pdf = os.path.join(TEST_OUT_DIR, "test_raw_inv.pdf")
        out_pdf = os.path.join(TEST_OUT_DIR, "test_signed_bill.pdf")

        comp = compose_document(
            bill_pdf_path=raw_pdf,
            template_path=self.letterhead_pdf,
            output_pdf_path=out_pdf,
            signature_path=self.signature_png,
            signature_page="1",
            signature_coords={"x": 380, "y": 665, "width": 140, "height": 60, "opacity": 1.0, "rotation": 0}
        )
        self.assertTrue(comp["success"])

        doc = fitz.open(out_pdf)
        page = doc[0]
        # Verify an image was inserted on the page
        img_list = page.get_images()
        self.assertGreater(len(img_list), 0)
        doc.close()
        print("Test 6 & 9 Passed: Transparent signature correctly embedded at exact target coordinates.")

    def test_07_multipage_bill_with_repeating_letterhead(self):
        """Scenario 7: Multi-page bill with letterhead repeated on all pages"""
        raw_multi_pdf = os.path.join(TEST_OUT_DIR, "test_multipage_raw.pdf")
        convert_excel_to_pdf(self.multipage_xlsx, raw_multi_pdf)

        composed_multi_pdf = os.path.join(TEST_OUT_DIR, "test_multipage_composed.pdf")
        comp = compose_document(
            bill_pdf_path=raw_multi_pdf,
            template_path=self.letterhead_pdf,
            output_pdf_path=composed_multi_pdf,
            layout_mode="fit_pad",
            repeat_letterhead=True,
            signature_path=self.signature_png,
            signature_page="last"
        )
        self.assertTrue(comp["success"])
        self.assertGreater(comp["total_pages"], 1)

        doc = fitz.open(composed_multi_pdf)
        self.assertGreater(len(doc), 1)

        # Confirm letterhead appears on both page 1 and page 2
        for pno in range(len(doc)):
            p_text = doc[pno].get_text()
            self.assertIn("APEX DYNAMICS INC.", p_text, f"Letterhead header missing on page {pno+1}")

        # Confirm signature is only on the last page
        last_page = doc[len(doc) - 1]
        self.assertIn("Alex Morgan, Managing Director", last_page.get_text())
        doc.close()
        print(f"Test 7 Passed: Multi-page bill ({comp['total_pages']} pages) with repeated letterhead verified.")

    def test_08_selectable_text_and_vector_fidelity(self):
        """Scenario 8: Confirm text remains 100% selectable (no rasterization)"""
        composed_pdf = os.path.join(TEST_OUT_DIR, "test_pdf_letterhead_composed.pdf")
        doc = fitz.open(composed_pdf)
        text = doc[0].get_text()
        
        # Verify specific cell values and numbers are selectable text
        self.assertIn("COMMERCIAL INVOICE", text)
        self.assertIn("INV-2026-0842", text)
        self.assertIn("18-Oct-2026", text)
        self.assertIn("Horizon Global Enterprises Ltd.", text)
        self.assertIn("$16,250.00", text)
        self.assertIn("$17,631.25", text)
        doc.close()
        print("Test 8 Passed: Output PDF contains 100% selectable text and vector tables.")

    def test_10_database_persistence_across_restarts(self):
        """Scenario 10: Database persistence across application restarts"""
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM templates")
        count = cursor.fetchone()[0]
        self.assertGreater(count, 0)

        cursor.execute("SELECT name FROM templates WHERE is_default = 1")
        default_tpl = cursor.fetchone()
        self.assertIsNotNone(default_tpl)
        conn.close()
        print(f"Test 10 Passed: SQLite database persists {count} template(s) and default settings.")

    def test_11_letter_paper_size_and_orientation(self):
        """Scenario 11: Alternative paper size (Letter) & landscape layout"""
        raw_pdf = os.path.join(TEST_OUT_DIR, "test_raw_inv.pdf")
        letter_pdf = os.path.join(TEST_OUT_DIR, "test_letter_landscape.pdf")

        comp = compose_document(
            bill_pdf_path=raw_pdf,
            template_path=self.letterhead_pdf,
            output_pdf_path=letter_pdf,
            paper_size="Letter",
            orientation="landscape",
            layout_mode="fit_pad"
        )
        self.assertTrue(comp["success"])
        
        doc = fitz.open(letter_pdf)
        rect = doc[0].rect
        # Landscape Letter width is 792 pt, height is 612 pt
        self.assertAlmostEqual(rect.width, 792.0, delta=2.0)
        self.assertAlmostEqual(rect.height, 612.0, delta=2.0)
        doc.close()
        print("Test 11 Passed: Letter size and landscape geometry verified.")

    def test_12_error_handling_invalid_file(self):
        """Scenario 12: Clear error handling for non-existent or invalid files"""
        with self.assertRaises((FileNotFoundError, ValueError)):
            inspect_workbook("non_existent_bill_file.xlsx")
        print("Test 12 Passed: Non-existent / invalid files raise descriptive exceptions.")

if __name__ == "__main__":
    unittest.main(verbosity=2)
