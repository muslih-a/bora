import React, { useState } from 'react';
import QRCode from 'qrcode';
import { t, Language } from '../i18n/index.ts';
import { UserSettings, saveSettings, clearAllData } from '../data/db.ts';
import { BatchCalibration } from '../core/config.ts';
import { processCardImage, PipelineResult } from '../core/pipeline.ts';
import {
  pipelineResultToRow,
  exportRowsToCSV,
  fitBatchCalibrationFromRows,
  BatchAnalysisRow,
} from '../data/csv.ts';
import { platform, dataUrlToBlob } from '../platform/index.ts';
import {
  Settings,
  Languages,
  Volume2,
  Vibrate,
  Type,
  SunMoon,
  User,
  FlaskConical,
  Trash2,
  Info,
  Download,
  QrCode,
  FileSpreadsheet,
  Check,
} from 'lucide-react';

interface S20SettingsProps {
  settings: UserSettings;
  activeBatch: BatchCalibration;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onDataCleared: () => void;
}

export const S20Settings: React.FC<S20SettingsProps> = ({
  settings,
  activeBatch,
  onUpdateSettings,
  onDataCleared,
}) => {
  const lang = settings.lang;

  // Research Mode states
  const [analyzingBatch, setAnalyzingBatch] = useState(false);
  const [batchRows, setBatchRows] = useState<BatchAnalysisRow[]>([]);
  const [includeUncorrected, setIncludeUncorrected] = useState(true);
  const [regressionResult, setRegressionResult] = useState<any>(null);
  const [newBatchName, setNewBatchName] = useState('BN-EXP-01');
  const [generatedQRUrl, setGeneratedQRUrl] = useState<string | null>(null);

  const toggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    saveSettings(updated);
    onUpdateSettings(updated);
  };

  const toggleVibration = () => {
    const updated = { ...settings, vibrationEnabled: !settings.vibrationEnabled };
    saveSettings(updated);
    onUpdateSettings(updated);
  };

  const toggleLargeText = () => {
    const updated = { ...settings, largeText: !settings.largeText };
    saveSettings(updated);
    onUpdateSettings(updated);
  };

  const toggleHighContrast = () => {
    const updated = { ...settings, highContrast: !settings.highContrast };
    saveSettings(updated);
    onUpdateSettings(updated);
  };

  const toggleResearchMode = () => {
    const updated = { ...settings, researchMode: !settings.researchMode };
    saveSettings(updated);
    onUpdateSettings(updated);
  };

  const setLanguage = (newLang: 'id' | 'en') => {
    const updated = { ...settings, lang: newLang };
    saveSettings(updated);
    onUpdateSettings(updated);
  };

  const updateReporterName = (val: string) => {
    const updated = { ...settings, defaultReporterName: val };
    saveSettings(updated);
    onUpdateSettings(updated);
  };

  const handleClearAll = async () => {
    const ok = window.confirm(t('s20_clear_confirm', lang));
    if (ok) {
      await clearAllData();
      onDataCleared();
    }
  };

  // Research Mode: Batch Photos Analysis
  const handlePickBatchPhotos = async () => {
    setAnalyzingBatch(true);
    const photos = await platform.pickMultipleImages();
    if (photos.length === 0) {
      setAnalyzingBatch(false);
      return;
    }

    const rows: BatchAnalysisRow[] = [];
    for (const p of photos) {
      try {
        const result = processCardImage(p.imageData, {
          batch: activeBatch,
        });
        const row = pipelineResultToRow(p.file.name, result, includeUncorrected);
        rows.push(row);
      } catch (e) {
        console.error('Error analyzing image:', p.file.name, e);
      }
    }

    setBatchRows(rows);
    setAnalyzingBatch(false);

    // Auto fit regression if enough rows
    const fit = fitBatchCalibrationFromRows(rows);
    if (fit) {
      setRegressionResult(fit);
    }
  };

  const handleExportCSV = () => {
    if (batchRows.length === 0) return;
    const csvContent = exportRowsToCSV(batchRows, includeUncorrected);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    platform.saveFile(blob, `BoraScan_Research_Export_${Date.now()}.csv`);
  };

  // Generate Batch QR from fitted parameters
  const handleGenerateBatchQR = async () => {
    if (!regressionResult) return;
    const batchJson = {
      v: 1,
      batch: newBatchName,
      m: regressionResult.m,
      b: regressionResult.b,
      sy: regressionResult.sy,
      g0: regressionResult.g0,
      lod: regressionResult.lod,
      cut: 0.1,
      lin: 0.25,
      dL: -10,
      aMax: 5,
      made: new Date().toISOString().split('T')[0],
      exp: '2027-12-31',
    };

    try {
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(batchJson), {
        errorCorrectionLevel: 'M',
        width: 320,
        margin: 2,
      });
      setGeneratedQRUrl(qrDataUrl);
    } catch (e) {
      console.error('QR generation error:', e);
    }
  };

  const handleDownloadQR = () => {
    if (!generatedQRUrl) return;
    const blob = dataUrlToBlob(generatedQRUrl);
    platform.saveFile(blob, `Batch_QR_${newBatchName}.png`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-brand-text max-w-md mx-auto p-5 pb-28 select-none">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
        <div className="p-2.5 rounded-2xl bg-gray-200 text-gray-800">
          <Settings size={24} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-brand-maroon">
            {t('s20_title', lang)}
          </h2>
          <span className="text-xs text-gray-500">Konfigurasi & Aksesibilitas</span>
        </div>
      </div>

      <div className="flex-1 pt-4 space-y-4 text-left">
        {/* Language Selection */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Languages size={20} className="text-brand-blue" />
            <div>
              <span className="text-xs font-bold uppercase text-gray-500 block">
                {t('s20_lang', lang)}
              </span>
              <span className="text-sm font-extrabold text-brand-text">
                {lang === 'id' ? 'Bahasa Indonesia' : 'English'}
              </span>
            </div>
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setLanguage('id')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                lang === 'id' ? 'bg-brand-maroon text-white shadow-sm' : 'text-gray-600'
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                lang === 'en' ? 'bg-brand-maroon text-white shadow-sm' : 'text-gray-600'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Accessibility & Audio Preferences */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          {/* Sound Toggle */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 size={20} className="text-gray-600" />
              <span className="text-sm font-bold text-gray-800">{t('s20_sound', lang)}</span>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={toggleSound}
              className="h-6 w-11 rounded-full bg-gray-200 text-brand-blue transition-colors cursor-pointer"
            />
          </div>

          {/* Vibration Toggle */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Vibrate size={20} className="text-gray-600" />
              <span className="text-sm font-bold text-gray-800">{t('s20_vibration', lang)}</span>
            </div>
            <input
              type="checkbox"
              checked={settings.vibrationEnabled}
              onChange={toggleVibration}
              className="h-6 w-11 rounded-full bg-gray-200 text-brand-blue transition-colors cursor-pointer"
            />
          </div>

          {/* Large Text */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Type size={20} className="text-gray-600" />
              <span className="text-sm font-bold text-gray-800">{t('s20_large_text', lang)}</span>
            </div>
            <input
              type="checkbox"
              checked={settings.largeText}
              onChange={toggleLargeText}
              className="h-6 w-11 rounded-full bg-gray-200 text-brand-blue transition-colors cursor-pointer"
            />
          </div>

          {/* High Contrast */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SunMoon size={20} className="text-gray-600" />
              <span className="text-sm font-bold text-gray-800">{t('s20_high_contrast', lang)}</span>
            </div>
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={toggleHighContrast}
              className="h-6 w-11 rounded-full bg-gray-200 text-brand-blue transition-colors cursor-pointer"
            />
          </div>
        </div>

        {/* Default Reporter Name */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1.5">
          <label className="text-xs font-bold uppercase text-gray-500 block">
            {t('s20_default_reporter', lang)}
          </label>
          <input
            type="text"
            value={settings.defaultReporterName}
            onChange={(e) => updateReporterName(e.target.value)}
            placeholder="Nama untuk laporan BPOM..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-brand-blue"
          />
        </div>

        {/* Research Mode Switch */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm">
              <FlaskConical size={20} />
              <span>{t('s20_research_mode', lang)}</span>
            </div>
            <input
              type="checkbox"
              checked={settings.researchMode}
              onChange={toggleResearchMode}
              className="h-6 w-11 rounded-full text-indigo-600 cursor-pointer"
            />
          </div>
          <p className="text-xs text-indigo-800 leading-relaxed">
            Menampilkan panel data kolorimetri mentah (RGB, Gn, A_G, L*a*b*), analisis batch banyak foto untuk ekspor CSV, dan pembuat QR batch kalibrasi.
          </p>

          {/* Expanded Research Mode Tools */}
          {settings.researchMode && (
            <div className="mt-4 pt-4 border-t border-indigo-200 space-y-3">
              <h4 className="text-xs font-black uppercase text-indigo-900">
                Alat Eksperimen & Analisis Batch
              </h4>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="uncorrectedToggle"
                  checked={includeUncorrected}
                  onChange={(e) => setIncludeUncorrected(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="uncorrectedToggle" className="text-xs text-indigo-950 font-medium">
                  Sertakan data tanpa koreksi warna (lighting test)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handlePickBatchPhotos}
                  disabled={analyzingBatch}
                  className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                >
                  <FileSpreadsheet size={16} />
                  <span>{analyzingBatch ? 'Menganalisis...' : 'Analisis Foto Batch'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  disabled={batchRows.length === 0}
                  className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-white border border-indigo-300 text-indigo-800 text-xs font-bold shadow-sm hover:bg-indigo-50 active:scale-95 disabled:opacity-40"
                >
                  <Download size={16} />
                  <span>Ekspor CSV ({batchRows.length})</span>
                </button>
              </div>

              {/* Linear Regression Results */}
              {regressionResult && (
                <div className="p-3 bg-white rounded-xl border border-indigo-200 text-[11px] space-y-1">
                  <div className="font-bold text-indigo-900">Hasil Regresi Linear (A_G vs %):</div>
                  <div>Kemiringan (m): <strong>{regressionResult.m}</strong></div>
                  <div>Intersep (b): <strong>{regressionResult.b}</strong></div>
                  <div>R²: <strong>{regressionResult.r2}</strong></div>
                  <div>Residual SD (sy): <strong>{regressionResult.sy}</strong></div>
                  <div>LOD: <strong>{regressionResult.lod} %</strong></div>
                  <div>g0 (Blank Mean Gn): <strong>{regressionResult.g0}</strong></div>

                  <div className="pt-2 flex gap-2">
                    <input
                      type="text"
                      value={newBatchName}
                      onChange={(e) => setNewBatchName(e.target.value)}
                      className="px-2 py-1 border rounded text-xs w-32"
                      placeholder="Nama Batch"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateBatchQR}
                      className="flex-1 py-1 px-2 rounded bg-indigo-700 text-white font-bold text-xs"
                    >
                      Buat Batch QR
                    </button>
                  </div>
                </div>
              )}

              {/* QR Preview */}
              {generatedQRUrl && (
                <div className="p-3 bg-white rounded-xl border border-indigo-200 text-center space-y-2">
                  <img
                    src={generatedQRUrl}
                    alt="Generated Batch QR"
                    className="w-40 h-40 mx-auto border"
                  />
                  <button
                    type="button"
                    onClick={handleDownloadQR}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                  >
                    <Download size={14} />
                    <span>Simpan QR PNG</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* About App & Disclaimers */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm text-xs space-y-2 text-gray-700">
          <div className="flex items-center gap-2 font-bold text-brand-maroon text-sm">
            <Info size={18} />
            <span>{t('s20_about_title', lang)}</span>
          </div>
          <p>{t('s20_about_text', lang)}</p>
          <p className="text-[11px] text-gray-500">
            Akurasi berbasis detektor ArUco MIP_36h12, homografi DLT ter-normalisasi, koreksi warna kuadrat terkecil IEC 61966-2-1, dan pembedaan amonia rosocyanin.
          </p>
        </div>

        {/* Clear All Data Button */}
        <button
          type="button"
          onClick={handleClearAll}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-sm hover:bg-rose-100 active:scale-95"
        >
          <Trash2 size={18} />
          <span>{t('s20_clear_data', lang)}</span>
        </button>
      </div>
    </div>
  );
};
