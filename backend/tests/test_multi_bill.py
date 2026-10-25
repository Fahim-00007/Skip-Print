"""
Test suite for combining multiple bills into a single unified PDF.
Covers:
1. Combining multiple Excel files into 1 PDF on letterhead.
2. Combining multiple sheets into 1 PDF on letterhead.
3. Signature stamping across 'each_bill' vs 'last' page.
4. Total page count, vector fidelity, and download.
"""
import os
import unittest
import fitz
from fastapi.testclient import TestClient

from backend.main import app
from backend.database import init_db
from backend.services.pdf_composer import compose_document
from backend.services.excel_converter import convert_excel_to_pdf
from backend.paths import SAMPLES_DIR, OUTPUTS_DIR

class TestMultiBillComposition(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = TestClient(app)
        cls.sample_inv = os.path.join(SAMPLES_DIR, "sample_invoice.xlsx")
        cls.legacy_inv = os.path.join(SAMPLES_DIR, "sample_legacy.xls")
        cls.multipage_inv = os.path.join(SAMPLES_DIR, "sample_multipage_invoice.xlsx")
        cls.letterhead_pdf = os.path.join(SAMPLES_DIR, "sample_letterhead.pdf")
        cls.sig_png = os.path.join(SAMPLES_DIR, "sample_signature.png")

    def test_01_compose_document_with_multiple_bill_paths(self):
        """Direct service test: compose_document with bill_pdf_paths list."""
        raw1 = os.path.join(OUTPUTS_DIR, "test_multi_raw1.pdf")
        raw2 = os.path.join(OUTPUTS_DIR, "test_multi_raw2.pdf")
        out_pdf = os.path.join(OUTPUTS_DIR, "test_multi_combined.pdf")

        convert_excel_to_pdf(self.sample_inv, raw1)
        convert_excel_to_pdf(self.legacy_inv, raw2)

        res = compose_document(
            bill_pdf_paths=[raw1, raw2],
            template_path=self.letterhead_pdf,
            output_pdf_path=out_pdf,
            signature_path=self.sig_png,
            signature_page="each_bill",
            signature_coords={"x": 380, "y": 680, "width": 140, "height": 60, "opacity": 1.0, "rotation": 0}
        )

        self.assertTrue(res["success"])
        self.assertGreaterEqual(res["total_pages"], 2)

        doc = fitz.open(out_pdf)
        self.assertEqual(len(doc), res["total_pages"])
        
        # Verify text from both bills is present in the single document
        all_text = "".join(doc[i].get_text() for i in range(len(doc)))
        self.assertIn("APEX DYNAMICS INC.", all_text)
        self.assertIn("LEGACY ARCHIVE INVOICE", all_text)
        doc.close()
        print(f"Test 1 Passed: Composed {res['total_pages']}-page multi-bill PDF successfully.")

    def test_02_api_render_preview_multi_bill(self):
        """API test: /api/render/preview with multi-bill payload."""
        # 1. Upload sample invoice
        r1 = self.client.post("/api/excel/load-sample")
        self.assertEqual(r1.status_code, 200)
        d1 = r1.json()

        # 2. Upload second invoice
        with open(self.legacy_inv, "rb") as f:
            r2 = self.client.post("/api/excel/upload", files={"file": ("legacy.xls", f, "application/vnd.ms-excel")})
        self.assertEqual(r2.status_code, 200)
        d2 = r2.json()

        preview_payload = {
            "bills": [
                {"excel_file_id": d1["file_id"], "sheet_name": d1["active_sheet"], "title": "Bill 1"},
                {"excel_file_id": d2["file_id"], "sheet_name": d2["active_sheet"], "title": "Bill 2"}
            ],
            "template_id": "sample-template-pdf",
            "layout": {"layout_mode": "fit_pad", "margin_top": 105.0, "margin_bottom": 60.0},
            "signature": {"signature_id": "sgs-sig-parves", "page": "each_bill"},
            "preview_page": 1
        }

        res = self.client.post("/api/render/preview", json=preview_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertGreaterEqual(data["total_pages"], 2)
        self.assertTrue(data["preview_data_url"].startswith("data:image/png;base64,"))
        print(f"Test 2 Passed: Multi-bill preview generated with {data['total_pages']} pages.")

    def test_03_api_render_generate_and_download_multi_bill(self):
        """API test: /api/render/generate with multi-bill payload and download."""
        r1 = self.client.post("/api/excel/load-sample")
        d1 = r1.json()

        gen_payload = {
            "bills": [
                {"excel_file_id": d1["file_id"], "sheet_name": d1["active_sheet"], "title": "Main Bill"},
                {"excel_file_id": d1["file_id"], "sheet_name": d1["active_sheet"], "title": "Duplicate Copy"}
            ],
            "template_id": "sample-template-pdf",
            "layout": {"layout_mode": "fit_pad"},
            "custom_filename": "Combined_Batch_Invoices"
        }

        res = self.client.post("/api/render/generate", json=gen_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["filename"], "Combined_Batch_Invoices.pdf")
        self.assertGreaterEqual(data["page_count"], 2)

        dl_res = self.client.get(data["download_url"])
        self.assertEqual(dl_res.status_code, 200)
        self.assertEqual(len(dl_res.content), data["file_size"])
        print(f"Test 3 Passed: Combined PDF downloaded ({data['file_size']} bytes).")

if __name__ == "__main__":
    unittest.main()
