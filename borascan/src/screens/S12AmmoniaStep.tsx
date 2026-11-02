import React, { useState } from 'react';
import { t, Language } from '../i18n/index.ts';
import { Timer } from '../components/Timer.tsx';
import { ArrowLeft, Camera, Droplets, Info } from 'lucide-react';

interface S12AmmoniaStepProps {
  lang: Language;
  researchMode?: boolean;
  onBack: () => void;
  onReadyToScanAmmonia: () => void;
}

export const S12AmmoniaStep: React.FC<S12AmmoniaStepProps> = ({
  lang,
  researchMode = false,
  onBack,
  onReadyToScanAmmonia,
}) => {
  const [timerFinished, setTimerFinished] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-brand-text max-w-md mx-auto p-5 select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <button
          type="button"
          onClick={onBack}
          className="p-2 -ml-2 text-gray-600 hover:text-brand-maroon rounded-full active:bg-gray-200"
          aria-label={t('btn_back', lang)}
        >
          <ArrowLeft size={24} />
        </button>
        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
          Konfirmasi Amonia
        </span>
        <div className="w-8" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center pt-2">
        {/* Instruction Card */}
        <div className="w-full bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-4 space-y-2.5 text-left">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
            <Droplets size={20} />
            <span>{t('s12_title', lang)}</span>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">
            {t('s12_step1', lang)}
          </p>
          <p className="text-xs text-gray-700 leading-relaxed">
            {t('s12_step2', lang)}
          </p>

          <div className="p-2.5 bg-blue-50 text-blue-900 rounded-xl text-xs flex items-start gap-2">
            <Info size={16} className="text-brand-blue shrink-0 mt-0.5" />
            <p className="leading-snug">
              Boraks akan bereaksi menjadi <strong>hijau-kehitaman (B+)</strong>. Makanan yang hanya basa alami tidak berubah menjadi hijau-kehitaman (B−).
            </p>
          </div>
        </div>

        {/* 1:00 Countdown Timer (60 seconds) */}
        <Timer
          totalSeconds={60}
          spokenIntervals={[30, 0]}
          spokenLang={lang === 'en' ? 'en-US' : 'id-ID'}
          completionMessage={t('s12_ready_to_scan', lang)}
          allowSkip={researchMode}
          onComplete={() => setTimerFinished(true)}
        />
      </div>

      {/* Bottom Button */}
      <div className="pt-4 pb-4">
        <button
          type="button"
          onClick={onReadyToScanAmmonia}
          disabled={!timerFinished && !researchMode}
          className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all min-h-[52px] ${
            timerFinished || researchMode
              ? 'bg-brand-blue text-white hover:opacity-95'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
          }`}
        >
          <Camera size={22} />
          <span>{t('btn_scan_now', lang)} (Tahap 2)</span>
        </button>
      </div>
    </div>
  );
};
