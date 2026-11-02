import React from 'react';
import { t, Language } from '../i18n/index.ts';
import { TestRecord, deleteTestById } from '../data/db.ts';
import { ResultBadge } from '../components/ResultBadge.tsx';
import { generateTestPDF } from '../data/pdf.ts';
import { platform } from '../platform/index.ts';
import {
  ArrowLeft,
  FileText,
  Trash2,
  MessageSquareWarning,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface S18HistoryDetailProps {
  lang: Language;
  test: TestRecord;
  onBack: () => void;
  onReportBPOM: (test: TestRecord) => void;
  onDeleted: () => void;
}

export const S18HistoryDetail: React.FC<S18HistoryDetailProps> = ({
  lang,
  test,
  onBack,
  onReportBPOM,
  onDeleted,
}) => {
  const dateFormatted = new Date(test.date).toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const handleDownloadPDF = () => {
    const pdfBlob = generateTestPDF(test);
    platform.saveFile(pdfBlob, `Laporan_BoraScan_${test.category}_${Date.now()}.pdf`);
  };

  const handleDelete = async () => {
    const ok = window.confirm('Hapus rekaman pengujian ini?');
    if (ok) {
      await deleteTestById(test.id);
      onDeleted();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-brand-text max-w-md mx-auto p-5 pb-8 select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <button
          type="button"
          onClick={onBack}
          className="p-2 -ml-2 text-gray-600 hover:text-brand-maroon rounded-full active:bg-gray-200"
          aria-label={t('btn_back', lang)}
        >
          <ArrowLeft size={24} />
        </button>
        <span className="text-sm font-bold text-brand-maroon uppercase tracking-wide">
          {t('s18_title', lang)}
        </span>
        <button
          type="button"
          onClick={handleDelete}
          className="p-2 -mr-2 text-red-600 hover:text-red-800 rounded-full"
          aria-label={t('btn_delete', lang)}
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="flex-1 pt-4 space-y-4">
        {/* Result Badge */}
        <div className="py-2">
          <ResultBadge code={test.category} lang={lang} size="lg" />
        </div>

        {/* Disclaimer Notice */}
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2 text-xs text-amber-900">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-snug">{t('screening_disclaimer_short', lang)}</p>
        </div>

        {/* Details Table Card */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-2.5 text-left text-xs">
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="font-bold text-gray-500 uppercase">Waktu Tes:</span>
            <span className="font-semibold text-gray-800">{dateFormatted}</span>
          </div>

          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="font-bold text-gray-500 uppercase">Jenis Makanan:</span>
            <span className="font-extrabold text-brand-text">{test.foodType}</span>
          </div>

          {test.note && (
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="font-bold text-gray-500 uppercase">Catatan:</span>
              <span className="text-gray-700">{test.note}</span>
            </div>
          )}

          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="font-bold text-gray-500 uppercase">Batch Strip:</span>
            <span className="font-mono font-bold text-gray-800">{test.batchId}</span>
          </div>

          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="font-bold text-gray-500 uppercase">Estimasi Kadar:</span>
            <span className="font-black text-rose-700">
              {test.estimate.displayTextPct} ({test.estimate.displayTextMgKg})
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-bold text-gray-500 uppercase">Rentang:</span>
            <span className="font-semibold text-gray-700">
              {test.estimate.rangeLoPct.toFixed(2).replace('.', ',')}–
              {test.estimate.rangeHiPct.toFixed(2).replace('.', ',')} %
            </span>
          </div>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-2 gap-3">
          {test.initialPhotoDataUrl && (
            <div className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                {t('s18_photo_initial', lang)}
              </span>
              <img
                src={test.initialPhotoDataUrl}
                alt="Foto 1"
                className="w-full h-28 object-cover rounded-xl border border-gray-100"
              />
            </div>
          )}

          {test.ammoniaPhotoDataUrl && (
            <div className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                {t('s18_photo_ammonia', lang)}
              </span>
              <img
                src={test.ammoniaPhotoDataUrl}
                alt="Foto 2"
                className="w-full h-28 object-cover rounded-xl border border-gray-100"
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-3">
        {test.category === 'B+' && (
          <button
            type="button"
            onClick={() => onReportBPOM(test)}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-extrabold text-base shadow-md min-h-[50px]"
          >
            <MessageSquareWarning size={20} />
            <span>{t('btn_report_bpom', lang)}</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleDownloadPDF}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white border border-gray-300 font-bold text-sm text-gray-700 hover:bg-gray-50 min-h-[48px]"
        >
          <FileText size={18} />
          <span>{t('btn_share_pdf', lang)}</span>
        </button>
      </div>
    </div>
  );
};
