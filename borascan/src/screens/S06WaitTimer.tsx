import React, { useState } from 'react';
import { t, Language } from '../i18n/index.ts';
import { Timer } from '../components/Timer.tsx';
import { ArrowLeft, Camera, Clock } from 'lucide-react';

interface S06WaitTimerProps {
  lang: Language;
  researchMode?: boolean;
  onBack: () => void;
  onReadyToScan: () => void;
}

export const S06WaitTimer: React.FC<S06WaitTimerProps> = ({
  lang,
  researchMode = false,
  onBack,
  onReadyToScan,
}) => {
  const [isFinished, setIsFinished] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-brand-text max-w-md mx-auto p-5 select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <button
          type="button"
          onClick={onBack}
          className="p-2 -ml-2 text-gray-600 hover:text-brand-maroon rounded-full active:bg-gray-200"
          aria-label={t('btn_back', lang)}
        >
          <ArrowLeft size={24} />
        </button>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Langkah 4 dari 5
        </span>
        <div className="w-8" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center pt-2">
        <div className="text-center px-4 mb-2">
          <h2 className="text-2xl font-black text-brand-maroon tracking-tight mb-1">
            {t('s06_title', lang)}
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed max-w-xs">
            {t('s06_subtitle', lang)}
          </p>
        </div>

        {/* 10:00 Timer Ring (600 seconds) */}
        <Timer
          totalSeconds={600}
          spokenIntervals={[300, 60, 0]}
          spokenLang={lang === 'en' ? 'en-US' : 'id-ID'}
          completionMessage={t('s06_timer_done_spoken', lang)}
          allowSkip={researchMode}
          onComplete={() => setIsFinished(true)}
        />

        <p className="text-xs text-gray-400 mt-2 text-center max-w-xs">
          {t('s06_keep_awake', lang)}
        </p>
      </div>

      {/* Bottom Action Button */}
      <div className="pt-4 pb-4">
        <button
          type="button"
          onClick={onReadyToScan}
          disabled={!isFinished && !researchMode}
          className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all min-h-[52px] ${
            isFinished || researchMode
              ? 'bg-brand-blue text-white hover:opacity-95'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
          }`}
        >
          <Camera size={22} />
          <span>{t('btn_scan_now', lang)}</span>
        </button>
      </div>
    </div>
  );
};
