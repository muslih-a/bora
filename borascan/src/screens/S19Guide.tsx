import React, { useState } from 'react';
import { t, Language } from '../i18n/index.ts';
import {
  BookOpen,
  Printer,
  ShieldAlert,
  HelpCircle,
  CheckCircle,
  FileDown,
} from 'lucide-react';
import { getSampleCardDataUrl } from '../core/testCard.ts';
import { platform, dataUrlToBlob } from '../platform/index.ts';

interface S19GuideProps {
  lang: Language;
}

export const S19Guide: React.FC<S19GuideProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'card' | 'safety' | 'faq'>('steps');

  const downloadCardImage = () => {
    const dataUrl = getSampleCardDataUrl('blank');
    const blob = dataUrlToBlob(dataUrl);
    platform.saveFile(blob, 'BoraScan_Card_v2_85x55mm.jpg');
  };

  const stepsList = [
    { num: 1, title: 'Pakai Sarung Tangan', desc: 'Mencegah kontaminasi minyak atau sabun pada sampel.' },
    { num: 2, title: 'Ambil 1 Sendok Makanan', desc: 'Potong kecil atau lumatkan dalam wadah bersih.' },
    { num: 3, title: 'Tambahkan 2 Sendok Air', desc: 'Gunakan air bersih untuk melarutkan boraks (rasio 1:2).' },
    { num: 4, title: 'Aduk & Remas 1 Menit', desc: 'Ekstraksi kandungan makanan ke dalam larutan air.' },
    { num: 5, title: 'Diamkan 2 Menit', desc: 'Endapkan ampas padat; gunakan cairan bening di atasnya.' },
    { num: 6, title: 'Celupkan Strip 5 Detik', desc: 'Celupkan bantalan BoraNata lalu tiriskan cairan berlebih.' },
    { num: 7, title: 'Tunggu 10 Menit', desc: 'Waktu reaksi kurkumin dengan boraks membentuk rosocyanin.' },
    { num: 8, title: 'Pindai Kartu BoraScan', desc: 'Posisikan strip di slot PAD dan ambil foto tegak lurus.' },
    { num: 9, title: 'Uji Amonia (Jika Kode 1 atau 2)', desc: 'Teteskan 1 tetes amonia, tunggu 1 menit, dan pindai ulang.' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-brand-text max-w-md mx-auto p-5 pb-24 select-none">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
        <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800">
          <BookOpen size={24} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-brand-maroon">
            {t('s19_title', lang)}
          </h2>
          <span className="text-xs text-gray-500">
            Panduan Lengkap Penggunaan Kartu & Strip
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 bg-gray-200/70 rounded-xl my-4 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('steps')}
          className={`flex-1 py-2 rounded-lg transition-all ${
            activeTab === 'steps' ? 'bg-white text-brand-maroon shadow-sm' : 'text-gray-600'
          }`}
        >
          {t('s19_tab_steps', lang)}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('card')}
          className={`flex-1 py-2 rounded-lg transition-all ${
            activeTab === 'card' ? 'bg-white text-brand-maroon shadow-sm' : 'text-gray-600'
          }`}
        >
          {t('s19_tab_card', lang)}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('safety')}
          className={`flex-1 py-2 rounded-lg transition-all ${
            activeTab === 'safety' ? 'bg-white text-brand-maroon shadow-sm' : 'text-gray-600'
          }`}
        >
          {t('s19_tab_safety', lang)}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('faq')}
          className={`flex-1 py-2 rounded-lg transition-all ${
            activeTab === 'faq' ? 'bg-white text-brand-maroon shadow-sm' : 'text-gray-600'
          }`}
        >
          {t('s19_tab_faq', lang)}
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-3 text-left">
        {activeTab === 'steps' && (
          <div className="space-y-2.5">
            {stepsList.map((st) => (
              <div key={st.num} className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-maroon text-white flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5">
                  {st.num}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-brand-text">{st.title}</h4>
                  <p className="text-xs text-gray-600 mt-0.5">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'card' && (
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3 text-xs leading-relaxed text-gray-700">
            <h4 className="font-extrabold text-sm text-brand-maroon">Petunjuk Cetak Kartu:</h4>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Ukuran Skala:</strong> 85 × 55 mm (ukuran standar kartu nama / KTP).</li>
              <li><strong>Skala Cetak:</strong> Selalu pilih <strong>100% / Actual Size</strong>. Jangan centang "Fit to page".</li>
              <li><strong>Kertas:</strong> Gunakan kertas tebal matte / doff (Art Carton 260–310 gsm).</li>
              <li><strong>Pantulan:</strong> Hindari laminasi glossy mengkilap karena pantulan cahaya lampu dapat mengganggu sensor kamera.</li>
            </ul>

            <div className="pt-2">
              <button
                type="button"
                onClick={downloadCardImage}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-blue text-white font-bold text-xs shadow hover:opacity-95"
              >
                <FileDown size={16} />
                <span>Unduh Gambar Kartu BoraScan (85 × 55 mm)</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'safety' && (
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3 text-xs text-gray-700">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <ShieldAlert size={20} />
              <span>Keamanan Bahan Kimia & Pangan</span>
            </div>
            <p>
              <strong>Bahaya Boraks:</strong> Boraks (natrium tetraborat) adalah bahan pengawet kayu dan keramik non-pangan yang bersifat karsinogenik dan merusak ginjal.
            </p>
            <p>
              <strong>Larutan Amonia:</strong> Gunakan larutan amonia encer (1–2%). Jangan sampai terkena mata atau tertelan. Jauhkan dari jangkauan anak-anak.
            </p>
            <p>
              <strong>Sampel Tersisa:</strong> Jika hasil menunjukkan <strong>B+ (Positif)</strong>, jangan dikonsumsi. Simpan sisa makanan dalam wadah tertutup di lemari es jika ingin dijadikan bukti aduan BPOM.
            </p>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="space-y-2.5 text-xs text-gray-700">
            <div className="bg-white p-3.5 rounded-xl border border-gray-200">
              <h4 className="font-bold text-sm text-brand-text mb-1">0 ○ (Biru)</h4>
              <p>Boraks tidak terdeteksi. Kadar berada di bawah limit deteksi kit (&lt; 0,020%).</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-gray-200">
              <h4 className="font-bold text-sm text-amber-700 mb-1">1 △ (Jingga) / 2 □ (Merah)</h4>
              <p>Warna berubah samar atau kuat. Wajib dilanjutkan dengan uji 1 tetes amonia untuk konfirmasi.</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-gray-200">
              <h4 className="font-bold text-sm text-black mb-1">B+ ⊗ (Hitam)</h4>
              <p>Reaksi khas boraks terkonfirmasi positif setelah tetes amonia (berubah warna menjadi hijau-kehitaman). Jangan dimakan!</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-gray-200">
              <h4 className="font-bold text-sm text-sky-700 mb-1">B− ⊖ (Biru Muda)</h4>
              <p>Bukan boraks. Makanan hanya bersifat basa alami (misal air abu pada mi basah).</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
