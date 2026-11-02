import React, { useState } from 'react';
import { t, Language } from '../i18n/index.ts';
import { StepCard } from '../components/StepCard.tsx';
import { ArrowLeft, ArrowRight, ClipboardCheck } from 'lucide-react';

interface S04PrepChecklistProps {
  lang: Language;
  onBack: () => void;
  onNext: () => void;
}

export const S04PrepChecklist: React.FC<S04PrepChecklistProps> = ({ lang, onBack, onNext }) => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });

  const toggleStep = (step: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [step]: !prev[step],
    }));
  };

  const allCompleted = Object.values(completedSteps).every(Boolean);

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
          Langkah 2 dari 5
        </span>
        <div className="w-8" />
      </div>

      <div className="flex-1 pt-5 space-y-4">
        <div>
          <div className="inline-flex p-2.5 rounded-2xl bg-amber-100 text-amber-800 mb-2">
            <ClipboardCheck size={26} />
          </div>
          <h2 className="text-2xl font-black text-brand-maroon tracking-tight">
            {t('s04_title', lang)}
          </h2>
          <p className="text-sm text-gray-600 mt-1">{t('s04_subtitle', lang)}</p>
        </div>

        {/* Steps List */}
        <div className="space-y-3 pb-4">
          <StepCard
            stepNumber={1}
            title={t('s04_step1_title', lang)}
            description={t('s04_step1_desc', lang)}
            isCompleted={!!completedSteps[1]}
            onToggleComplete={() => toggleStep(1)}
            lang={lang}
          />
          <StepCard
            stepNumber={2}
            title={t('s04_step2_title', lang)}
            description={t('s04_step2_desc', lang)}
            isCompleted={!!completedSteps[2]}
            onToggleComplete={() => toggleStep(2)}
            lang={lang}
          />
          <StepCard
            stepNumber={3}
            title={t('s04_step3_title', lang)}
            description={t('s04_step3_desc', lang)}
            isCompleted={!!completedSteps[3]}
            onToggleComplete={() => toggleStep(3)}
            lang={lang}
          />
          <StepCard
            stepNumber={4}
            title={t('s04_step4_title', lang)}
            description={t('s04_step4_desc', lang)}
            timerDurationSec={60}
            timerLabel={t('s04_step4_timer', lang)}
            isCompleted={!!completedSteps[4]}
            onToggleComplete={() => toggleStep(4)}
            lang={lang}
          />
          <StepCard
            stepNumber={5}
            title={t('s04_step5_title', lang)}
            description={t('s04_step5_desc', lang)}
            timerDurationSec={120}
            timerLabel={t('s04_step5_timer', lang)}
            isCompleted={!!completedSteps[5]}
            onToggleComplete={() => toggleStep(5)}
            lang={lang}
          />
        </div>
      </div>

      {/* Bottom Action */}
      <div className="pt-2 pb-4">
        <button
          type="button"
          onClick={onNext}
          className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform min-h-[52px] ${
            allCompleted
              ? 'bg-brand-blue text-white hover:opacity-95'
              : 'bg-brand-blue text-white opacity-90'
          }`}
        >
          <span>{t('btn_next', lang)}</span>
          <ArrowRight size={22} />
        </button>
      </div>
    </div>
  );
};
