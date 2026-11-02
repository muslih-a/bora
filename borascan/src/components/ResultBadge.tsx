// ResultBadge component adhering to WCAG 2.2 SC 1.4.1:
// Displays Code + Symbol + CSS Pattern + Text with Okabe-Ito colors and haptic/speech integration

import React, { useEffect } from 'react';
import { ResultCategoryCode, CATEGORIES } from '../core/categories.ts';
import { platform } from '../platform/index.ts';
import { Volume2 } from 'lucide-react';

interface ResultBadgeProps {
  code: ResultCategoryCode;
  lang?: 'id' | 'en';
  size?: 'sm' | 'md' | 'lg';
  autoAnnounce?: boolean;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

export const ResultBadge: React.FC<ResultBadgeProps> = ({
  code,
  lang = 'id',
  size = 'lg',
  autoAnnounce = true,
  soundEnabled = true,
  vibrationEnabled = true,
}) => {
  const cat = CATEGORIES[code] || CATEGORIES['0'];

  const triggerFeedback = () => {
    if (vibrationEnabled) {
      platform.vibrate(cat.vibrationPattern);
    }
    if (soundEnabled) {
      const message = lang === 'en' ? cat.messageEn : cat.messageId;
      platform.speak(message, lang === 'en' ? 'en-US' : 'id-ID');
    }
  };

  useEffect(() => {
    if (autoAnnounce) {
      triggerFeedback();
    }
  }, [code]);

  // CSS pattern style generator
  const getPatternStyle = (): React.CSSProperties => {
    const baseColor = cat.hexColor;
    switch (cat.pattern) {
      case 'dots':
        return {
          backgroundColor: baseColor,
          backgroundImage:
            'radial-gradient(#1D1D1B 20%, transparent 20%), radial-gradient(#1D1D1B 20%, transparent 20%)',
          backgroundPosition: '0 0, 8px 8px',
          backgroundSize: '16px 16px',
        };
      case 'stripes':
        return {
          backgroundColor: baseColor,
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.25) 10px, rgba(255,255,255,0.25) 20px)',
        };
      case 'cross-hatch':
        return {
          backgroundColor: baseColor,
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.2) 0, rgba(255,255,255,0.2) 2px, transparent 0, transparent 8px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.2) 0, rgba(255,255,255,0.2) 2px, transparent 0, transparent 8px)',
        };
      case 'diagonal-stripes':
        return {
          backgroundColor: baseColor,
          backgroundImage:
            'repeating-linear-gradient(135deg, transparent, transparent 8px, rgba(29,29,27,0.2) 8px, rgba(29,29,27,0.2) 16px)',
        };
      case 'plain':
      default:
        return {
          backgroundColor: baseColor,
        };
    }
  };

  const isSmall = size === 'sm';
  const isMedium = size === 'md';

  return (
    <div
      className="flex flex-col items-center text-center w-full"
      role="region"
      aria-label={`Hasil: Kode ${cat.code}, Simbol ${cat.symbol}, ${lang === 'en' ? cat.messageEn : cat.messageId}`}
    >
      <div
        className={`relative flex items-center justify-center font-bold shadow-md rounded-2xl border-4 border-white transition-transform active:scale-95 cursor-pointer ${
          isSmall ? 'w-16 h-16 text-2xl' : isMedium ? 'w-24 h-24 text-4xl' : 'w-36 h-36 text-6xl'
        }`}
        style={{
          ...getPatternStyle(),
          color: cat.textColor,
        }}
        onClick={triggerFeedback}
        title="Ketuk untuk mendengar suara & merasakan getaran kode ini"
      >
        <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] select-none">
          {cat.code} {cat.symbol}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerFeedback();
          }}
          className="absolute bottom-1 right-1 p-1 bg-black/40 rounded-full text-white hover:bg-black/60 focus:outline-none"
          aria-label="Dengarkan pengumuman hasil"
        >
          <Volume2 size={isSmall ? 12 : 18} />
        </button>
      </div>

      <div className="mt-3">
        <h2 className="text-xl font-extrabold text-brand-text tracking-tight">
          {lang === 'en' ? cat.messageEn : cat.messageId}
        </h2>
        <p className="text-sm text-gray-700 mt-1 max-w-sm">
          {lang === 'en' ? cat.descriptionEn : cat.descriptionId}
        </p>
      </div>
    </div>
  );
};
