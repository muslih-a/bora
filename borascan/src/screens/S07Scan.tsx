import React, { useRef, useState, useEffect } from 'react';
import { t, Language } from '../i18n/index.ts';
import { QualityHints } from '../components/QualityHints.tsx';
import { detectCardMarkers } from '../core/aruco.ts';
import { computeLaplacianVariance } from '../core/quality.ts';
import { platform, fileToImageData } from '../platform/index.ts';
import { getSampleCardDataUrl } from '../core/testCard.ts';
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  Zap,
  ZapOff,
  RefreshCw,
  FlaskConical,
} from 'lucide-react';

interface S07ScanProps {
  lang: Language;
  isAmmoniaMode?: boolean;
  onBack: () => void;
  onCapture: (imageData: ImageData, photoDataUrl: string) => void;
}

export const S07Scan: React.FC<S07ScanProps> = ({
  lang,
  isAmmoniaMode = false,
  onBack,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  // Live quality metrics
  const [markerCount, setMarkerCount] = useState(0);
  const [distanceOk, setDistanceOk] = useState(false);
  const [sharpnessOk, setSharpnessOk] = useState(false);
  const [glareOk, setGlareOk] = useState(true);

  // Auto-capture timer
  const autoCaptureTimerRef = useRef<any>(null);
  const [autoCapturing, setAutoCapturing] = useState(false);

  // Initialize camera
  useEffect(() => {
    let isMounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);

          // Check torch capability
          const track = stream.getVideoTracks()[0];
          const capabilities = (track as any).getCapabilities?.() || {};
          if (capabilities.torch) {
            setHasTorch(true);
          }
        }
      } catch (err) {
        console.warn('Camera access error:', err);
        setCameraActive(false);
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (autoCaptureTimerRef.current) {
        clearTimeout(autoCaptureTimerRef.current);
      }
    };
  }, []);

  // Periodic frame sampling for live quality hints
  useEffect(() => {
    let animId: any = null;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const checkFrame = () => {
      if (videoRef.current && videoRef.current.readyState >= 2 && ctx) {
        const vw = videoRef.current.videoWidth || 640;
        const vh = videoRef.current.videoHeight || 480;

        // Downscale for real-time marker check
        canvas.width = Math.min(vw, 640);
        canvas.height = Math.round((vh / vw) * canvas.width);

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Marker detection
        const markerRes = detectCardMarkers(imgData);
        const count = markerRes.matchedCount;
        setMarkerCount(count);

        // Distance check (marker side)
        let minSide = 0;
        if (markerRes.detectedMarkers.length > 0) {
          minSide = Math.min(...markerRes.detectedMarkers.map((m) => m.sideLengthPx));
        }
        const distGood = minSide >= 30; // normalized for downscaled preview
        setDistanceOk(distGood);

        // Sharpness check
        const variance = computeLaplacianVariance(imgData);
        const sharpGood = variance >= 50;
        setSharpnessOk(sharpGood);

        // Glare check
        let glareCount = 0;
        for (let i = 0; i < imgData.data.length; i += 16) {
          if (imgData.data[i] >= 250 && imgData.data[i + 1] >= 250 && imgData.data[i + 2] >= 250) {
            glareCount++;
          }
        }
        const glareGood = glareCount / (imgData.data.length / 16) < 0.05;
        setGlareOk(glareGood);

        // Auto capture if all checks pass for 1s
        const allGood = count >= 3 && distGood && sharpGood && glareGood;
        if (allGood) {
          if (!autoCaptureTimerRef.current) {
            setAutoCapturing(true);
            autoCaptureTimerRef.current = setTimeout(() => {
              handleManualCapture();
            }, 1000);
          }
        } else {
          if (autoCaptureTimerRef.current) {
            clearTimeout(autoCaptureTimerRef.current);
            autoCaptureTimerRef.current = null;
            setAutoCapturing(false);
          }
        }
      }
      animId = setTimeout(checkFrame, 250);
    };

    animId = setTimeout(checkFrame, 500);

    return () => {
      if (animId) clearTimeout(animId);
      if (autoCaptureTimerRef.current) clearTimeout(autoCaptureTimerRef.current);
    };
  }, [cameraActive]);

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      const nextState = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setTorchOn(nextState);
    } catch (e) {
      console.warn('Torch toggle failed:', e);
    }
  };

  const handleManualCapture = () => {
    if (autoCaptureTimerRef.current) {
      clearTimeout(autoCaptureTimerRef.current);
      autoCaptureTimerRef.current = null;
    }
    setAutoCapturing(false);

    if (videoRef.current) {
      const vw = videoRef.current.videoWidth || 1280;
      const vh = videoRef.current.videoHeight || 720;
      const canvas = document.createElement('canvas');
      canvas.width = vw;
      canvas.height = vh;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, vw, vh);
        const imgData = ctx.getImageData(0, 0, vw, vh);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        platform.vibrate([100]);
        onCapture(imgData, dataUrl);
      }
    }
  };

  const handleGalleryPick = async () => {
    const picked = await platform.pickImage();
    if (picked) {
      onCapture(picked.imageData, picked.dataUrl);
    }
  };

  const handleSampleCardSelect = async (
    type: 'blank' | 'unclear' | 'borax' | 'ammonia_pos' | 'ammonia_neg'
  ) => {
    const dataUrl = getSampleCardDataUrl(type);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        onCapture(imgData, dataUrl);
      }
    };
    img.src = dataUrl;
  };

  return (
    <div className="relative flex flex-col h-screen w-full bg-black text-white select-none overflow-hidden">
      {/* Camera Preview Video */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Fallback if camera stream is blocked */}
      {!cameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gray-900 z-10">
          <Camera size={48} className="text-gray-400 mb-3" />
          <h3 className="text-lg font-bold mb-1">
            {lang === 'en' ? 'Camera Not Available' : 'Kamera Tidak Tersedia'}
          </h3>
          <p className="text-xs text-gray-400 max-w-xs mb-6">
            {lang === 'en'
              ? 'Please allow camera permission or choose an image from your gallery / test samples below.'
              : 'Izinkan akses kamera atau pilih foto dari galeri / sampel pengujian di bawah ini.'}
          </p>
          <button
            type="button"
            onClick={handleGalleryPick}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-blue text-white font-bold"
          >
            <ImageIcon size={20} />
            <span>{t('s07_gallery_btn', lang)}</span>
          </button>
        </div>
      )}

      {/* Card Guide Overlay (85 : 55 mm aspect ratio) */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 z-20">
        <div className="relative w-full max-w-[340px] aspect-[85/55] border-2 border-white/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
          {/* 4 Corner Markers in the guide frame */}
          <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
          <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />

          {/* Guide Crosshairs */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-0.5 bg-white/40" />
            <div className="h-12 w-0.5 bg-white/40 absolute" />
          </div>

          {/* Slot indicator guide */}
          <div className="absolute left-[42%] top-[54%] w-[18%] h-[18%] border border-dashed border-amber-300 rounded" />
        </div>

        {autoCapturing && (
          <div className="mt-4 px-4 py-1.5 rounded-full bg-amber-500 text-black font-extrabold text-xs shadow-lg animate-bounce">
            {t('s07_auto_capturing', lang)}
          </div>
        )}
      </div>

      {/* Top Header Overlay */}
      <div className="relative z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <button
          type="button"
          onClick={onBack}
          className="p-2.5 rounded-full bg-black/40 text-white backdrop-blur-md active:bg-black/70"
          aria-label={t('btn_back', lang)}
        >
          <ArrowLeft size={22} />
        </button>

        <span className="text-sm font-bold tracking-wide">
          {isAmmoniaMode ? t('s07_ammonia_title', lang) : t('s07_title', lang)}
        </span>

        {hasTorch ? (
          <button
            type="button"
            onClick={toggleTorch}
            className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${
              torchOn ? 'bg-amber-400 text-black' : 'bg-black/40 text-white'
            }`}
            aria-label={t('s07_torch_toggle', lang)}
          >
            {torchOn ? <Zap size={22} /> : <ZapOff size={22} />}
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* Live Quality Chips Bar */}
      <div className="relative z-30 mt-auto pb-2">
        <QualityHints
          markerCount={markerCount}
          distanceOk={distanceOk}
          sharpnessOk={sharpnessOk}
          glareOk={glareOk}
          lang={lang}
        />
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-30 p-5 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
        {/* Sample Card Quick Loaders (Essential for instant testing / demo) */}
        <div className="flex items-center justify-center gap-1.5 mb-4 overflow-x-auto py-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase mr-1">
            {lang === 'en' ? 'Demo Card:' : 'Kartu Tes:'}
          </span>
          <button
            type="button"
            onClick={() => handleSampleCardSelect('blank')}
            className="px-2.5 py-1 rounded-lg bg-white/20 text-xs font-bold hover:bg-white/30 active:scale-95 text-yellow-300"
          >
            0 ○ (Kuning)
          </button>
          <button
            type="button"
            onClick={() => handleSampleCardSelect('unclear')}
            className="px-2.5 py-1 rounded-lg bg-white/20 text-xs font-bold hover:bg-white/30 active:scale-95 text-orange-300"
          >
            1 △ (Jingga)
          </button>
          <button
            type="button"
            onClick={() => handleSampleCardSelect('borax')}
            className="px-2.5 py-1 rounded-lg bg-white/20 text-xs font-bold hover:bg-white/30 active:scale-95 text-red-300"
          >
            2 □ (Merah)
          </button>
          <button
            type="button"
            onClick={() => handleSampleCardSelect(isAmmoniaMode ? 'ammonia_pos' : 'ammonia_pos')}
            className="px-2.5 py-1 rounded-lg bg-white/20 text-xs font-bold hover:bg-white/30 active:scale-95 text-emerald-300"
          >
            B+ ⊗
          </button>
        </div>

        {/* Shutter & Gallery Controls */}
        <div className="flex items-center justify-around max-w-xs mx-auto">
          {/* Gallery Picker */}
          <button
            type="button"
            onClick={handleGalleryPick}
            className="flex flex-col items-center gap-1 p-3 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 min-w-[52px] min-h-[52px]"
            title={t('s07_gallery_btn', lang)}
            aria-label={t('s07_gallery_btn', lang)}
          >
            <ImageIcon size={24} />
          </button>

          {/* Shutter Button */}
          <button
            type="button"
            onClick={handleManualCapture}
            className="relative flex items-center justify-center w-20 h-20 rounded-full border-4 border-white bg-brand-blue shadow-2xl active:scale-90 transition-transform"
            aria-label={t('s07_shutter_btn', lang)}
          >
            <div className="w-14 h-14 rounded-full bg-white/90" />
          </button>

          {/* Quick Refresh */}
          <button
            type="button"
            onClick={() => {
              setMarkerCount(0);
              setDistanceOk(false);
              setSharpnessOk(false);
            }}
            className="flex flex-col items-center gap-1 p-3 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 min-w-[52px] min-h-[52px]"
            title="Muat ulang fokus"
            aria-label="Muat ulang fokus"
          >
            <RefreshCw size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};
