# BoraScan – Offline Borax Test Strip Screening Mobile App

BoraScan is an offline smartphone application that reads a borax test strip (BoraNata curcumin strip) from a photo of a printed 85 × 55 mm calibration card. It executes all computer vision algorithms, perspective rectification, and color correction on-device with **zero network dependencies and zero AI/cloud server calls**.

---

## Key Features

1. **100% Offline & Private:** No external network requests, no GPS or location tracking, no seller name collection.
2. **WCAG 2.2 SC 1.4.1 Compliant Results:** Color is never the only signal. Every result is communicated through **Code + Symbol + CSS Pattern + Text + TTS Speech + Haptic Vibration** using the Okabe–Ito color palette.
3. **Automated Optical Calibration:** Detects 4 ArUco markers (`ARUCO_MIP_36h12`), computes perspective homography via Normalized DLT, warps into canonical 850 × 550 px canvas, fits a 3 × 3 color correction matrix $M$ via least-squares over 6 reference patches, and converts to CIELAB coordinates.
4. **Two-Stage Screening & Ammonia Confirmation:**
   - **Stage 1 (10-minute reaction):** Categorizes test pad into 0 (○), 1 (△), or 2 (□).
   - **Stage 2 (Ammonia confirmation):** If 1 or 2 is detected, applying 1 drop of dilute ammonia separates borax ($B+ \otimes$ greenish-black, $\Delta L^* \le dL$ and $a^* \le a_{max}$) from food alkalinity ($B- \ominus$).
5. **Direct BPOM WhatsApp Reporting:** Pre-fills official HaloBPOM complaint template (`+62 811 9181 533`) with attached strip photo.
6. **Research Mode:** Batch analysis of multiple laboratory photos, CSV export, and batch QR code generator via linear regression ($A_G$ vs. % concentration).

---

## Result Categories (Okabe–Ito & WCAG)

| Code | Symbol | Pattern | Colour | Bahasa Indonesia | English | Vibration (ms) |
|---|---|---|---|---|---|---|
| **0** | ○ | Plain | Blue `#0072B2` | Boraks tidak terdeteksi | No borax detected | `[120]` |
| **1** | △ | Dots | Orange `#E69F00` | Belum jelas – lakukan tes amonia | Unclear – do the ammonia step | `[120, 120, 120]` |
| **2** | □ | Stripes | Vermillion `#D55E00` | Boraks terdeteksi – lakukan tes amonia | Borax detected – do the ammonia step | `[120, 120, 120]` |
| **B+** | ⊗ | Cross-hatch | Black `#1D1D1B` | Boraks terkonfirmasi – jangan dimakan, laporkan | Borax confirmed – do not eat, report it | `[600, 200, 600, 200, 600]` |
| **B−** | ⊖ | Diagonal stripes | Sky Blue `#56B4E9` | Bukan boraks – makanan hanya bersifat basa | Not borax – food is only alkaline | `[600]` |

---

## How to Run

### Web Development
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run unit tests
npm test

# Build production bundle for Android WebView / Capacitor
npm run build
```

### Android APK Build
The project is configured for Android Gradle compilation. The web bundle is packaged into `app/src/main/assets/web/` and loaded in `MainActivity.kt`.

To compile the Android applet:
```bash
gradle assembleDebug
```

---

## Calibration Constants & Tuning Parameters

All algorithm constants are centralized in `src/core/config.ts`:

| Parameter | Default Value | Description | Real-World Tuning Guidance |
|---|---|---|---|
| `BLUR_MIN` | `60` | Minimum variance of Laplacian for sharpness | Lower to `40–50` in low-light environments if acceptable edges are rejected. |
| `MIN_MARKER_SIDE_PX` | `40` | Minimum marker side in pixels | Increase if phone should be brought closer (15–20 cm). |
| `GLARE_MAX_PCT` | `0.02` (2%) | Max fraction of saturated pixels ($\ge 250$) | Adjust if glossy card lamination creates specular reflections. |
| `EXPOSURE_W_MEAN_G_MIN` | `90` | Minimum green channel on White patch | Increase if underexposed images cause dark signal skew. |
| `EXPOSURE_W_MEAN_G_MAX` | `250` | Maximum green channel on White patch | Decrease if white patch clips near 255. |
| `PAD_DELTA_E_MIN` | `12` | Minimum $\Delta E_{76}$ between Pad and White | Pad missing check: blank yellow pad typically has $\Delta E \approx 40$ from white. |
| `PAD_SD_G_MAX` | `18` | Standard deviation of Green in pad ROI | Uneven pad check: wrinkled or folded pad increases SD. |
| `dL` | `-10` | Maximum change in $L^*$ after ammonia | Borax causes substantial darkening ($\Delta L^* \le -10$). |
| `aMax` | `5` | Maximum $a^*$ (redness) after ammonia | Alkaline foods without borax retain yellow-red tone ($a^* > 5$). |
