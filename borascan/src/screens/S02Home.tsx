import React from 'react';
import { t, Language } from '../i18n/index.ts';
import { BatchCalibration } from '../core/config.ts';
import { TestRecord } from '../data/db.ts';
import { ResultBadge } from '../components/ResultBadge.tsx';
import {
  PlusCircle,
  QrCode,
  History,
  BookOpen,
  MessageSquareWarning,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface S02HomeProps {
  lang: Language;
  activeBatch: BatchCalibration;
  lastTest?: TestRecord;
  onStartNewTest: () => void;
  onOpenBatchQR: () => void;
  onOpenHistory: () => void;
  onOpenGuide: () => void;
  onOpenBPOMInfo: () => void;
  onOpenLastTest: () => void;
}

export const S02Home: React.FC<S02HomeProps> = ({
  lang,
  activeBatch,
  lastTest,
  onStartNewTest,
  onOpenBatchQR,
  onOpenHistory,
  onOpenGuide,
  onOpenBPOMInfo,
  onOpenLastTest,
}) => {
  return (
    <div className="flex flex-col min-h-screen pb-24 bg-brand-bg text-brand-text">
      {/* Top Brand Bar */}
      <header className="bg-brand-maroon text-white px-5 pt-8 pb-6 rounded-b-3xl shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-rose-200 font-semibold">
              Screening Tool
            </span>
            <h1 className="text-2xl font-black tracking-tight">{t('app_name', lang)}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 font-bold backdrop-blur-sm">
              Offline v1.0
            </span>
          </div>
        </div>

        {/* Screening Disclaimer Notice */}
        <div className="mt-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 flex items-start gap-2.5 text-xs text-rose-100">
          <AlertTriangle size={18} className="text-amber-300 shrink-0 mt-0.5" />
          <p className="leading-snug">{t('screening_disclaimer_short', lang)}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 pt-5 space-y-4 max-w-md mx-auto w-full">
        {/* Big Start Button */}
        <button
          type="button"
          onClick={onStartNewTest}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-brand-blue text-white font-extrabold text-lg shadow-lg hover:opacity-95 active:scale-[0.98] transition-transform min-h-[58px]"
        >
          <PlusCircle size={26} />
          <span>{t('s02_btn_new_test', lang)}</span>
        </button>

        {/* Active Batch Card */}
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-brand-maroon rounded-xl">
              <QrCode size={24} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-500 uppercase">
                  {t('s02_batch_card_title', lang)}
                </span>
                {activeBatch.isDemo && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-extrabold">
                    DEMO
                  </span>
                )}
              </div>
              <h3 className="font-extrabold text-brand-text text-base">{activeBatch.batch}</h3>
              <p className="text-xs text-gray-500">
                {t('s02_batch_exp', lang)}: {activeBatch.exp}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenBatchQR}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-brand-blue border border-gray-200 min-h-[44px]"
          >
            {t('btn_change', lang)}
          </button>
        </div>

        {/* Last Result Card */}
        {lastTest ? (
          <div
            onClick={onOpenLastTest}
            className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm cursor-pointer hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase">
                {t('s02_last_result_title', lang)}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(lastTest.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ResultBadge
                  code={lastTest.category}
                  lang={lang}
                  size="sm"
                  autoAnnounce={false}
                />
                <div className="ml-2">
                  <h4 className="font-bold text-brand-text text-sm">{lastTest.foodType}</h4>
                  <p className="text-xs text-gray-500">{lastTest.estimate.displayTextPct}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white/70 border border-dashed border-gray-300 text-center text-sm text-gray-500">
            {t('s02_no_previous_test', lang)}
          </div>
        )}

        {/* Quick Links Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onOpenHistory}
            className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col items-start hover:border-gray-300 text-left min-h-[90px]"
          >
            <div className="p-2 bg-blue-50 text-brand-blue rounded-xl mb-2">
              <History size={20} />
            </div>
            <span className="text-sm font-bold text-brand-text">{t('s02_quick_history', lang)}</span>
          </button>

          <button
            type="button"
            onClick={onOpenGuide}
            className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col items-start hover:border-gray-300 text-left min-h-[90px]"
          >
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl mb-2">
              <BookOpen size={20} />
            </div>
            <span className="text-sm font-bold text-brand-text">{t('s02_quick_guide', lang)}</span>
          </button>
        </div>

        {/* BPOM Alert Quick Button */}
        <button
          type="button"
          onClick={onOpenBPOMInfo}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 text-red-700 rounded-xl">
              <MessageSquareWarning size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-900">{t('s02_quick_report_info', lang)}</h4>
              <p className="text-xs text-red-700">HaloBPOM WhatsApp: +62 811 9181 533</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-red-400" />
        </button>
      </main>
    </div>
  );
};
