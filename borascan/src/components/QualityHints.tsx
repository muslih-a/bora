// QualityHints component displaying real-time visual status chips for camera scan

import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface QualityHintsProps {
  markerCount: number;
  distanceOk: boolean;
  sharpnessOk: boolean;
  glareOk: boolean;
  lang?: 'id' | 'en';
}

export const QualityHints: React.FC<QualityHintsProps> = ({
  markerCount,
  distanceOk,
  sharpnessOk,
  glareOk,
  lang = 'id',
}) => {
  const cardOk = markerCount >= 3;

  const renderChip = (label: string, ok: boolean, detail?: string) => (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm backdrop-blur-md transition-all ${
        ok
          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/60'
          : 'bg-rose-950/70 text-rose-300 border-rose-500/60 animate-pulse'
      }`}
    >
      {ok ? (
        <CheckCircle2 size={13} className="text-emerald-400" />
      ) : (
        <AlertCircle size={13} className="text-rose-400" />
      )}
      <span>{label}</span>
      {detail && <span className="opacity-80 font-normal">({detail})</span>}
    </div>
  );

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 p-2 w-full">
      {renderChip(
        lang === 'en' ? 'Card' : 'Kartu',
        cardOk,
        `${markerCount}/4`
      )}
      {renderChip(
        lang === 'en' ? 'Distance' : 'Jarak',
        distanceOk,
        distanceOk ? '✓' : lang === 'en' ? 'Move closer' : 'Dekatkan'
      )}
      {renderChip(
        lang === 'en' ? 'Focus' : 'Fokus',
        sharpnessOk,
        sharpnessOk ? '✓' : lang === 'en' ? 'Blurry' : 'Buram'
      )}
      {renderChip(
        lang === 'en' ? 'Glare' : 'Pantulan',
        glareOk,
        glareOk ? '✓' : lang === 'en' ? 'Glare' : 'Silau'
      )}
    </div>
  );
};
