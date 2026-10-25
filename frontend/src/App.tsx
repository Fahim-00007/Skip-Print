import React, { useState, useEffect, useRef } from 'react';
import { api } from './api/client';
import {
  ExcelUploadResponse,
  BillItem,
  Template,
  Signature,
  LayoutSettings,
  SignaturePlacement,
  TextAnnotation,
  RecentFile,
  BlockItem
} from './types';

const DEFAULT_BLOCKS: BlockItem[] = [
  { id: 'table', name: 'Line Items Table', dx: 0, dy: 0, scale: 1.0, visible: true },
  { id: 'bill_meta', name: 'Bill # & Date', dx: 0, dy: 0, scale: 1.0, visible: true },
  { id: 'client_info', name: 'Client Info', dx: 0, dy: 0, scale: 1.0, visible: true },
  { id: 'bank_notes', name: 'Bank Details & Notes', dx: 0, dy: 0, scale: 1.0, visible: true }
];

import { Header } from './components/common/Header';
import { StepIndicator } from './components/common/StepIndicator';
import { Step1Upload } from './components/wizard/Step1Upload';
import { Step2Template } from './components/wizard/Step2Template';
import { Step3Layout } from './components/wizard/Step3Layout';
import { Step4Signature } from './components/wizard/Step4Signature';
import { Step5Export } from './components/wizard/Step5Export';

import { TemplateManager } from './components/templates/TemplateManager';
import { TemplateUploadModal } from './components/templates/TemplateUploadModal';
import { TemplateBuilderModal } from './components/templates/TemplateBuilderModal';
import { SignatureManager } from './components/signatures/SignatureManager';
import { RecentFiles } from './components/recent/RecentFiles';
import { SettingsView } from './components/settings/SettingsView';

export function App() {
  const [activeTab, setActiveTab] = useState<'wizard' | 'templates' | 'signatures' | 'recent' | 'settings'>('wizard');
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [seniorMode, setSeniorMode] = useState<boolean>(true);

  // Core Data
  const [bills, setBills] = useState<BillItem[]>([]);
  const [activeBillIndex, setActiveBillIndex] = useState<number>(0);
  const [excelData, setExcelData] = useState<ExcelUploadResponse | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [signaturePlacement, setSignaturePlacement] = useState<SignaturePlacement | null>(null);
  const [annotations, setAnnotations] = useState<TextAnnotation[]>([]);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [isSavingCellEdits, setIsSavingCellEdits] = useState(false);

  // Layout Configuration
  const [layout, setLayout] = useState<LayoutSettings>({
    layout_mode: 'fit_pad',
    paper_size: 'A4',
    orientation: 'portrait',
    margin_top: 105.0,
    margin_bottom: 65.0,
    margin_left: 36.0,
    margin_right: 36.0,
    scale_factor: 1.0,
    offset_x: 0,
    offset_y: 0,
    repeat_letterhead: true,
    blocks: DEFAULT_BLOCKS
  });

  // Preview State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [engineName, setEngineName] = useState<string>('Native Excel Vector COM');
  const [previewWarning, setPreviewWarning] = useState<string | undefined>();
  const [renderCounter, setRenderCounter] = useState(0);

  // Modals
  const [isTemplateUploadOpen, setIsTemplateUploadOpen] = useState(false);
  const [isTemplateBuilderOpen, setIsTemplateBuilderOpen] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  // Load initial templates, signatures, and recent files
  const loadInitialData = async () => {
    try {
      const [tpls, sigs, recents] = await Promise.all([
        api.getTemplates(),
        api.getSignatures(),
        api.getRecentFiles()
      ]);
      setTemplates(tpls);
      setSignatures(sigs);
      setRecentFiles(recents);

      if (!selectedTemplateId && tpls.length > 0) {
        const def = tpls.find((t) => t.is_default) || tpls[0];
        setSelectedTemplateId(def.id);
        setLayout((prev) => ({
          ...prev,
          margin_top: def.margin_top,
          margin_bottom: def.margin_bottom,
          margin_left: def.margin_left,
          margin_right: def.margin_right,
          paper_size: (def.paper_size as any) || 'A4',
          orientation: (def.orientation as any) || 'portrait'
        }));
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Debounced live preview fetcher
  const previewDebounceRef = useRef<any>(null);

  useEffect(() => {
    if ((bills.length === 0 && !excelData) || !selectedTemplateId || wizardStep < 3) {
      return;
    }

    if (previewDebounceRef.current) {
      clearTimeout(previewDebounceRef.current);
    }

    setIsLoadingPreview(true);
    previewDebounceRef.current = setTimeout(async () => {
      try {
        const billsPayload = bills.length > 0
          ? bills.map((b) => ({
              excel_file_id: b.file_id,
              sheet_name: b.sheet_name,
              title: `${b.filename} (${b.sheet_name})`
            }))
          : undefined;

        const primaryFileId = bills[0]?.file_id || excelData?.file_id!;
        const primarySheet = bills[0]?.sheet_name || excelData?.active_sheet!;

        const res = await api.renderPreview(
          primaryFileId,
          primarySheet,
          selectedTemplateId,
          layout,
          signaturePlacement,
          annotations,
          previewPage,
          billsPayload
        );
        setPreviewUrl(res.preview_data_url);
        setTotalPages(res.total_pages);
        setEngineName(res.engine);
        setPreviewWarning(res.warning);
      } catch (err) {
        console.error('Preview error:', err);
      } finally {
        setIsLoadingPreview(false);
      }
    }, 75);

    return () => {
      if (previewDebounceRef.current) {
        clearTimeout(previewDebounceRef.current);
      }
    };
  }, [
    bills,
    excelData?.file_id,
    excelData?.active_sheet,
    selectedTemplateId,
    layout,
    signaturePlacement,
    annotations,
    previewPage,
    wizardStep,
    renderCounter
  ]);

  // Handlers for Bills
  const handleAddFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsLoadingPreview(true);
    try {
      const newBillItems: BillItem[] = [];
      let firstUploadRes: ExcelUploadResponse | null = null;

      for (const file of fileArray) {
        const res = await api.uploadExcel(file);
        if (!firstUploadRes) firstUploadRes = res;

        newBillItems.push({
          id: `bill-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file_id: res.file_id,
          filename: res.filename,
          sheet_name: res.active_sheet,
          sheet_names: res.sheet_names,
          file_size: res.file_size,
          preview_grid: res.preview_grid
        });
      }

      setBills((prev) => {
        const updated = [...prev, ...newBillItems];
        if (prev.length === 0 && updated.length > 0 && firstUploadRes) {
          setExcelData(firstUploadRes);
          setActiveBillIndex(0);
        }
        return updated;
      });
      setPreviewPage(1);
      setRenderCounter((c) => c + 1);
    } catch (err: any) {
      alert(`Error uploading file(s): ${err.message}`);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    await handleAddFiles([file]);
  };

  const handleAddAllSheetsAsBills = (billIndex: number) => {
    const baseBill = bills[billIndex] || bills[0];
    if (!baseBill || !baseBill.sheet_names || baseBill.sheet_names.length <= 1) return;

    const currentSheetsInQueue = new Set(
      bills.filter((b) => b.file_id === baseBill.file_id).map((b) => b.sheet_name)
    );

    const newItems: BillItem[] = [];
    for (const sName of baseBill.sheet_names) {
      if (!currentSheetsInQueue.has(sName)) {
        newItems.push({
          id: `bill-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file_id: baseBill.file_id,
          filename: baseBill.filename,
          sheet_name: sName,
          sheet_names: baseBill.sheet_names,
          file_size: baseBill.file_size,
          preview_grid: undefined
        });
      }
    }

    if (newItems.length > 0) {
      setBills((prev) => [...prev, ...newItems]);
      setRenderCounter((c) => c + 1);
    }
  };

  const handleRemoveBill = (index: number) => {
    setBills((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) {
        setExcelData(null);
        setActiveBillIndex(0);
      } else {
        const nextIdx = Math.min(activeBillIndex, updated.length - 1);
        setActiveBillIndex(nextIdx);
        const cur = updated[nextIdx];
        setExcelData({
          file_id: cur.file_id,
          filename: cur.filename,
          file_path: '',
          file_size: cur.file_size,
          sheet_names: cur.sheet_names,
          active_sheet: cur.sheet_name,
          sheet_count: cur.sheet_names.length,
          preview_grid: cur.preview_grid!
        });
      }
      return updated;
    });
    setRenderCounter((c) => c + 1);
  };

  const handleMoveBill = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= bills.length) return;

    setBills((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
    if (activeBillIndex === index) {
      setActiveBillIndex(targetIdx);
    } else if (activeBillIndex === targetIdx) {
      setActiveBillIndex(index);
    }
    setRenderCounter((c) => c + 1);
  };

  const handleChangeBillSheet = async (index: number, newSheet: string) => {
    const bill = bills[index];
    if (!bill) return;

    try {
      const previewGrid = await api.getSheetPreview(bill.file_id, newSheet);
      setBills((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          sheet_name: newSheet,
          preview_grid: previewGrid
        };
        return copy;
      });

      if (activeBillIndex === index) {
        setExcelData((prev) =>
          prev
            ? {
                ...prev,
                active_sheet: newSheet,
                preview_grid: previewGrid
              }
            : null
        );
      }
      setRenderCounter((c) => c + 1);
    } catch (err: any) {
      alert(`Error loading worksheet: ${err.message}`);
    }
  };

  const handleSelectBillIndex = (index: number) => {
    setActiveBillIndex(index);
    const cur = bills[index];
    if (cur) {
      setExcelData({
        file_id: cur.file_id,
        filename: cur.filename,
        file_path: '',
        file_size: cur.file_size,
        sheet_names: cur.sheet_names,
        active_sheet: cur.sheet_name,
        sheet_count: cur.sheet_names.length,
        preview_grid: cur.preview_grid!
      });
    }
  };

  const handleLoadSample = async () => {
    setIsLoadingSample(true);
    try {
      const res = await api.loadSampleInvoice();
      const sampleItem: BillItem = {
        id: `bill-sample-${Date.now()}`,
        file_id: res.file_id,
        filename: res.filename,
        sheet_name: res.active_sheet,
        sheet_names: res.sheet_names,
        file_size: res.file_size,
        preview_grid: res.preview_grid
      };
      setBills([sampleItem]);
      setExcelData(res);
      setActiveBillIndex(0);
      setPreviewPage(1);
      setActiveTab('wizard');
      if (!selectedTemplateId && templates.length > 0) {
        const def = templates.find((t) => t.is_default) || templates[0];
        handleSelectTemplate(def.id);
      }
    } catch (err: any) {
      alert(`Error loading sample: ${err.message}`);
    } finally {
      setIsLoadingSample(false);
    }
  };

  const handleSelectSheet = async (sheetName: string) => {
    if (bills.length > 0) {
      await handleChangeBillSheet(activeBillIndex, sheetName);
      return;
    }
    if (!excelData) return;
    try {
      const previewGrid = await api.getSheetPreview(excelData.file_id, sheetName);
      setExcelData({
        ...excelData,
        active_sheet: sheetName,
        preview_grid: previewGrid
      });
      setPreviewPage(1);
    } catch (err: any) {
      alert(`Error switching sheet: ${err.message}`);
    }
  };

  // Live Cell Editing handler
  const handleSaveCellEdits = async (updates: { coordinate: string; value: string }[]) => {
    const curBill = bills[activeBillIndex] || (excelData ? { file_id: excelData.file_id, sheet_name: excelData.active_sheet } : null);
    if (!curBill) return;

    setIsSavingCellEdits(true);
    try {
      const res = await api.updateCells(curBill.file_id, curBill.sheet_name, updates);
      setBills((prev) =>
        prev.map((b, i) => (i === activeBillIndex ? { ...b, preview_grid: res.preview_grid } : b))
      );
      if (excelData) {
        setExcelData({
          ...excelData,
          preview_grid: res.preview_grid
        });
      }
      setRenderCounter((c) => c + 1);
    } catch (err: any) {
      alert(`Failed to save edits: ${err.message}`);
    } finally {
      setIsSavingCellEdits(false);
    }
  };

  // Text Annotations handlers
  const handleAddAnnotation = () => {
    const newAnn: TextAnnotation = {
      id: `ann-${Date.now()}`,
      text: 'APPROVED',
      x: 120,
      y: 180,
      width: 130,
      height: 32,
      font_size: 13,
      font_color: '#1E3A8A',
      is_bold: true,
      page: 'all',
      rotation: 0
    };
    setAnnotations((prev) => [...prev, newAnn]);
  };

  const handleUpdateAnnotation = (id: string, patch: Partial<TextAnnotation>) => {
    setAnnotations((prev) =>
      prev.map((ann) => (ann.id === id ? { ...ann, ...patch } : ann))
    );
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
  };

  const handleUpdateBlock = (id: string, patch: Partial<BlockItem>) => {
    setLayout((prev) => {
      const currentBlocks = prev.blocks || DEFAULT_BLOCKS;
      const updated = currentBlocks.map((b) => (b.id === id ? { ...b, ...patch } : b));
      return {
        ...prev,
        blocks: updated
      };
    });
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      setLayout((prev) => ({
        ...prev,
        margin_top: tpl.margin_top,
        margin_bottom: tpl.margin_bottom,
        margin_left: tpl.margin_left,
        margin_right: tpl.margin_right,
        paper_size: (tpl.paper_size as any) || 'A4',
        orientation: (tpl.orientation as any) || 'portrait'
      }));
    }
  };

  const handleUploadSignature = async (file: File, name: string) => {
    try {
      const newSig = await api.uploadSignature(file, name);
      setSignatures((prev) => [newSig, ...prev]);
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      const defaultDate = `${dd}.${mm}.${yyyy}`;

      setSignaturePlacement({
        signature_id: newSig.id,
        page: 'last',
        x: 390,
        y: 645,
        width: 140,
        height: 65,
        opacity: 1.0,
        rotation: 0,
        include_date: true,
        date_text: defaultDate
      });
    } catch (err: any) {
      alert(`Error uploading signature: ${err.message}`);
    }
  };

  const handleGeneratePdf = async (customFilename: string) => {
    if ((bills.length === 0 && !excelData) || !selectedTemplateId) {
      throw new Error('Missing bill or template selection.');
    }

    const billsPayload = bills.length > 0
      ? bills.map((b) => ({
          excel_file_id: b.file_id,
          sheet_name: b.sheet_name,
          title: `${b.filename} (${b.sheet_name})`
        }))
      : undefined;

    const primaryFileId = bills[0]?.file_id || excelData?.file_id!;
    const primarySheet = bills[0]?.sheet_name || excelData?.active_sheet!;

    const res = await api.generateFinalPdf(
      primaryFileId,
      primarySheet,
      selectedTemplateId,
      layout,
      signaturePlacement,
      annotations,
      customFilename,
      billsPayload
    );
    api.getRecentFiles().then(setRecentFiles).catch(console.error);
    return res;
  };

  const canNavigateToStep = (stepNum: number) => {
    if (stepNum === 1) return true;
    if (stepNum === 2) return bills.length > 0 || !!excelData;
    if (stepNum >= 3) return (bills.length > 0 || !!excelData) && !!selectedTemplateId;
    return false;
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || null;

  const defaultFilename =
    bills.length > 1
      ? `Combined_${bills.length}_Bills`
      : excelData
      ? excelData.filename.replace(/\.[^/.]+$/, '')
      : bills[0]
      ? bills[0].filename.replace(/\.[^/.]+$/, '')
      : 'invoice';

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col text-slate-900 ${seniorMode ? "senior-mode text-base" : "text-sm"}`}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLoadSample={handleLoadSample}
        isLoadingSample={isLoadingSample}
        seniorMode={seniorMode}
        onToggleSeniorMode={() => setSeniorMode(!seniorMode)}
      />

      <main className="flex-1 pb-16">
        {activeTab === 'wizard' && (
          <div>
            <StepIndicator
              currentStep={wizardStep}
              setStep={setWizardStep}
              canNavigateTo={canNavigateToStep}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              {wizardStep === 1 && (
                <Step1Upload
                  bills={bills}
                  activeBillIndex={activeBillIndex}
                  onSelectBillIndex={handleSelectBillIndex}
                  onAddFiles={handleAddFiles}
                  onAddAllSheetsAsBills={handleAddAllSheetsAsBills}
                  onRemoveBill={handleRemoveBill}
                  onMoveBill={handleMoveBill}
                  onChangeBillSheet={handleChangeBillSheet}
                  excelData={excelData}
                  isLoading={isLoadingSample}
                  onFileUpload={handleFileUpload}
                  onLoadSample={handleLoadSample}
                  onSelectSheet={handleSelectSheet}
                  onSaveCellEdits={handleSaveCellEdits}
                  isSavingCellEdits={isSavingCellEdits}
                  onContinue={() => setWizardStep(2)}
                />
              )}

              {wizardStep === 2 && (
                <Step2Template
                  templates={templates}
                  selectedTemplateId={selectedTemplateId}
                  onSelectTemplate={handleSelectTemplate}
                  onOpenUploadModal={() => setIsTemplateUploadOpen(true)}
                  onOpenBuilderModal={() => setIsTemplateBuilderOpen(true)}
                  onBack={() => setWizardStep(1)}
                  onContinue={() => setWizardStep(3)}
                />
              )}

              {wizardStep === 3 && (
                <Step3Layout
                  layout={layout}
                  onChangeLayout={(patch) => setLayout((prev) => ({ ...prev, ...patch }))}
                  selectedTemplate={selectedTemplate}
                  previewUrl={previewUrl}
                  isLoadingPreview={isLoadingPreview}
                  totalPages={totalPages}
                  currentPage={previewPage}
                  onPageChange={setPreviewPage}
                  engineName={engineName}
                  warning={previewWarning}
                  sheetData={excelData?.preview_grid}
                  sheetNames={excelData?.sheet_names}
                  activeSheet={excelData?.active_sheet}
                  onSelectSheet={handleSelectSheet}
                  onSaveCellEdits={handleSaveCellEdits}
                  isSavingCellEdits={isSavingCellEdits}
                  onBack={() => setWizardStep(2)}
                  onContinue={() => setWizardStep(4)}
                />
              )}

              {wizardStep === 4 && (
                <Step4Signature
                  signatures={signatures}
                  signaturePlacement={signaturePlacement}
                  onChangeSignature={setSignaturePlacement}
                  onUploadSignature={handleUploadSignature}
                  previewUrl={previewUrl}
                  isLoadingPreview={isLoadingPreview}
                  totalPages={totalPages}
                  currentPage={previewPage}
                  onPageChange={setPreviewPage}
                  engineName={engineName}
                  warning={previewWarning}
                  sheetData={excelData?.preview_grid}
                  sheetNames={excelData?.sheet_names}
                  activeSheet={excelData?.active_sheet}
                  onSelectSheet={handleSelectSheet}
                  onSaveCellEdits={handleSaveCellEdits}
                  isSavingCellEdits={isSavingCellEdits}
                  onBack={() => setWizardStep(3)}
                  onContinue={() => setWizardStep(5)}
                />
              )}

              {wizardStep === 5 && (
                <Step5Export
                  defaultFilename={defaultFilename}
                  previewUrl={previewUrl}
                  isLoadingPreview={isLoadingPreview}
                  totalPages={totalPages}
                  currentPage={previewPage}
                  onPageChange={setPreviewPage}
                  engineName={engineName}
                  warning={previewWarning}
                  billCount={bills.length}
                  annotations={annotations}
                  onAddAnnotation={handleAddAnnotation}
                  onUpdateAnnotation={handleUpdateAnnotation}
                  onDeleteAnnotation={handleDeleteAnnotation}
                  blocks={layout.blocks || DEFAULT_BLOCKS}
                  onUpdateBlock={handleUpdateBlock}
                  sheetData={excelData?.preview_grid}
                  sheetNames={excelData?.sheet_names}
                  activeSheet={excelData?.active_sheet}
                  onSelectSheet={handleSelectSheet}
                  onSaveCellEdits={handleSaveCellEdits}
                  isSavingCellEdits={isSavingCellEdits}
                  onGenerate={handleGeneratePdf}
                  onBack={() => setWizardStep(4)}
                  onReset={() => {
                    setWizardStep(1);
                    setBills([]);
                    setActiveBillIndex(0);
                    setExcelData(null);
                    setSignaturePlacement(null);
                    setAnnotations([]);
                    setPreviewUrl(null);
                  }}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <TemplateManager
              templates={templates}
              onRefresh={loadInitialData}
            />
          </div>
        )}

        {activeTab === 'signatures' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <SignatureManager
              signatures={signatures}
              onRefresh={loadInitialData}
            />
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <RecentFiles
              recentFiles={recentFiles}
              onRefresh={loadInitialData}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <SettingsView />
          </div>
        )}
      </main>

      <TemplateUploadModal
        isOpen={isTemplateUploadOpen}
        onClose={() => setIsTemplateUploadOpen(false)}
        onSuccess={(tpl) => {
          loadInitialData();
          handleSelectTemplate(tpl.id);
        }}
      />

      <TemplateBuilderModal
        isOpen={isTemplateBuilderOpen}
        onClose={() => setIsTemplateBuilderOpen(false)}
        onSuccess={() => {
          loadInitialData();
        }}
      />
    </div>
  );
}

export default App;
