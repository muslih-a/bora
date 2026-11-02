// One-page PDF test report generation using jsPDF

import { jsPDF } from 'jspdf';
import { TestRecord } from './db.ts';
import { CATEGORIES } from '../core/categories.ts';

export function generateTestPDF(test: TestRecord): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const catInfo = CATEGORIES[test.category];
  const dateStr = new Date(test.date).toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  // Header Bar (Brand Maroon #7B1E2E)
  doc.setFillColor(123, 30, 46);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BORASCAN – LAPORAN SKRINING BORAKS', 15, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistem Deteksi Kolorimetri Strip Mandiri', 15, 20);

  // Disclaimer Alert Box
  doc.setFillColor(254, 243, 199); // amber 100
  doc.setDrawColor(217, 119, 6); // amber 600
  doc.rect(15, 28, 180, 14, 'FD');
  doc.setTextColor(146, 64, 14); // amber 800
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PERHATIAN: HASIL SKRINING AWAL', 20, 34);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Hasil ini merupakan pengujian cepat non-laboratorium dan wajib dikonfirmasi melalui uji laboratorium BPOM.',
    20,
    39
  );

  // Result Card Section
  let y = 48;
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(15, y, 180, 36, 3, 3, 'FD');

  // Badge square
  if (test.category === '0') doc.setFillColor(0, 114, 178); // Blue
  else if (test.category === '1') doc.setFillColor(230, 159, 0); // Orange
  else if (test.category === '2') doc.setFillColor(213, 94, 0); // Vermillion
  else if (test.category === 'B+') doc.setFillColor(29, 29, 27); // Black
  else doc.setFillColor(86, 180, 233); // Sky Blue

  doc.rect(20, y + 5, 26, 26, 'F');
  doc.setTextColor(test.category === '1' || test.category === 'B-' ? 20 : 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${test.category} ${catInfo.symbol}`, 33, y + 22, { align: 'center' });

  // Result text
  doc.setTextColor(29, 29, 27);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(catInfo.messageId, 52, y + 13);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(catInfo.descriptionId, 52, y + 20, { maxWidth: 135 });

  // Metadata Table
  y = 90;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Rincian Sampel & Pengujian', 15, y);

  y += 5;
  doc.setDrawColor(220, 220, 220);
  doc.line(15, y, 195, y);

  y += 6;
  const drawRow = (label: string, val: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(label, 15, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(val, 75, y);
    y += 6;
  };

  drawRow('Waktu Pengujian:', dateStr);
  drawRow('Jenis Makanan:', test.foodType);
  if (test.note) drawRow('Catatan Tambahan:', test.note);
  drawRow('Batch Strip:', test.batchId);
  drawRow('Estimasi Kadar (% w/w):', test.estimate.displayTextPct);
  drawRow('Estimasi (mg/kg):', test.estimate.displayTextMgKg);
  drawRow(
    'Rentang Keyakinan:',
    `${test.estimate.rangeLoPct.toFixed(2).replace('.', ',')}–${test.estimate.rangeHiPct.toFixed(2).replace('.', ',')} %`
  );

  // Photos Section
  y += 4;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Dokumentasi Foto Strip', 15, y);
  y += 5;
  doc.line(15, y, 195, y);
  y += 6;

  const photoW = 75;
  const photoH = 50;

  if (test.initialPhotoDataUrl) {
    try {
      doc.addImage(test.initialPhotoDataUrl, 'JPEG', 15, y, photoW, photoH);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Foto 1: Deteksi Awal (10 Menit)', 15, y + photoH + 4);
    } catch (e) {
      console.warn('Could not embed initial photo in PDF:', e);
    }
  }

  if (test.ammoniaPhotoDataUrl) {
    try {
      doc.addImage(test.ammoniaPhotoDataUrl, 'JPEG', 105, y, photoW, photoH);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Foto 2: Konfirmasi Tetes Amonia (1 Menit)', 105, y + photoH + 4);
    } catch (e) {
      console.warn('Could not embed ammonia photo in PDF:', e);
    }
  }

  // Official BPOM Footer
  const footerY = 255;
  doc.setFillColor(245, 245, 245);
  doc.rect(15, footerY, 180, 26, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(15, footerY, 180, 26, 'D');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 29, 27);
  doc.text('KONTAK PENGADUAN RESMI BPOM RI (HaloBPOM)', 20, footerY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text('WhatsApp: +62 811 9181 533 | Call Center: 1500533 | Email: halobpom@pom.go.id', 20, footerY + 13);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Laporan ini dibuat otomatis oleh aplikasi BoraScan untuk tujuan skrining keamanan pangan mandiri.', 20, footerY + 20);

  return doc.output('blob');
}
