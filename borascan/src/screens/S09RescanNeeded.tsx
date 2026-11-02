import React from 'react';
import { t, Language } from '../i18n/index.ts';
import { QualityCheckResult, QualityIssueCode } from '../core/quality.ts';
import {
  AlertOctagon,
  RefreshCw,
  Sun,
  Maximize2,
  Focus,
  Sparkles,
  Square,
  ArrowLeft,
} from 'lucide-react';

interface S09RescanNeededProps {
  lang: Language;
  quality: QualityCheckResult;
  onRescan: () => void;
  onCancel: () => void;
}

export const S09RescanNeeded: React.FC<S09RescanNeededProps> = ({
  lang,
  quality,
  onRescan,
  onCancel,
}) => {
  const code: QualityIssueCode = quality.code || 'FEW_MARKERS';

  const getIllustration = () => {
    switch (code) {
      case 'FEW_MARKERS':
        return (
          <div className="relative w-40 h-28 border-2 border-dashed border-rose-400 rounded-xl flex items-center justify-center bg-rose-50/50">
            <Maximize2 size={36} className="text-rose-500 animate-pulse" />
            <span className="absolute bottom-1 text-[10px] font-bold text-rose-700">
              4 Marker Diperlukan
            </span>
          </div>
        );
      case 'TOO_FAR':
        return (
          <div className="relative w-40 h-28 border-2 border-amber-400 rounded-xl flex items-center justify-center bg-amber-50">
            <div className="w-16 h-10 border border-gray-400 bg-white rounded flex items-center justify-center text-[10px] text-gray-500">
              Kartu
            </div>
            <span className="absolute bottom-1 text-[10px] font-bold text-amber-800">
              Dekatkan 15–20 cm
            </span>
          </div>
        );
      case 'BLURRY':
        return (
          <div className="relative w-40 h-28 border-2 border-blue-400 rounded-xl flex items-center justify-center bg-blue-50">
            <Focus size={40} className="text-brand-blue animate-pulse" />
            <span className="absolute bottom-1 text-[10px] font-bold text-brand-blue">
              Ketuk Layar untuk Fokus
            </span>
          </div>
        );
      case 'GLARE':
        return (
          <div className="relative w-40 h-28 border-2 border-amber-400 rounded-xl flex items-center justify-center bg-amber-50">
            <Sparkles size={40} className="text-amber-500" />
            <span className="absolute bottom-1 text-[10px] font-bold text-amber-800">
              Miringkan Sedikit Sudut HP
            </span>
          </div>
        );
      case 'EXPOSURE_DARK':
      case 'EXPOSURE_BRIGHT':
        return (
          <div className="relative w-40 h-28 border-2 border-yellow-400 rounded-xl flex items-center justify-center bg-yellow-50">
            <Sun size={40} className="text-yellow-600" />
            <span className="absolute bottom-1 text-[10px] font-bold text-yellow-800">
              Atur Pencahayaan Ruangan
            </span>
          </div>
        );
      case 'PAD_MISSING':
      case 'PAD_UNEVEN':
      default:
        return (
          <div className="relative w-40 h-28 border-2 border-rose-400 rounded-xl flex items-center justify-center bg-rose-50">
            <Square size={36} className="text-rose-500" />
            <span className="absolute bottom-1 text-[10px] font-bold text-rose-700">
              Letakkan Strip di Slot PAD
            </span>
          </div>
        );
    }
  };

  const reason = lang === 'en' ? quality.reasonEn : quality.reasonId;
  const fix = lang === 'en' ? quality.fixEn : quality.fixId;

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-brand-text max-w-md mx-auto p-5 select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 -ml-2 text-gray-600 hover:text-brand-maroon rounded-full active:bg-gray-200"
          aria-label={t('btn_cancel', lang)}
        >
          <ArrowLeft size={24} />
        </button>
        <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
          {t('s09_title', lang)}
        </span>
        <div className="w-8" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 my-auto">
        <div className="w-20 h-20 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6 shadow-sm">
          <AlertOctagon size={44} />
        </div>

        <h2 className="text-2xl font-black text-brand-maroon tracking-tight mb-2">
          {t('s09_title', lang)}
        </h2>
        <p className="text-sm text-gray-600 mb-6">{t('s09_subtitle', lang)}</p>

        {/* Visual Fix Illustration */}
        <div className="mb-6">{getIllustration()}</div>

        {/* Reason and Fix Details Card */}
        <div className="w-full bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-left space-y-3">
          <div>
            <span className="text-xs font-extrabold uppercase text-gray-500 block">
              {t('s09_reason_label', lang)}
            </span>
            <span className="text-base font-bold text-rose-700">{reason}</span>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <span className="text-xs font-extrabold uppercase text-gray-500 block">
              {t('s09_fix_label', lang)}
            </span>
            <span className="text-sm text-gray-800 leading-snug block mt-0.5">{fix}</span>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="pt-4 pb-4">
        <button
          type="button"
          onClick={onRescan}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-brand-blue text-white font-bold text-lg shadow-lg hover:opacity-95 active:scale-[0.98] transition-transform min-h-[52px]"
        >
          <RefreshCw size={22} />
          <span>{t('btn_rescan', lang)}</span>
        </button>
      </div>
    </div>
  );
};
