import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type DeviceType = 'desktop' | 'foldable' | 'mobile';

export interface DeviceCropConfig {
  id: DeviceType;
  label: string;
  subLabel: string;
  ratio: number;
  ratioText: string;
}

export const DEVICE_CONFIGS: DeviceCropConfig[] = [
  {
    id: 'desktop',
    label: 'Desktop',
    subLabel: 'Widescreen & Laptops (16:9)',
    ratio: 16 / 9,
    ratioText: '16:9',
  },
  {
    id: 'foldable',
    label: 'Foldables & iPads',
    subLabel: 'Tablets & Folded (4:3)',
    ratio: 4 / 3,
    ratioText: '4:3',
  },
  {
    id: 'mobile',
    label: 'Mobile Phones',
    subLabel: 'Smartphones (4:3 Section)',
    ratio: 4 / 3,
    ratioText: '4:3',
  },
];

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ThreeDeviceFiles {
  desktop: File;
  foldable: File;
  mobile: File;
}

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  fileName?: string;
  queueInfo?: { current: number; total: number };
  onClose: () => void;
  onCropComplete: (cropSet: ThreeDeviceFiles) => void;
}

// -------------------------------------------------------------
// Live Pixel-Perfect Canvas Preview for a Device
// -------------------------------------------------------------
const LiveCanvasPreview: React.FC<{
  imageSrc: string;
  crop: CropRect;
  rotation: number;
  aspectRatio: number;
  label: string;
  subLabel: string;
}> = ({ imageSrc, crop, rotation, aspectRatio, label, subLabel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      const isRotated = rotation % 180 !== 0;
      const naturalW = isRotated ? img.naturalHeight : img.naturalWidth;
      const naturalH = isRotated ? img.naturalWidth : img.naturalHeight;

      const rotCanvas = document.createElement('canvas');
      rotCanvas.width = naturalW;
      rotCanvas.height = naturalH;
      const rotCtx = rotCanvas.getContext('2d');
      if (!rotCtx) return;

      rotCtx.save();
      rotCtx.translate(naturalW / 2, naturalH / 2);
      rotCtx.rotate((rotation * Math.PI) / 180);
      rotCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      rotCtx.restore();

      const pixelX = Math.max(0, Math.min(naturalW - 1, Math.round((crop.x / 100) * naturalW)));
      const pixelY = Math.max(0, Math.min(naturalH - 1, Math.round((crop.y / 100) * naturalH)));
      const pixelW = Math.max(1, Math.min(naturalW - pixelX, Math.round((crop.width / 100) * naturalW)));
      const pixelH = Math.max(1, Math.min(naturalH - pixelY, Math.round((crop.height / 100) * naturalH)));

      canvas.width = pixelW;
      canvas.height = pixelH;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, pixelW, pixelH);
      ctx.drawImage(rotCanvas, pixelX, pixelY, pixelW, pixelH, 0, 0, pixelW, pixelH);
    };
  }, [imageSrc, crop, rotation]);

  return (
    <div className="bg-[#141820] border border-white/10 rounded-xl p-2.5 flex flex-col justify-between shadow-lg">
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <span className="text-xs font-bold text-white tracking-wide">{label}</span>
        <span className="text-[10px] text-primary font-mono">{subLabel}</span>
      </div>

      <div
        style={{ aspectRatio }}
        className="w-full relative overflow-hidden bg-black/80 rounded-lg flex items-center justify-center border border-white/5"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain select-none pointer-events-none"
        />
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Main Modal Component
// -------------------------------------------------------------
const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  fileName = 'image.jpg',
  queueInfo,
  onClose,
  onCropComplete,
}) => {
  // Focal Point (Main Center Part): percentages 0 - 100
  const [focalPoint, setFocalPoint] = useState<{ x: number; y: number }>({ x: 50, y: 40 });
  // Framing scale/coverage (how tight or wide to frame the subject): 0.4 to 1.0
  const [framingScale, setFramingScale] = useState<number>(0.85);
  const [rotation, setRotation] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Helper to get image aspect ratio considering rotation
  const getImageRatio = useCallback((): number => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth || !img.naturalHeight) return 1;
    const isRotated = rotation % 180 !== 0;
    const w = isRotated ? img.naturalHeight : img.naturalWidth;
    const h = isRotated ? img.naturalWidth : img.naturalHeight;
    return w / h;
  }, [rotation]);

  // Compute crop rectangle for a target ratio centered around the focal point
  const computeCropForRatio = useCallback(
    (targetRatio: number, focal: { x: number; y: number }, scale: number): CropRect => {
      const imgRatio = getImageRatio();

      let cropW = 90;
      let cropH = 90;

      if (targetRatio >= imgRatio) {
        // Target is wider than image
        cropW = Math.min(100, 100 * scale);
        cropH = (cropW * imgRatio) / targetRatio;
        if (cropH > 100) {
          cropH = 100;
          cropW = (cropH * targetRatio) / imgRatio;
        }
      } else {
        // Target is taller than image
        cropH = Math.min(100, 100 * scale);
        cropW = (cropH * targetRatio) / imgRatio;
        if (cropW > 100) {
          cropW = 100;
          cropH = (cropW * imgRatio) / targetRatio;
        }
      }

      // Position centered at focalPoint
      const x0 = focal.x - cropW / 2;
      const y0 = focal.y - cropH / 2;

      // Clamp to boundaries [0, 100]
      const clampedX = Math.max(0, Math.min(100 - cropW, x0));
      const clampedY = Math.max(0, Math.min(100 - cropH, y0));

      return {
        x: clampedX,
        y: clampedY,
        width: cropW,
        height: cropH,
      };
    },
    [getImageRatio]
  );

  // Current Crops for all 3 devices auto-calculated in real time
  const desktopCrop = computeCropForRatio(16 / 9, focalPoint, framingScale);
  const foldableCrop = computeCropForRatio(4 / 3, focalPoint, framingScale);
  const mobileCrop = computeCropForRatio(4 / 3, focalPoint, framingScale);

  useEffect(() => {
    if (isOpen) {
      setRotation(0);
      setIsProcessing(false);
      setFocalPoint({ x: 50, y: 40 });
      setFramingScale(0.85);
    }
  }, [isOpen, imageSrc]);

  // Dragging or clicking on the image to set the Main Center Part
  const handlePointerSetFocal = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const updatePoint = (clientX: number, clientY: number) => {
      const newX = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
      const newY = Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100));
      setFocalPoint({ x: newX, y: newY });
    };

    updatePoint(e.clientX, e.clientY);

    const onPointerMove = (moveEv: PointerEvent) => {
      updatePoint(moveEv.clientX, moveEv.clientY);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Render crop slice to File using offscreen canvas
  const renderCropToFile = (
    cropRect: CropRect,
    deviceTag: DeviceType,
    rotCanvas: HTMLCanvasElement,
    naturalW: number,
    naturalH: number
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      try {
        const pixelX = Math.max(0, Math.min(naturalW - 1, Math.round((cropRect.x / 100) * naturalW)));
        const pixelY = Math.max(0, Math.min(naturalH - 1, Math.round((cropRect.y / 100) * naturalH)));
        const pixelW = Math.max(1, Math.min(naturalW - pixelX, Math.round((cropRect.width / 100) * naturalW)));
        const pixelH = Math.max(1, Math.min(naturalH - pixelY, Math.round((cropRect.height / 100) * naturalH)));

        const canvas = document.createElement('canvas');
        canvas.width = pixelW;
        canvas.height = pixelH;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D context unavailable');

        ctx.drawImage(rotCanvas, pixelX, pixelY, pixelW, pixelH, 0, 0, pixelW, pixelH);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error(`Failed to export crop for ${deviceTag}`));
            const baseName = fileName.replace(/\.[^/.]+$/, '');
            const file = new File([blob], `${baseName}_${deviceTag}.jpg`, { type: 'image/jpeg' });
            resolve(file);
          },
          'image/jpeg',
          0.93
        );
      } catch (err) {
        reject(err);
      }
    });
  };

  // Save all 3 auto-adjusted device crops
  const handleSaveAll = async () => {
    const img = imgRef.current;
    if (!img) return;

    setIsProcessing(true);

    try {
      const rotCanvas = document.createElement('canvas');
      const rotCtx = rotCanvas.getContext('2d');
      if (!rotCtx) throw new Error('Could not create rotation canvas');

      const isRotated90or270 = rotation % 180 !== 0;
      const naturalW = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
      const naturalH = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

      rotCanvas.width = naturalW;
      rotCanvas.height = naturalH;

      rotCtx.save();
      rotCtx.translate(naturalW / 2, naturalH / 2);
      rotCtx.rotate((rotation * Math.PI) / 180);
      rotCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      rotCtx.restore();

      const [desktopFile, foldableFile, mobileFile] = await Promise.all([
        renderCropToFile(desktopCrop, 'desktop', rotCanvas, naturalW, naturalH),
        renderCropToFile(foldableCrop, 'foldable', rotCanvas, naturalW, naturalH),
        renderCropToFile(mobileCrop, 'mobile', rotCanvas, naturalW, naturalH),
      ]);

      setIsProcessing(false);
      onCropComplete({
        desktop: desktopFile,
        foldable: foldableFile,
        mobile: mobileFile,
      });
    } catch (err) {
      console.error('Save error:', err);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-[#121418] text-[#E8E6E3] w-full max-w-6xl rounded-2xl shadow-2xl border border-white/10 flex flex-col max-h-[96vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-white/10 flex justify-between items-center bg-[#181B21]">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider text-white">
                  Smart Subject Focus & Auto-Adjust
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Auto-Fits All Devices
                </span>
                {queueInfo && queueInfo.total > 1 && (
                  <span className="px-2 py-0.5 rounded bg-white/10 text-neutral-300 text-xs">
                    File {queueInfo.current} / {queueInfo.total}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Click or drag the <span className="text-primary font-semibold">center focus target</span> on the main part of the image. All devices auto-adjust to frame it perfectly.
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer text-sm font-semibold"
            >
              Close
            </button>
          </div>

          {/* Main Workspace (Left: Interactive Image with Focal Target; Right: Auto-Adjusted Device Previews) */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden bg-black/95">
            {/* Left: Source Image + Draggable Focal Target */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-3 sm:p-5 overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 min-h-[300px]">
              <div
                ref={containerRef}
                onPointerDown={handlePointerSetFocal}
                className="relative inline-block max-w-full max-h-[50vh] select-none touch-none cursor-crosshair rounded-xl overflow-hidden shadow-2xl border border-white/10 group"
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Focus Target Image"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease',
                    maxHeight: '50vh',
                    maxWidth: '100%',
                    display: 'block',
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                  className="object-contain"
                />

                {/* Desktop Framing Outline Guide (Subtle blue) */}
                <div
                  className="absolute border border-blue-400/50 pointer-events-none rounded transition-all duration-75"
                  style={{
                    left: `${desktopCrop.x}%`,
                    top: `${desktopCrop.y}%`,
                    width: `${desktopCrop.width}%`,
                    height: `${desktopCrop.height}%`,
                  }}
                >
                  <span className="absolute top-1 left-1.5 text-[9px] font-mono font-bold uppercase text-blue-300 bg-black/75 px-1 rounded">
                    Desktop (16:9)
                  </span>
                </div>

                {/* Mobile & Tablet Framing Outline Guide (Primary Gold) */}
                <div
                  className="absolute border-2 border-primary/80 pointer-events-none rounded transition-all duration-75"
                  style={{
                    left: `${mobileCrop.x}%`,
                    top: `${mobileCrop.y}%`,
                    width: `${mobileCrop.width}%`,
                    height: `${mobileCrop.height}%`,
                  }}
                >
                  <span className="absolute bottom-1 right-1.5 text-[9px] font-mono font-bold uppercase text-primary bg-black/75 px-1 rounded">
                    Mobile & Tablet (4:3)
                  </span>
                </div>

                {/* Draggable Focal Center Target Reticle */}
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center transition-all duration-75"
                  style={{
                    left: `${focalPoint.x}%`,
                    top: `${focalPoint.y}%`,
                  }}
                >
                  {/* Glowing Reticle Rings */}
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-35" />
                    <div className="w-10 h-10 rounded-full border-2 border-primary bg-primary/20 backdrop-blur-sm flex items-center justify-center shadow-[0_0_15px_rgba(200,160,93,0.6)]">
                      <div className="w-2.5 h-2.5 bg-white rounded-full shadow-md" />
                    </div>
                    {/* Crosshair lines */}
                    <div className="absolute w-14 h-0.5 bg-primary/70" />
                    <div className="absolute h-14 w-0.5 bg-primary/70" />
                  </div>

                  <span className="mt-1 px-2 py-0.5 rounded-full bg-black/85 text-[10px] font-bold font-mono tracking-wider text-white border border-primary/40 shadow-lg whitespace-nowrap">
                    MAIN CENTER PART
                  </span>
                </div>
              </div>

              <div className="mt-2 text-xs text-neutral-400 text-center">
                Click or drag anywhere on the photo to set the main subject center
              </div>
            </div>

            {/* Right: Live 3-Device Auto-Adjust Previews */}
            <div className="w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 bg-[#0E1014] p-3 sm:p-4 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
                  <div className="text-xs font-bold text-white uppercase tracking-wider">
                    Live Auto-Adjusted Previews
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Centered on Subject</span>
                </div>

                {/* Framing Scale / Zoom Slider */}
                <div className="bg-[#141820] border border-white/10 rounded-xl p-3 mb-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-neutral-200">Subject Framing Size:</span>
                    <span className="text-primary font-mono font-bold">{Math.round(framingScale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.05"
                    value={framingScale}
                    onChange={(e) => setFramingScale(parseFloat(e.target.value))}
                    className="w-full accent-primary cursor-pointer h-1.5 bg-neutral-700 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                    <span>Closer Crop</span>
                    <span>Wider View</span>
                  </div>
                </div>

                {/* 3 Live Previews (Desktop, Tablet, Mobile) */}
                <div className="flex flex-col gap-2.5">
                  {/* 1. Desktop */}
                  <LiveCanvasPreview
                    imageSrc={imageSrc}
                    crop={desktopCrop}
                    rotation={rotation}
                    aspectRatio={16 / 9}
                    label="Desktop Monitor"
                    subLabel="16:9 Widescreen"
                  />

                  {/* 2. Foldables & iPads */}
                  <LiveCanvasPreview
                    imageSrc={imageSrc}
                    crop={foldableCrop}
                    rotation={rotation}
                    aspectRatio={4 / 3}
                    label="Foldables & iPads"
                    subLabel="4:3 Tablet"
                  />

                  {/* 3. Mobile Phones */}
                  <LiveCanvasPreview
                    imageSrc={imageSrc}
                    crop={mobileCrop}
                    rotation={rotation}
                    aspectRatio={4 / 3}
                    label="Mobile Phones"
                    subLabel="4:3 Mobile Section"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tools Bar */}
          <div className="px-3 sm:px-4 py-2.5 bg-[#15181E] border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-300 hover:text-white transition-colors border border-white/5 cursor-pointer text-xs font-medium"
              >
                Rotate 90°
              </button>

              <button
                type="button"
                onClick={() => setFocalPoint({ x: 50, y: 50 })}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-300 hover:text-white transition-colors border border-white/5 cursor-pointer text-xs font-medium"
              >
                Reset Center (50%, 50%)
              </button>

              <button
                type="button"
                onClick={() => setFramingScale(0.85)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-300 hover:text-white transition-colors border border-white/5 cursor-pointer text-xs font-medium"
              >
                Reset Zoom (85%)
              </button>
            </div>

            <div className="text-neutral-400 text-xs hidden sm:block">
              Main center part locked • All 3 screen formats auto-adjust to it
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-3 sm:p-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#181B21]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs sm:text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg bg-primary hover:opacity-90 text-on-primary shadow-primary/30 cursor-pointer flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Auto-Adjusting & Saving...</span>
                </>
              ) : (
                <span>Save & Apply to All Devices</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ImageCropperModal;
