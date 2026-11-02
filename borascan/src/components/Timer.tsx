// Circular progress ring countdown timer with Screen Wake Lock and speech notifications

import React, { useState, useEffect } from 'react';
import { platform } from '../platform/index.ts';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';

interface TimerProps {
  totalSeconds: number;
  spokenIntervals?: number[]; // e.g. [300, 60, 0] for 5m, 1m, 0m
  spokenLang?: 'id-ID' | 'en-US';
  onComplete?: () => void;
  allowSkip?: boolean;
  completionMessage?: string;
  autoStart?: boolean;
}

export const Timer: React.FC<TimerProps> = ({
  totalSeconds,
  spokenIntervals = [300, 60, 0],
  spokenLang = 'id-ID',
  onComplete,
  allowSkip = false,
  completionMessage = 'Waktunya memindai! Letakkan strip pada kartu.',
  autoStart = true,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isActive, setIsActive] = useState(autoStart);

  // Keep awake effect
  useEffect(() => {
    let releaseWakeLock: (() => void) | null = null;
    if (isActive && secondsLeft > 0) {
      platform.requestKeepAwake().then((release) => {
        releaseWakeLock = release;
      });
    }
    return () => {
      if (releaseWakeLock) releaseWakeLock();
    };
  }, [isActive, secondsLeft]);

  // Timer interval countdown
  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          const nextVal = prev - 1;

          // Check spoken interval announcements
          if (spokenIntervals.includes(nextVal)) {
            if (nextVal === 0) {
              platform.speak(completionMessage, spokenLang);
              platform.vibrate([200, 100, 200, 100, 400]);
            } else if (nextVal === 300) {
              const msg = spokenLang === 'en-US' ? '5 minutes remaining' : 'Sisa waktu lima menit';
              platform.speak(msg, spokenLang);
            } else if (nextVal === 60) {
              const msg = spokenLang === 'en-US' ? '1 minute remaining' : 'Sisa waktu satu menit';
              platform.speak(msg, spokenLang);
            }
          }

          if (nextVal <= 0) {
            setIsActive(false);
            if (onComplete) onComplete();
            return 0;
          }
          return nextVal;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft, spokenIntervals, spokenLang, completionMessage, onComplete]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 1;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  const handleSkip = () => {
    setSecondsLeft(0);
    setIsActive(false);
    platform.speak(completionMessage, spokenLang);
    if (onComplete) onComplete();
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* SVG Circular Ring */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="#0072B2"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-500 ease-linear"
          />
        </svg>

        {/* Center Countdown Display */}
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-extrabold text-brand-text font-mono tracking-wider">
            {formatTime(secondsLeft)}
          </span>
          <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
            {secondsLeft === 0 ? 'Selesai' : isActive ? 'Berjalan' : 'Dijeda'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-6">
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          disabled={secondsLeft === 0}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-blue text-white shadow hover:opacity-90 active:scale-95 disabled:opacity-40"
          aria-label={isActive ? 'Jeda timer' : 'Mulai timer'}
        >
          {isActive ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={() => {
            setSecondsLeft(totalSeconds);
            setIsActive(false);
          }}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-gray-700 shadow hover:bg-gray-300 active:scale-95"
          aria-label="Atur ulang timer"
        >
          <RotateCcw size={20} />
        </button>

        {allowSkip && (
          <button
            type="button"
            onClick={handleSkip}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 hover:bg-amber-200"
            title="Lewati timer dalam Mode Riset"
          >
            <FastForward size={16} />
            Lewati
          </button>
        )}
      </div>
    </div>
  );
};
