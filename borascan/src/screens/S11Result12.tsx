import React from 'react';
import { t, Language } from '../i18n/index.ts';
import { PipelineResult } from '../core/pipeline.ts';
import { ResultBadge } from '../components/ResultBadge.tsx';
import {
  AlertTriangle,
  ArrowRight,
  Droplet,
  FlaskConical,
} from 'lucide-react';

interface S11Result12Props {
  lang: Language;
  foodType: string;
  pipelineResult: PipelineResult;
  photoDataUrl: string;
  batchId: string;
  researchMode?: boolean;
  onProceedToAmmonia: () => void;
}

export const S11Result12: React.FC<S11Result12Props> = ({
  lang,
  foodType,
  pipelineResult,
  photoDataUrl,
  batchId,
  researchMode = false,
  onProceedToAmmonia,
}) => {
  const category = pipelineResult.category; // '1' or '2'

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-brand-text max-w-md mx-auto p-5 pb-8 select-none">
      {/* Top Disclaimer Alert */}
      <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 mb-3">
        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-snug">{t('screening_disclaimer', lang)}</p>
      </div>

      <div className="flex-1 flex flex-col items-center">
        {/* Result Badge (Code 1 or 2) */}
        <div className="my-3 w-full">
          <ResultBadge code={category} lang={lang} size="lg" />
        </div>

        {/* Quantitative Estimate Card */}
        <div className="w-full bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-2 mb-4 text-left">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Jenis Makanan:</span>
            <span className="text-sm font-extrabold text-brand-text">{foodType}</span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">
              {t('s11_estimate_label', lang)}
            </span>
            <span className="text-sm font-black text-rose-700">
              ≈ {pipelineResult.estimate.displayTextPct} ({pipelineResult.estimate.displayTextMgKg})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">
              {t('s11_range_label', lang)}
            </span>
            <span className="text-xs font-bold text-gray-700">
              {pipelineResult.estimate.displayRangePct}
            </span>
          </div>
        </div>

        {/* Next Mandatory Step Card (Ammonia test) */}
        <div className="w-full bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-400 p-4 rounded-2xl shadow-sm text-left mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm">
              <Droplet size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-amber-900">
                {t('s11_next_card_title', lang)}
              </h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                {t('s11_next_card_desc', lang)}
              </p>
            </div>
          </div>
        </div>

        {/* Research Data Panel */}
        {researchMode && (
          <div className="w-full bg-indigo-50 border border-indigo-200 p-3.5 rounded-2xl mb-4 text-left text-xs space-y-1">
            <div className="flex items-center gap-1 text-indigo-900 font-bold uppercase mb-1">
              <FlaskConical size={14} />
              <span>Data Mode Riset</span>
            </div>
            <div>Pad RGB Raw: {pipelineResult.rawPadRGB.join(', ')}</div>
            <div>Pad RGB Corr: {pipelineResult.correctedPadRGB.join(', ')}</div>
            <div>Gn: {pipelineResult.estimate.Gn.toFixed(4)}</div>
            <div>A_G: {pipelineResult.estimate.A_G.toFixed(4)}</div>
            <div>
              Lab: L*={pipelineResult.correctedPadLab.L.toFixed(1)}, a*=
              {pipelineResult.correctedPadLab.a.toFixed(1)}, b*=
              {pipelineResult.correctedPadLab.b.toFixed(1)}
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Button: Proceed to ammonia test */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onProceedToAmmonia}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-lg shadow-xl active:scale-[0.98] transition-transform min-h-[54px]"
        >
          <span>{t('btn_ammonia_step', lang)}</span>
          <ArrowRight size={22} />
        </button>
      </div>
    </div>
  );
};
