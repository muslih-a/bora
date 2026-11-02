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

interface S10Result0Props {
  lang: Language;
  foodType: string;
  pipelineResult: PipelineResult;
  photoDataUrl: string;
  batchId: string;
  researchMode?: boolean;
  onSave: () => void;
  onTestAgain: () => void;
}

export const S10Result0: React.FC<S10Result0Props> = ({
  lang,
  foodType,
  pipelineResult,
  photoDataUrl,
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
      category: '0',
      isAmmoniaDone: false,
      estimate: pipelineResult.estimate,
      initialPhotoDataUrl: photoDataUrl,
      initialPipelineResult: pipelineResult,
    };
    const pdfBlob = generateTestPDF(dummyRecord);
    platform.saveFile(pdfBlob, `Laporan_BoraScan_0_${Date.now()}.pdf`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-brand-text max-w-md mx-auto p-5 pb-8 select-none">
      {/* Top Disclaimer Alert */}
      <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 mb-4">
        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-snug">{t('screening_disclaimer', lang)}</p>
      </div>

      <div className="flex-1 flex flex-col items-center">
        {/* Result Badge */}
        <div className="my-4 w-full">
          <ResultBadge code="0" lang={lang} size="lg" />
        </div>

        {/* Details Card */}
        <div className="w-full bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3 mb-4 text-left">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Jenis Makanan:</span>
            <span className="text-sm font-extrabold text-brand-text">{foodType}</span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Kadar Boraks:</span>
            <span className="text-sm font-extrabold text-emerald-700">
              &lt; {pipelineResult.estimate.displayTextPct} (Di bawah LOD)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Status Skrining:</span>
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle size={14} /> Aman
            </span>
          </div>
        </div>

        {/* Photo Thumbnail */}
        {photoDataUrl && (
          <div className="w-full bg-white p-3 rounded-2xl border border-gray-200 shadow-sm mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase block mb-1.5">
              Dokumentasi Foto Strip:
            </span>
            <img
              src={photoDataUrl}
              alt="Foto Strip Terbaca"
              className="w-full h-36 object-cover rounded-xl border border-gray-200"
            />
          </div>
        )}

        {/* Research Mode Data Panel */}
        {researchMode && (
          <div className="w-full bg-indigo-50 border border-indigo-200 p-4 rounded-2xl mb-4 text-left text-xs space-y-1.5">
            <div className="flex items-center gap-1 text-indigo-900 font-bold uppercase mb-1">
              <FlaskConical size={14} />
              <span>Data Mode Riset</span>
            </div>
            <div>Pad RGB Raw: {pipelineResult.rawPadRGB.join(', ')}</div>
            <div>Pad RGB Corr: {pipelineResult.correctedPadRGB.join(', ')}</div>
            <div>W RGB Raw: {pipelineResult.rawWRGB.join(', ')}</div>
            <div>Gn: {pipelineResult.estimate.Gn.toFixed(4)}</div>
            <div>A_G: {pipelineResult.estimate.A_G.toFixed(4)}</div>
            <div>
              Lab: L*={pipelineResult.correctedPadLab.L.toFixed(1)}, a*=
              {pipelineResult.correctedPadLab.a.toFixed(1)}, b*=
              {pipelineResult.correctedPadLab.b.toFixed(1)}
            </div>
            <div>Sharpness (Laplacian): {pipelineResult.quality.metrics.laplacianVariance.toFixed(1)}</div>
            <div>Markers: {pipelineResult.markers.matchedCount}/4</div>
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
