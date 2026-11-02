import React, { useEffect, useState } from 'react';
import { t, Language } from '../i18n/index.ts';
import { processCardImage, PipelineResult } from '../core/pipeline.ts';
import { BatchCalibration } from '../core/config.ts';
import { Lab } from '../core/colour.ts';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface S08AnalysingProps {
  lang: Language;
  imageData: ImageData;
  batch: BatchCalibration;
  isAmmoniaScan?: boolean;
  firstScanPadLab?: Lab;
  onAnalysisSuccess: (result: PipelineResult) => void;
  onAnalysisFailure: (result: PipelineResult) => void;
}

export const S08Analysing: React.FC<S08AnalysingProps> = ({
  lang,
  imageData,
  batch,
  isAmmoniaScan = false,
  firstScanPadLab,
  onAnalysisSuccess,
  onAnalysisFailure,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    let timer1: any = null;
    let timer2: any = null;
    let timer3: any = null;

    timer1 = setTimeout(() => {
      setCurrentStep(2);
    }, 400);

    timer2 = setTimeout(() => {
      setCurrentStep(3);
    }, 800);

    timer3 = setTimeout(() => {
      // Execute pipeline
      try {
        const result = processCardImage(imageData, {
          batch,
          isAmmoniaScan,
          firstScanPadLab,
        });

        if (result.success) {
          onAnalysisSuccess(result);
        } else {
          onAnalysisFailure(result);
        }
      } catch (err) {
        console.error('Fatal error in processCardImage:', err);
        // Fallback failure result
        const fallbackResult = processCardImage(imageData, {
          batch,
          isAmmoniaScan,
          firstScanPadLab,
        });
        onAnalysisFailure(fallbackResult);
      }
    }, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const steps = [
    { num: 1, label: t('s08_step1', lang) },
    { num: 2, label: t('s08_step2', lang) },
    { num: 3, label: t('s08_step3', lang) },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-bg text-brand-text max-w-md mx-auto p-6 select-none">
      <div className="relative flex items-center justify-center w-28 h-28 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-brand-blue/20 animate-ping" />
        <div className="w-24 h-24 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center shadow-md">
          <Loader2 size={44} className="animate-spin text-brand-blue" />
        </div>
      </div>

      <h2 className="text-2xl font-black text-brand-maroon tracking-tight mb-8">
        {t('s08_title', lang)}
      </h2>

      {/* Progress Steps Card */}
      <div className="w-full bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        {steps.map((st) => {
          const isDone = currentStep > st.num;
          const isCurrent = currentStep === st.num;

          return (
            <div key={st.num} className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-brand-blue text-white animate-pulse'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isDone ? <CheckCircle2 size={16} /> : st.num}
              </div>
              <span
                className={`text-sm font-semibold ${
                  isDone
                    ? 'text-gray-800'
                    : isCurrent
                    ? 'text-brand-blue font-bold'
                    : 'text-gray-400'
                }`}
              >
                {st.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
