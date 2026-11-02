import React, { useState, useEffect } from 'react';
import { t, Language } from '../i18n/index.ts';
import { platform } from '../platform/index.ts';
import { ArrowLeft, ArrowRight, Droplets, CheckCircle2 } from 'lucide-react';

interface S05DipProps {
  lang: Language;
  onBack: () => void;
  onDone: () => void;
}

export const S05Dip: React.FC<S05DipProps> = ({ lang, onBack, onDone }) => {
  const [isDipping, setIsDipping] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [dipDone, setDipDone] = useState(false);

  useEffect(() => {
    let int: any = null;
    if (isDipping && secondsLeft > 0) {
      int = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(int);
            setIsDipping(false);
            setDipDone(true);
            platform.vibrate([200, 100, 300]);
            platform.speak(
              lang === 'en'
                ? '5 seconds completed. Remove strip now.'
                : '5 detik selesai. Angkat strip sekarang.',
              lang === 'en' ? 'en-US' : 'id-ID'
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (int) clearInterval(int);
    };
  }, [isDipping, secondsLeft, lang]);

  const startDipTimer = () => {
    setIsDipping(true);
    setDipDone(false);
    setSecondsLeft(5);
    platform.speak(
      lang === 'en' ? 'Dipping pad for 5 seconds...' : 'Mencelupkan pad selama 5 detik...',
      lang === 'en' ? 'en-US' : 'id-ID'
    );
  };

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
          Langkah 3 dari 5
        </span>
        <div className="w-8" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 my-auto">
        <div className="w-24 h-24 rounded-3xl bg-blue-100 text-brand-blue flex items-center justify-center mb-6 shadow-sm">
          <Droplets size={48} />
        </div>

        <h2 className="text-2xl font-black text-brand-maroon tracking-tight mb-2">
          {t('s05_title', lang)}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed max-w-xs mb-8">
          {t('s05_subtitle', lang)}
        </p>

        {/* Visual Timer / Action Button */}
        {!dipDone ? (
          <button
            type="button"
            onClick={startDipTimer}
            disabled={isDipping}
            className={`w-44 h-44 rounded-full flex flex-col items-center justify-center font-extrabold shadow-xl transition-all active:scale-95 ${
              isDipping
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-brand-blue text-white hover:opacity-95'
            }`}
          >
            {isDipping ? (
              <>
                <span className="text-6xl font-mono">{secondsLeft}</span>
                <span className="text-xs mt-1 uppercase tracking-wider">
                  {t('s05_countdown_active', lang)}
                </span>
              </>
            ) : (
              <>
                <span className="text-xl px-4">{t('s05_countdown_btn', lang)}</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex flex-col items-center animate-fadeIn">
            <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 size={56} />
            </div>
            <h3 className="text-lg font-bold text-emerald-800 mb-1">
              {lang === 'en' ? 'Dip Complete!' : 'Pencelupan Selesai!'}
            </h3>
            <p className="text-sm text-gray-600 max-w-xs">
              {t('s05_done_prompt', lang)}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="pt-4 pb-4">
        <button
          type="button"
          onClick={onDone}
          disabled={!dipDone && !isDipping}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-brand-blue text-white font-bold text-lg shadow-lg hover:opacity-95 active:scale-[0.98] transition-transform disabled:opacity-40 min-h-[52px]"
        >
          <span>{t('btn_next', lang)}</span>
          <ArrowRight size={22} />
        </button>
      </div>
    </div>
  );
};
