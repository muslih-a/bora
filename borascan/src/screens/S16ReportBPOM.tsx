import React, { useState } from 'react';
import { t, Language } from '../i18n/index.ts';
import { platform, dataUrlToBlob } from '../platform/index.ts';
import { PipelineResult } from '../core/pipeline.ts';
import {
  ArrowLeft,
  MessageSquare,
  Copy,
  Check,
  AlertTriangle,
  Download,
  ShieldAlert,
} from 'lucide-react';

interface S16ReportBPOMProps {
  lang: Language;
  foodType: string;
  initialResult: PipelineResult;
  ammoniaResult?: PipelineResult;
  initialPhotoUrl?: string;
  batchId: string;
  defaultReporterName?: string;
  onBack: () => void;
}

export const S16ReportBPOM: React.FC<S16ReportBPOMProps> = ({
  lang,
  foodType,
  initialResult,
  ammoniaResult,
  initialPhotoUrl,
  batchId,
  defaultReporterName = '',
  onBack,
}) => {
  const [reporterName, setReporterName] = useState(defaultReporterName);
  const [agreedDisclaimer, setAgreedDisclaimer] = useState(false);
  const [copied, setCopied] = useState(false);

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const estimate = initialResult.estimate;
  const x = estimate.displayTextPct.replace(' %', '');
  const mgkg = estimate.displayTextMgKg.replace(' mg/kg', '');
  const lo = estimate.rangeLoPct.toFixed(2).replace('.', ',');
  const hi = estimate.rangeHiPct.toFixed(2).replace('.', ',');

  const reportText = `Laporan dugaan boraks pada makanan (hasil skrining aplikasi BoraScan)
Nama pelapor: ${reporterName || 'Masyarakat Peduli'}
Jenis makanan: ${foodType}
Tanggal & jam tes: ${dateFormatted}
Hasil: B+ (terkonfirmasi dengan amonia)
Estimasi kadar boraks: ${x} % (${mgkg} mg/kg), rentang ${lo}–${hi} %
Batch strip: ${batchId}
Catatan: ini hasil skrining, mohon pemeriksaan laboratorium. Foto strip terlampir.`;

  const handleSendWhatsApp = async () => {
    if (!reporterName.trim() || !agreedDisclaimer) return;

    let imageBlob: Blob | undefined;
    if (initialPhotoUrl) {
      try {
        imageBlob = dataUrlToBlob(initialPhotoUrl);
      } catch (e) {
        console.warn('Could not convert dataUrl to blob for share:', e);
      }
    }

    await platform.shareWhatsAppReport({
      text: reportText,
      imageBlob,
      filename: `strip_borascan_${Date.now()}.jpg`,
    });
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSavePhoto = () => {
    if (initialPhotoUrl) {
      const blob = dataUrlToBlob(initialPhotoUrl);
      platform.saveFile(blob, `foto_strip_borascan_${Date.now()}.jpg`);
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
        <span className="text-sm font-bold text-red-700 uppercase tracking-wide">
          {t('s16_title', lang)}
        </span>
        <div className="w-8" />
      </div>

      <div className="flex-1 pt-4 space-y-4">
        {/* Official HaloBPOM Banner */}
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
          <div className="p-2.5 bg-red-600 text-white rounded-xl shrink-0 mt-0.5">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-red-950">HaloBPOM (Kanal Resmi)</h3>
            <p className="text-xs text-red-800 mt-0.5">
              WhatsApp: <strong>+62 811 9181 533</strong>
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Laporan diteruskan langsung ke sistem pengaduan Badan Pengawas Obat dan Makanan RI.
            </p>
          </div>
        </div>

        {/* Reporter Name Field (Required) */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-left">
          <label className="block text-xs font-extrabold uppercase text-gray-700 mb-1.5">
            {t('s16_reporter_name', lang)} *
          </label>
          <input
            type="text"
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            placeholder={t('s16_reporter_placeholder', lang)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-blue text-sm"
            required
          />
        </div>

        {/* Message Preview Box */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-left">
          <span className="block text-xs font-extrabold uppercase text-gray-500 mb-2">
            Pratinjau Pesan WhatsApp:
          </span>
          <pre className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 whitespace-pre-wrap leading-relaxed select-text">
            {reportText}
          </pre>
        </div>

        {/* Photo Thumbnail & Save Button */}
        {initialPhotoUrl && (
          <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={initialPhotoUrl}
                alt="Foto Strip"
                className="w-14 h-14 object-cover rounded-xl border border-gray-200"
              />
              <span className="text-xs text-gray-600 font-medium">
                {t('s16_save_photo_hint', lang)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSavePhoto}
              className="p-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold shrink-0"
              title="Simpan foto ke galeri"
            >
              <Download size={18} />
            </button>
          </div>
        )}

        {/* Disclaimer Agreement Checkbox (Required) */}
        <label className="flex items-start gap-3 p-3.5 bg-amber-50/80 border border-amber-300 rounded-2xl cursor-pointer">
          <input
            type="checkbox"
            checked={agreedDisclaimer}
            onChange={(e) => setAgreedDisclaimer(e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
          />
          <span className="text-xs text-amber-950 font-medium leading-relaxed">
            {t('s16_checkbox_agree', lang)}
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-3">
        <button
          type="button"
          onClick={handleSendWhatsApp}
          disabled={!reporterName.trim() || !agreedDisclaimer}
          className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-xl active:scale-[0.98] transition-all disabled:opacity-40 min-h-[52px]"
        >
          <MessageSquare size={22} />
          <span>{t('s16_btn_whatsapp', lang)}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyText}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white border border-gray-300 font-bold text-sm text-gray-700 hover:bg-gray-50 active:scale-95 min-h-[48px]"
        >
          {copied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
          <span>{copied ? t('s16_copied', lang) : t('s16_btn_copy', lang)}</span>
        </button>
      </div>
    </div>
  );
};
