import React, { useState, useEffect, useRef } from 'react';
import { api } from './api/client';
import {
  ExcelUploadResponse,
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
    margin_bottom: 60.0,
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
    if (!excelData || !selectedTemplateId || wizardStep < 3) {
      return;
    }

    if (previewDebounceRef.current) {
      clearTimeout(previewDebounceRef.current);
    }

    setIsLoadingPreview(true);
    previewDebounceRef.current = setTimeout(async () => {
      try {
        const res = await api.renderPreview(
          excelData.file_id,
          excelData.active_sheet,
          selectedTemplateId,
          layout,
          signaturePlacement,
          annotations,
          previewPage
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

  // Handlers
  const handleFileUpload = async (file: File) => {
    try {
      const res = await api.uploadExcel(file);
      setExcelData(res);
      setPreviewPage(1);
    } catch (err: any) {
      alert(`Error uploading file: ${err.message}`);
    }
  };

  const handleLoadSample = async () => {
    setIsLoadingSample(true);
    try {
      const res = await api.loadSampleInvoice();
      setExcelData(res);
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
    if (!excelData) return;
    setIsSavingCellEdits(true);
    try {
      const res = await api.updateCells(excelData.file_id, excelData.active_sheet, updates);
      setExcelData({
        ...excelData,
        preview_grid: res.preview_grid
      });
      // Force trigger preview re-render with updated workbook
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
      setSignaturePlacement({
        signature_id: newSig.id,
        page: 'last',
        x: 380,
        y: 670,
        width: 140,
        height: 60,
        opacity: 1.0,
        rotation: 0
      });
    } catch (err: any) {
      alert(`Error uploading signature: ${err.message}`);
    }
  };

  const handleGeneratePdf = async (customFilename: string) => {
    if (!excelData || !selectedTemplateId) {
      throw new Error('Missing file or template selection.');
    }
    const res = await api.generateFinalPdf(
      excelData.file_id,
      excelData.active_sheet,
      selectedTemplateId,
      layout,
      signaturePlacement,
      annotations,
      customFilename
    );
    api.getRecentFiles().then(setRecentFiles).catch(console.error);
    return res;
  };

  const canNavigateToStep = (stepNum: number) => {
    if (stepNum === 1) return true;
    if (stepNum === 2) return !!excelData;
    if (stepNum >= 3) return !!excelData && !!selectedTemplateId;
    return false;
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || null;

  const defaultFilename = excelData
    ? excelData.filename.replace(/\.[^/.]+$/, '')
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
                    setExcelData(null);
                    setSignaturePlacement(null);
                    setAnnotations([]);
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
