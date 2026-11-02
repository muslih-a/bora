// Platform abstraction layer for BoraScan (Web, Capacitor, Android WebView)

export interface PlatformService {
  vibrate(pattern: number[]): void;
  speak(text: string, lang?: 'id-ID' | 'en-US'): void;
  stopSpeaking(): void;
  requestKeepAwake(): Promise<() => void>;
  pickImage(): Promise<{ file: File; dataUrl: string; imageData: ImageData } | null>;
  pickMultipleImages(): Promise<Array<{ file: File; dataUrl: string; imageData: ImageData }>>;
  shareWhatsAppReport(params: {
    text: string;
    imageBlob?: Blob;
    filename?: string;
  }): Promise<void>;
  saveFile(blob: Blob, filename: string): void;
}

// Helper to convert HTML Image or File to ImageData
export async function fileToImageData(file: File): Promise<{ dataUrl: string; imageData: ImageData }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get 2d context for image conversion'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve({ dataUrl, imageData });
      };
      img.onerror = (err) => reject(err);
      img.src = dataUrl;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// Convert data URL to Blob
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].split(':')[1] || 'image/jpeg';
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: contentType });
}

class WebPlatform implements PlatformService {
  private wakeLockSentinel: any = null;

  vibrate(pattern: number[]): void {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
      // Optional Android native interface bridge
      if (typeof window !== 'undefined' && (window as any).Android?.vibrate) {
        (window as any).Android.vibrate(JSON.stringify(pattern));
      }
    } catch (e) {
      console.warn('Vibration not supported or denied:', e);
    }
  }

  speak(text: string, lang: 'id-ID' | 'en-US' = 'id-ID'): void {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop any pending speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
    }
  }

  stopSpeaking(): void {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      console.warn('Speech synthesis cancel failed:', e);
    }
  }

  async requestKeepAwake(): Promise<() => void> {
    try {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        return () => {
          if (this.wakeLockSentinel) {
            this.wakeLockSentinel.release().catch(() => {});
            this.wakeLockSentinel = null;
          }
        };
      }
    } catch (e) {
      console.warn('Screen wakeLock request failed:', e);
    }
    return () => {};
  }

  async pickImage(): Promise<{ file: File; dataUrl: string; imageData: ImageData } | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        try {
          const res = await fileToImageData(file);
          resolve({ file, ...res });
        } catch (err) {
          console.error('Failed to load image file:', err);
          resolve(null);
        }
      };
      input.click();
    });
  }

  async pickMultipleImages(): Promise<Array<{ file: File; dataUrl: string; imageData: ImageData }>> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.onchange = async () => {
        const files = Array.from(input.files || []);
        if (files.length === 0) {
          resolve([]);
          return;
        }
        const results: Array<{ file: File; dataUrl: string; imageData: ImageData }> = [];
        for (const file of files) {
          try {
            const res = await fileToImageData(file);
            results.push({ file, ...res });
          } catch (e) {
            console.error('Error loading image', file.name, e);
          }
        }
        resolve(results);
      };
      input.click();
    });
  }

  async shareWhatsAppReport(params: {
    text: string;
    imageBlob?: Blob;
    filename?: string;
  }): Promise<void> {
    const { text, imageBlob, filename = 'strip_borascan.jpg' } = params;

    // Check Web Share API with file support first
    if (
      imageBlob &&
      typeof navigator !== 'undefined' &&
      navigator.canShare &&
      navigator.canShare({
        files: [new File([imageBlob], filename, { type: imageBlob.type || 'image/jpeg' })],
      })
    ) {
      try {
        const file = new File([imageBlob], filename, { type: imageBlob.type || 'image/jpeg' });
        await navigator.share({
          title: 'Laporan Dugaan Boraks (BoraScan)',
          text,
          files: [file],
        });
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Web Share failed, falling back to direct WhatsApp link:', err);
        } else {
          return;
        }
      }
    }

    // Direct WhatsApp web/app link to BPOM: +62 811 9181 533 -> 628119181533
    const waUrl = `https://wa.me/628119181533?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  }

  saveFile(blob: Blob, filename: string): void {
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error('Failed to trigger download:', e);
    }
  }
}

export const platform = new WebPlatform();
