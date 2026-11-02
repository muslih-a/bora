import React, { useState } from 'react';
import { t, Language } from '../i18n/index.ts';
import { ShieldCheck, Eye, Sparkles, ChevronRight, Check } from 'lucide-react';

interface S01SplashProps {
  lang: Language;
  onFinish: () => void;
}

export const S01Splash: React.FC<S01SplashProps> = ({ lang, onFinish }) => {
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      icon: ShieldCheck,
      iconBg: 'bg-rose-100 text-brand-maroon',
      title: t('s01_slide1_title', lang),
      desc: t('s01_slide1_desc', lang),
    },
    {
      icon: Sparkles,
      iconBg: 'bg-blue-100 text-brand-blue',
      title: t('s01_slide2_title', lang),
      desc: t('s01_slide2_desc', lang),
    },
    {
      icon: Eye,
      iconBg: 'bg-amber-100 text-amber-700',
      title: t('s01_slide3_title', lang),
      desc: t('s01_slide3_desc', lang),
    },
  ];

  const current = slides[slide];
  const Icon = current.icon;
  const isLast = slide === slides.length - 1;

  return (
    <div className="flex flex-col justify-between min-h-screen max-w-md mx-auto p-6 bg-brand-bg text-brand-text select-none">
      {/* Top Bar with Skip */}
      <div className="flex justify-end pt-2">
        {!isLast && (
          <button
            type="button"
            onClick={onFinish}
            className="text-sm font-semibold text-gray-500 hover:text-brand-maroon px-3 py-1.5 rounded-lg active:bg-gray-200"
          >
            {t('btn_skip', lang)}
          </button>
        )}
      </div>

      {/* Main Slide Content */}
      <div className="flex flex-col items-center text-center my-auto px-2">
        <div className={`w-28 h-28 rounded-3xl flex items-center justify-center mb-8 shadow-md ${current.iconBg}`}>
          <Icon size={56} strokeWidth={2} />
        </div>

        <h1 className="text-2xl font-extrabold text-brand-maroon tracking-tight mb-4">
          {current.title}
        </h1>

        <p className="text-base text-gray-700 leading-relaxed max-w-xs">
          {current.desc}
        </p>

        {/* Dots indicator */}
        <div className="flex items-center gap-2 mt-8" aria-label={`Halaman ${slide + 1} dari 3`}>
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === slide ? 'w-8 bg-brand-maroon' : 'w-2.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="pb-6">
        <button
          type="button"
          onClick={() => {
            if (isLast) {
              onFinish();
            } else {
              setSlide(slide + 1);
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-brand-blue text-white font-bold text-lg shadow-lg hover:opacity-95 active:scale-[0.98] transition-transform min-h-[52px]"
        >
          {isLast ? (
            <>
              <span>{t('s01_btn_start', lang)}</span>
              <Check size={22} />
            </>
          ) : (
            <>
              <span>{t('btn_next', lang)}</span>
              <ChevronRight size={22} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
