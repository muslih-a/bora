import React, { useState } from 'react';
import { t, Language } from '../i18n/index.ts';
import { Utensils, ArrowLeft, ArrowRight } from 'lucide-react';

interface S03FoodTypeProps {
  lang: Language;
  onBack: () => void;
  onNext: (foodType: string, note?: string) => void;
}

export const S03FoodType: React.FC<S03FoodTypeProps> = ({ lang, onBack, onNext }) => {
  const [selectedFood, setSelectedFood] = useState<string>('Bakso');
  const [customFood, setCustomFood] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const foodOptions = [
    { id: 'Bakso', label: t('s03_food_bakso', lang) },
    { id: 'Mi', label: t('s03_food_mi', lang) },
    { id: 'Kerupuk', label: t('s03_food_kerupuk', lang) },
    { id: 'Lontong', label: t('s03_food_lontong', lang) },
    { id: 'Lainnya', label: t('s03_food_lainnya', lang) },
  ];

  const handleNext = () => {
    const finalFood = selectedFood === 'Lainnya' ? customFood.trim() || 'Lainnya' : selectedFood;
    onNext(finalFood, note.trim() || undefined);
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
          Langkah 1 dari 5
        </span>
        <div className="w-8" />
      </div>

      <div className="flex-1 pt-6 space-y-6">
        <div>
          <div className="inline-flex p-3 rounded-2xl bg-rose-100 text-brand-maroon mb-3">
            <Utensils size={28} />
          </div>
          <h2 className="text-2xl font-black text-brand-maroon tracking-tight">
            {t('s03_title', lang)}
          </h2>
          <p className="text-sm text-gray-600 mt-1">{t('s03_subtitle', lang)}</p>
        </div>

        {/* Food Type Chips */}
        <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Jenis Makanan">
          {foodOptions.map((opt) => {
            const isSelected = selectedFood === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedFood(opt.id)}
                className={`px-4 py-3 rounded-xl font-bold text-sm transition-all border min-h-[48px] select-none ${
                  isSelected
                    ? 'bg-brand-blue text-white border-brand-blue shadow-md scale-[1.02]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
                role="radio"
                aria-checked={isSelected}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Custom food input if 'Lainnya' */}
        {selectedFood === 'Lainnya' && (
          <div className="animate-fadeIn">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              {t('s03_food_other_placeholder', lang)}
            </label>
            <input
              type="text"
              value={customFood}
              onChange={(e) => setCustomFood(e.target.value)}
              placeholder="Contoh: Tahu putih, ikan asin, dsb."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-blue bg-white text-base"
              autoFocus
            />
          </div>
        )}

        {/* Optional Note */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            {t('s03_note_label', lang)}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={t('s03_note_placeholder', lang)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-blue bg-white text-sm"
          />
        </div>
      </div>

      {/* Bottom Action */}
      <div className="pt-4 pb-4">
        <button
          type="button"
          onClick={handleNext}
          disabled={selectedFood === 'Lainnya' && !customFood.trim()}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-brand-blue text-white font-bold text-lg shadow-lg hover:opacity-95 active:scale-[0.98] transition-transform disabled:opacity-40 min-h-[52px]"
        >
          <span>{t('btn_next', lang)}</span>
          <ArrowRight size={22} />
        </button>
      </div>
    </div>
  );
};
