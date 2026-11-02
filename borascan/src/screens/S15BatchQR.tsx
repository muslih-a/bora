import React, { useState, useEffect } from 'react';
import jsQR from 'jsqr';
import { t, Language } from '../i18n/index.ts';
import { BatchCalibration, DEMO_BATCH } from '../core/config.ts';
import { getBatches, setActiveBatch, saveBatch } from '../data/db.ts';
import { platform, fileToImageData } from '../platform/index.ts';
import {
  ArrowLeft,
  QrCode,
  CheckCircle,
  Plus,
  AlertCircle,
  Calendar,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';

interface S15BatchQRProps {
  lang: Language;
  onBack: () => void;
  onBatchUpdated: () => void;
}

export const S15BatchQR: React.FC<S15BatchQRProps> = ({
  lang,
  onBack,
  onBatchUpdated,
}) => {
  const [batches, setBatches] = useState<Array<BatchCalibration & { isActive: boolean }>>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadBatches = async () => {
    const list = await getBatches();
    setBatches(list);
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleScanQRImage = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const picked = await platform.pickImage();
    if (!picked) return;

    try {
      const { imageData } = picked;
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (!code || !code.data) {
        setErrorMsg('QR code tidak ditemukan dalam gambar yang dipilih.');
        return;
      }

      const parsed = JSON.parse(code.data);
      if (!parsed.batch || parsed.m === undefined || parsed.b === undefined) {
        setErrorMsg('Format QR batch tidak valid. Pastikan ini QR pada sachet strip BoraNata.');
        return;
      }

      const newBatch: BatchCalibration = {
        v: parsed.v || 1,
        batch: parsed.batch,
        m: Number(parsed.m),
        b: Number(parsed.b),
        sy: Number(parsed.sy || 0.006),
        g0: Number(parsed.g0 || 1.0),
        lod: Number(parsed.lod || 0.02),
        cut: Number(parsed.cut || 0.1),
        lin: Number(parsed.lin || 0.25),
        dL: Number(parsed.dL || -10),
        aMax: Number(parsed.aMax || 5),
        made: parsed.made || new Date().toISOString().split('T')[0],
        exp: parsed.exp || '2026-12-31',
      };

      await saveBatch({ ...newBatch, isActive: true });
      await setActiveBatch(newBatch.batch);
      await loadBatches();
      onBatchUpdated();
      setSuccessMsg(`Batch ${newBatch.batch} berhasil disimpan dan diaktifkan!`);
    } catch (e: any) {
      setErrorMsg(`Gagal membaca QR: ${e.message || 'Format tidak valid'}`);
    }
  };

  const handleSelectActive = async (batchName: string) => {
    await setActiveBatch(batchName);
    await loadBatches();
    onBatchUpdated();
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
          {t('s15_title', lang)}
        </span>
        <div className="w-8" />
      </div>

      <div className="flex-1 pt-4 space-y-4">
        {/* Scan Action Card */}
        <div className="p-4 bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl border border-rose-200 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-maroon text-white flex items-center justify-center mx-auto mb-3 shadow">
            <QrCode size={34} />
          </div>
          <h3 className="font-extrabold text-base text-brand-text mb-1">
            Pindai QR Sachet Strip
          </h3>
          <p className="text-xs text-gray-600 max-w-xs mx-auto mb-4 leading-relaxed">
            Pindai kode QR pada sachet aluminium strip BoraNata untuk memperbarui koefisien kalibrasi (m, b, LOD, cut-off).
          </p>

          <button
            type="button"
            onClick={handleScanQRImage}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-blue text-white font-bold text-sm shadow hover:opacity-95 active:scale-95"
          >
            <ImageIcon size={18} />
            <span>Pilih Foto QR dari Galeri</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-300 rounded-xl flex items-center gap-2 text-xs text-red-800 animate-fadeIn">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-fadeIn">
            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Batches List */}
        <div>
          <h4 className="text-xs font-extrabold uppercase text-gray-500 mb-2.5">
            Daftar Batch Tersimpan ({batches.length})
          </h4>

          <div className="space-y-3">
            {batches.map((b) => (
              <div
                key={b.batch}
                className={`p-4 rounded-2xl border transition-all ${
                  b.isActive
                    ? 'bg-white border-brand-maroon shadow-md'
                    : 'bg-white/80 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-brand-text">{b.batch}</h4>
                      {b.isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                          AKTIF
                        </span>
                      )}
                      {b.isDemo && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                          DEMO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Kedaluwarsa: {b.exp} | Dibuat: {b.made}
                    </p>
                  </div>

                  {!b.isActive && (
                    <button
                      type="button"
                      onClick={() => handleSelectActive(b.batch)}
                      className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-brand-blue border border-gray-300 active:scale-95"
                    >
                      Aktifkan
                    </button>
                  )}
                </div>

                {/* Batch Parameters Grid */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100 text-left text-[11px]">
                  <div>
                    <span className="text-gray-400 block">Kemiringan (m):</span>
                    <span className="font-bold text-gray-700">{b.m}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Intersep (b):</span>
                    <span className="font-bold text-gray-700">{b.b}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">LOD:</span>
                    <span className="font-bold text-gray-700">{b.lod} %</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Ambang (cut):</span>
                    <span className="font-bold text-gray-700">{b.cut} %</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Linearitas (lin):</span>
                    <span className="font-bold text-gray-700">{b.lin} %</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">ΔL Amonia:</span>
                    <span className="font-bold text-gray-700">{b.dL}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
