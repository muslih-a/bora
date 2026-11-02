// StepCard component for preparation steps with tickbox, timer integration, and text-to-speech

import React, { useState } from 'react';
import { platform } from '../platform/index.ts';
import { Volume2, CheckCircle2, Circle, Clock, Play } from 'lucide-react';

interface StepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  timerDurationSec?: number; // e.g. 60 or 120
  timerLabel?: string;
  isCompleted: boolean;
  onToggleComplete: () => void;
  lang?: 'id' | 'en';
}

export const StepCard: React.FC<StepCardProps> = ({
  stepNumber,
  title,
  description,
  timerDurationSec,
  timerLabel,
  isCompleted,
  onToggleComplete,
  lang = 'id',
}) => {
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerDurationSec || 0);

  const speakStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    platform.speak(`${title}. ${description}`, lang === 'en' ? 'en-US' : 'id-ID');
  };

  const startTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timerRunning || !timerDurationSec) return;
    setTimerRunning(true);
    setTimeLeft(timerDurationSec);

    const int = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(int);
          setTimerRunning(false);
          platform.vibrate([200, 100, 200]);
          platform.speak(
            lang === 'en' ? 'Step timer finished!' : 'Waktu langkah selesai!',
            lang === 'en' ? 'en-US' : 'id-ID'
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div
      onClick={onToggleComplete}
      className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer select-none ${
        isCompleted
          ? 'bg-blue-50/60 border-brand-blue/50 shadow-sm'
          : 'bg-white border-gray-200 shadow hover:border-gray-300'
      }`}
      role="checkbox"
      aria-checked={isCompleted}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onToggleComplete();
        }
      }}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete();
          }}
          className="mt-0.5 text-brand-blue focus:outline-none"
          aria-label={isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
        >
          {isCompleted ? (
            <CheckCircle2 size={24} className="fill-brand-blue text-white" />
          ) : (
            <Circle size={24} className="text-gray-400" />
          )}
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`font-bold text-base ${isCompleted ? 'text-brand-blue line-through opacity-80' : 'text-brand-text'}`}>
              {title}
            </h3>
            <button
              type="button"
              onClick={speakStep}
              className="p-1 text-gray-500 hover:text-brand-blue focus:outline-none rounded-full"
              title="Dengarkan penjelasan langkah ini"
              aria-label="Bacakan langkah"
            >
              <Volume2 size={18} />
            </button>
          </div>

          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{description}</p>

          {timerDurationSec && (
            <div className="mt-3">
              <button
                type="button"
                onClick={startTimer}
                disabled={timerRunning}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  timerRunning
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <Clock size={14} />
                {timerRunning
                  ? `Sisa waktu: ${timeLeft}s`
                  : timerLabel || `Mulai Timer (${timerDurationSec}s)`}
                {!timerRunning && <Play size={12} className="ml-0.5" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
