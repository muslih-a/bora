import React from 'react';
import { t, Language } from '../i18n/index.ts';
import { PipelineResult } from '../core/pipeline.ts';
import { ResultBadge } from '../components/ResultBadge.tsx';
import { generateTestPDF } from '../data/pdf.ts';
import { platform } from '../platform/index.ts';
import { TestRecord } from '../data/db.ts';
import {
  FileText,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  FlaskConical,
  Save,
} from 'lucide-react';

interface S14ResultBMinusProps {
  lang: Language;
  foodType: string;
  initialResult: PipelineResult;
  ammoniaResult: PipelineResult;
  initialPhotoUrl?: string;
  ammoniaPhotoUrl?: string;
  batchId: string;
  researchMode?: boolean;
  onSave: () => void;
  onTestAgain: () => void;
}

export const S14ResultBMinus: React.FC<S14ResultBMinusProps> = ({
  lang,
  foodType,
  initialResult,
  ammoniaResult,
  initialPhotoUrl,
  ammoniaPhotoUrl,
  batchId,
  researchMode = false,
  onSave,
  onTestAgain,
}) => {
  const handleDownloadPDF = () => {
    const dummyRecord: TestRecord = {
      id: new Date().toISOString(),
      date: new Date().toISOString(),
      foodType,
      batchId,
      category: 'B-',
      isAmmoniaDone: true,
      estimate: initialResult.estimate,
      initialPhotoDataUrl: initialPhotoUrl,
      ammoniaPhotoDataUrl: ammoniaPhotoUrl,
      initialPipelineResult: initialResult,
      ammoniaPipelineResult: ammoniaResult,
    };
    const pdfBlob = generateTestPDF(dummyRecord);
    platform.saveFile(pdfBlob, `Laporan_BoraScan_BMinus_${Date.now()}.pdf`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-brand-text max-w-md mx-auto p-5 pb-8 select-none">
      {/* Top Disclaimer Alert */}
      <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 mb-3">
        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-snug">{t('screening_disclaimer', lang)}</p>
      </div>

      <div className="flex-1 flex flex-col items-center">
        {/* Result Badge B- */}
        <div className="my-3 w-full">
          <ResultBadge code="B-" lang={lang} size="lg" />
        </div>

        {/* Details Card */}
        <div className="w-full bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-2 mb-4 text-left">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Jenis Makanan:</span>
            <span className="text-sm font-extrabold text-brand-text">{foodType}</span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Status Amonia:</span>
            <span className="text-sm font-extrabold text-blue-800">Bukan Boraks (Negatif)</span>
          </div>

          <div className="pt-1 text-xs text-gray-600 leading-relaxed">
            {t('s14_desc', lang)}
          </div>
        </div>

        {/* Research Data Panel */}
        {researchMode && (
          <div className="w-full bg-indigo-50 border border-indigo-200 p-3.5 rounded-2xl mb-4 text-left text-xs space-y-1">
            <div className="flex items-center gap-1 text-indigo-900 font-bold uppercase mb-1">
              <FlaskConical size={14} />
              <span>Data Mode Riset</span>
            </div>
            <div>
              dL (L*_after - L*_before): {ammoniaResult.ammoniaDecision?.dL.toFixed(2)} (Ambang: &lt;= -10)
            </div>
            <div>
              a* after: {ammoniaResult.ammoniaDecision?.aAfter.toFixed(2)} (Ambang: &lt;= 5)
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={onSave}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-brand-blue text-white font-bold text-base shadow-md hover:opacity-95 active:scale-[0.98] min-h-[50px]"
        >
          <Save size={20} />
          <span>{t('btn_save', lang)}</span>
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
            onClick={onTestAgain}
            className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-gray-100 font-bold text-sm text-gray-700 hover:bg-gray-200 active:scale-95 min-h-[48px]"
          >
            <RotateCcw size={18} />
            <span>{t('btn_test_again', lang)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
