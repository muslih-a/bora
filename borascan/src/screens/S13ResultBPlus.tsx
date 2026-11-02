import React from 'react';
import { t, Language } from '../i18n/index.ts';
import { PipelineResult } from '../core/pipeline.ts';
import { ResultBadge } from '../components/ResultBadge.tsx';
import { generateTestPDF } from '../data/pdf.ts';
import { platform } from '../platform/index.ts';
import { TestRecord } from '../data/db.ts';
import {
  AlertOctagon,
  MessageSquareWarning,
  FileText,
  FlaskConical,
  RotateCcw,
  Save,
} from 'lucide-react';

interface S13ResultBPlusProps {
  lang: Language;
  foodType: string;
  initialResult: PipelineResult;
  ammoniaResult: PipelineResult;
  initialPhotoUrl?: string;
  ammoniaPhotoUrl?: string;
  batchId: string;
  researchMode?: boolean;
  onReportBPOM: () => void;
  onSave: () => void;
  onTestAgain: () => void;
}

export const S13ResultBPlus: React.FC<S13ResultBPlusProps> = ({
  lang,
  foodType,
  initialResult,
  ammoniaResult,
  initialPhotoUrl,
  ammoniaPhotoUrl,
  batchId,
  researchMode = false,
  onReportBPOM,
  onSave,
  onTestAgain,
}) => {
  const handleDownloadPDF = () => {
    const dummyRecord: TestRecord = {
      id: new Date().toISOString(),
      date: new Date().toISOString(),
      foodType,
      batchId,
      category: 'B+',
      isAmmoniaDone: true,
      estimate: initialResult.estimate,
      initialPhotoDataUrl: initialPhotoUrl,
      ammoniaPhotoDataUrl: ammoniaPhotoUrl,
      initialPipelineResult: initialResult,
      ammoniaPipelineResult: ammoniaResult,
    };
    const pdfBlob = generateTestPDF(dummyRecord);
    platform.saveFile(pdfBlob, `Laporan_BoraScan_BPlus_${Date.now()}.pdf`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-brand-text max-w-md mx-auto p-5 pb-8 select-none">
      {/* Danger Warning Header Banner */}
      <div className="p-3.5 bg-red-600 text-white rounded-2xl flex items-start gap-3 shadow-md mb-3 animate-pulse">
        <AlertOctagon size={24} className="shrink-0 mt-0.5" />
        <div>
          <h3 className="font-black text-sm uppercase tracking-wide">
            {t('s13_warning_1', lang)}
          </h3>
          <p className="text-xs text-red-100 mt-0.5 leading-snug">
            {t('s13_warning_2', lang)}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center">
        {/* Result Badge B+ */}
        <div className="my-3 w-full">
          <ResultBadge code="B+" lang={lang} size="lg" />
        </div>

        {/* Quantitative Estimate Card */}
        <div className="w-full bg-white p-4 rounded-2xl border border-red-200 shadow-sm space-y-2 mb-4 text-left">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Jenis Makanan:</span>
            <span className="text-sm font-extrabold text-brand-text">{foodType}</span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Estimasi Kadar:</span>
            <span className="text-sm font-black text-red-700">
              ≈ {initialResult.estimate.displayTextPct} ({initialResult.estimate.displayTextMgKg})
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Rentang:</span>
            <span className="text-xs font-bold text-gray-700">
              {initialResult.estimate.displayRangePct}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-gray-500 uppercase">Uji Amonia:</span>
            <span className="text-xs font-extrabold text-black bg-gray-200 px-2.5 py-0.5 rounded-full">
              Terbukti Positif (Hijau-Kehitaman)
            </span>
          </div>
        </div>

        {/* Action Advice Box */}
        <div className="w-full bg-amber-50 border border-amber-300 p-3.5 rounded-2xl text-xs text-amber-900 mb-4 text-left">
          <strong>Langkah Disarankan:</strong> {t('s13_warning_3', lang)}
        </div>

        {/* Research Data Panel */}
        {researchMode && (
          <div className="w-full bg-indigo-50 border border-indigo-200 p-3.5 rounded-2xl mb-4 text-left text-xs space-y-1">
            <div className="flex items-center gap-1 text-indigo-900 font-bold uppercase mb-1">
              <FlaskConical size={14} />
              <span>Data Mode Riset</span>
            </div>
            <div>
              dL (L*_after - L*_before):{' '}
              {ammoniaResult.ammoniaDecision?.dL.toFixed(2)} (Ambang: &lt;= -10)
            </div>
            <div>
              a* after: {ammoniaResult.ammoniaDecision?.aAfter.toFixed(2)} (Ambang: &lt;= 5)
            </div>
            <div>
              L*before: {initialResult.correctedPadLab.L.toFixed(1)} → L*after:{' '}
              {ammoniaResult.correctedPadLab.L.toFixed(1)}
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="space-y-3 pt-2">
        {/* Big Report to BPOM Button */}
        <button
          type="button"
          onClick={onReportBPOM}
          className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-black text-lg shadow-xl active:scale-[0.98] transition-transform min-h-[54px]"
        >
          <MessageSquareWarning size={24} />
          <span>{t('btn_report_bpom', lang)}</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-white border border-gray-300 font-bold text-sm text-gray-700 hover:bg-gray-50 active:scale-95 min-h-[48px]"
          >
            <FileText size={18} />
            <span>{t('btn_share_pdf', lang)}</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-gray-100 font-bold text-sm text-gray-700 hover:bg-gray-200 active:scale-95 min-h-[48px]"
          >
            <Save size={18} />
            <span>{t('btn_save', lang)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
