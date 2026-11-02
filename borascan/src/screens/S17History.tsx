import React, { useState, useEffect } from 'react';
import { t, Language } from '../i18n/index.ts';
import { getAllTests, TestRecord } from '../data/db.ts';
import { ResultBadge } from '../components/ResultBadge.tsx';
import { ResultCategoryCode } from '../core/categories.ts';
import { History, ChevronRight, Calendar, Filter } from 'lucide-react';

interface S17HistoryProps {
  lang: Language;
  onSelectTest: (test: TestRecord) => void;
}

export const S17History: React.FC<S17HistoryProps> = ({ lang, onSelectTest }) => {
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [filterCode, setFilterCode] = useState<string>('ALL');

  useEffect(() => {
    getAllTests().then(setTests);
  }, []);

  const filterOptions = [
    { id: 'ALL', label: t('s17_filter_all', lang) },
    { id: '0', label: '0 ○' },
    { id: '1', label: '1 △' },
    { id: '2', label: '2 □' },
    { id: 'B+', label: 'B+ ⊗' },
    { id: 'B-', label: 'B− ⊖' },
  ];

  const filteredTests = tests.filter((item) => {
    if (filterCode === 'ALL') return true;
    return item.category === filterCode;
  });

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-brand-text max-w-md mx-auto p-5 pb-24 select-none">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
        <div className="p-2.5 rounded-2xl bg-rose-100 text-brand-maroon">
          <History size={24} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-brand-maroon">
            {t('s17_title', lang)}
          </h2>
          <span className="text-xs text-gray-500">
            {tests.length} {lang === 'en' ? 'tests recorded' : 'pengujian tercatat'}
          </span>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
        {filterOptions.map((opt) => {
          const isSelected = filterCode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFilterCode(opt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border min-h-[38px] ${
                isSelected
                  ? 'bg-brand-maroon text-white border-brand-maroon shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Test List */}
      <div className="flex-1 space-y-3 pt-1">
        {filteredTests.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white/60 rounded-2xl border border-dashed border-gray-300 mt-4">
            <History size={36} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold">{t('s17_empty', lang)}</p>
          </div>
        ) : (
          filteredTests.map((item) => {
            const dateStr = new Date(item.date).toLocaleDateString(
              lang === 'en' ? 'en-US' : 'id-ID',
              {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }
            );

            return (
              <div
                key={item.id}
                onClick={() => onSelectTest(item)}
                className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-gray-300 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3">
                  <ResultBadge
                    code={item.category as ResultCategoryCode}
                    lang={lang}
                    size="sm"
                    autoAnnounce={false}
                  />
                  <div>
                    <h3 className="font-bold text-sm text-brand-text">{item.foodType}</h3>
                    <p className="text-xs text-gray-500">
                      {item.estimate?.displayTextPct || '0 %'} ({item.estimate?.displayTextMgKg || '0 mg/kg'})
                    </p>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Calendar size={11} />
                      {dateStr}
                    </span>
                  </div>
                </div>

                <ChevronRight size={20} className="text-gray-400 shrink-0" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
