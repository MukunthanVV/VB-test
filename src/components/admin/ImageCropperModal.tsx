import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type AspectRatioOption = {
  label: string;
  category: 'Desktop' | 'Foldable' | 'Mobile' | 'Free';
  ratio: number | null; // width / height, or null for freeform
  iconName?: string;
  description: string;
};

export const CROP_PRESETS: AspectRatioOption[] = [
  { label: '16:9 Desktop', category: 'Desktop', ratio: 16 / 9, description: 'Widescreen hero & banner' },
  { label: '3:2 Landscape', category: 'Desktop', ratio: 3 / 2, description: 'Standard desktop card' },
  { label: '4:3 Foldable', category: 'Foldable', ratio: 4 / 3, description: 'Unfolded foldables & iPads' },
  { label: '1:1 Square', category: 'Foldable', ratio: 1, description: 'Universal square for cards' },
  { label: '4:5 Mobile', category: 'Mobile', ratio: 4 / 5, description: 'Smartphones & vertical feeds' },
  { label: '9:16 Full Mobile', category: 'Mobile', ratio: 9 / 16, description: 'Full-screen mobile story' },
  { label: 'Custom Free', category: 'Free', ratio: null, description: 'Drag to any custom shape' },
];

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  fileName?: string;
  queueInfo?: { current: number; total: number };
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
  onSkipCrop: () => void;
}

interface CropRect {
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  width: number; // percentage (0 - 100)
  height: number; // percentage (0 - 100)
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  fileName = 'cropped-image.jpg',
  queueInfo,
  onClose,
  onCropComplete,
  onSkipCrop,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<AspectRatioOption>(CROP_PRESETS[0]);
  const [rotation, setRotation] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Normalized crop rectangle (0 to 100%)
  const [crop, setCrop] = useState<CropRect>({ x: 5, y: 5, width: 90, height: 90 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Interaction tracking state
  const dragRef = useRef<{
    isDragging: boolean;
    dragType: 'move' | 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r' | null;
    startX: number;
    startY: number;
    startCrop: CropRect;
  }>({
    isDragging: false,
    dragType: null,
    startX: 0,
    startY: 0,
    startCrop: { x: 0, y: 0, width: 0, height: 0 },
  });

  // Calculate crop rectangle based on image aspect ratio and chosen preset
  const applyPreset = useCallback(
    (preset: AspectRatioOption) => {
      setSelectedPreset(preset);
      const img = imgRef.current;
      if (!img || !img.naturalWidth || !img.naturalHeight) return;

      const imgWidth = rotation % 180 === 0 ? img.naturalWidth : img.naturalHeight;
      const imgHeight = rotation % 180 === 0 ? img.naturalHeight : img.naturalWidth;
      const imgRatio = imgWidth / imgHeight;

      if (!preset.ratio) {
        // Freeform default
        setCrop({ x: 5, y: 5, width: 90, height: 90 });
        return;
      }

      const targetRatio = preset.ratio;
      let newW = 90;
      let newH = 90;

      if (targetRatio > imgRatio) {
        // Target is wider than image
        newW = 92;
        newH = (newW * imgRatio) / targetRatio;
      } else {
        // Target is taller than image
        newH = 92;
        newW = (newH * targetRatio) / imgRatio;
      }

      // Ensure within bounds
      newW = Math.min(newW, 96);
      newH = Math.min(newH, 96);

      const newX = (100 - newW) / 2;
      const newY = (100 - newH) / 2;

      setCrop({ x: newX, y: newY, width: newW, height: newH });
    },
    [rotation]
  );

  // On image load, initialize crop
  const handleImageLoaded = () => {
    applyPreset(selectedPreset);
  };

  useEffect(() => {
    if (isOpen) {
      setRotation(0);
      setZoom(1);
      setIsProcessing(false);
      // Re-apply preset once image element updates
      setTimeout(() => applyPreset(selectedPreset), 50);
    }
  }, [isOpen, imageSrc]);

  // Pointer drag handler for crop box & handles
  const handlePointerDown = (
    e: React.PointerEvent,
    type: 'move' | 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    dragRef.current = {
      isDragging: true,
      dragType: type,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...crop },
    };

    const target = e.currentTarget;
    if (target.setPointerCapture) {
      target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const deltaX = ((e.clientX - dragRef.current.startX) / rect.width) * 100;
    const deltaY = ((e.clientY - dragRef.current.startY) / rect.height) * 100;
    const { startCrop, dragType } = dragRef.current;

    setCrop(() => {
      let next = { ...startCrop };
      const ratio = selectedPreset.ratio;
      const img = imgRef.current;
      const imgRatio =
        img && img.naturalWidth && img.naturalHeight
          ? (rotation % 180 === 0 ? img.naturalWidth : img.naturalHeight) /
            (rotation % 180 === 0 ? img.naturalHeight : img.naturalWidth)
          : 1;

      if (dragType === 'move') {
        next.x = Math.max(0, Math.min(100 - startCrop.width, startCrop.x + deltaX));
        next.y = Math.max(0, Math.min(100 - startCrop.height, startCrop.y + deltaY));
        return next;
      }

      // Handle corner and edge adjustments
      if (dragType === 'br') {
        let newW = Math.max(10, Math.min(100 - startCrop.x, startCrop.width + deltaX));
        let newH = Math.max(10, Math.min(100 - startCrop.y, startCrop.height + deltaY));
        if (ratio) {
          newH = (newW * imgRatio) / ratio;
          if (startCrop.y + newH > 100) {
            newH = 100 - startCrop.y;
            newW = (newH * ratio) / imgRatio;
          }
        }
        next.width = newW;
        next.height = newH;
      } else if (dragType === 'bl') {
        let newW = Math.max(10, startCrop.width - deltaX);
        let newX = startCrop.x + (startCrop.width - newW);
        let newH = Math.max(10, Math.min(100 - startCrop.y, startCrop.height + deltaY));

        if (ratio) {
          newH = (newW * imgRatio) / ratio;
          if (startCrop.y + newH > 100) {
            newH = 100 - startCrop.y;
            newW = (newH * ratio) / imgRatio;
            newX = startCrop.x + (startCrop.width - newW);
          }
        }
        if (newX >= 0) {
          next.x = newX;
          next.width = newW;
          next.height = newH;
        }
      } else if (dragType === 'tr') {
        let newW = Math.max(10, Math.min(100 - startCrop.x, startCrop.width + deltaX));
        let newH = Math.max(10, startCrop.height - deltaY);
        let newY = startCrop.y + (startCrop.height - newH);

        if (ratio) {
          newH = (newW * imgRatio) / ratio;
          newY = startCrop.y + (startCrop.height - newH);
          if (newY < 0) {
            newY = 0;
            newH = startCrop.y + startCrop.height;
            newW = (newH * ratio) / imgRatio;
          }
        }
        if (newY >= 0) {
          next.y = newY;
          next.width = newW;
          next.height = newH;
        }
      } else if (dragType === 'tl') {
        let newW = Math.max(10, startCrop.width - deltaX);
        let newX = startCrop.x + (startCrop.width - newW);
        let newH = Math.max(10, startCrop.height - deltaY);
        let newY = startCrop.y + (startCrop.height - newH);

        if (ratio) {
          newH = (newW * imgRatio) / ratio;
          newY = startCrop.y + (startCrop.height - newH);
          newX = startCrop.x + (startCrop.width - newW);
          if (newY < 0 || newX < 0) {
            return startCrop;
          }
        }
        if (newX >= 0 && newY >= 0) {
          next.x = newX;
          next.y = newY;
          next.width = newW;
          next.height = newH;
        }
      } else if (dragType === 't') {
        const newH = Math.max(10, startCrop.height - deltaY);
        const newY = startCrop.y + (startCrop.height - newH);
        if (newY >= 0) {
          next.y = newY;
          next.height = newH;
        }
      } else if (dragType === 'b') {
        next.height = Math.max(10, Math.min(100 - startCrop.y, startCrop.height + deltaY));
      } else if (dragType === 'l') {
        const newW = Math.max(10, startCrop.width - deltaX);
        const newX = startCrop.x + (startCrop.width - newW);
        if (newX >= 0) {
          next.x = newX;
          next.width = newW;
        }
      } else if (dragType === 'r') {
        next.width = Math.max(10, Math.min(100 - startCrop.x, startCrop.width + deltaX));
      }

      // Clamp dimensions
      next.x = Math.max(0, Math.min(100 - next.width, next.x));
      next.y = Math.max(0, Math.min(100 - next.height, next.y));
      return next;
    });
  };

  const handlePointerUp = () => {
    dragRef.current.isDragging = false;
    dragRef.current.dragType = null;
  };

  // Perform the actual crop on offscreen canvas
  const handlePerformCrop = async () => {
    const img = imgRef.current;
    if (!img) return;

    setIsProcessing(true);

    try {
      // 1. Create offscreen canvas for rotation
      const rotCanvas = document.createElement('canvas');
      const rotCtx = rotCanvas.getContext('2d');
      if (!rotCtx) throw new Error('Could not initialize canvas context');

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

      // 2. Calculate crop in source pixels
      const pixelX = Math.round((crop.x / 100) * naturalW);
      const pixelY = Math.round((crop.y / 100) * naturalH);
      const pixelW = Math.round((crop.width / 100) * naturalW);
      const pixelH = Math.round((crop.height / 100) * naturalH);

      // 3. Create final canvas
      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = pixelW;
      cropCanvas.height = pixelH;
      const cropCtx = cropCanvas.getContext('2d');
      if (!cropCtx) throw new Error('Could not initialize crop canvas context');

      cropCtx.drawImage(rotCanvas, pixelX, pixelY, pixelW, pixelH, 0, 0, pixelW, pixelH);

      // 4. Export as Blob and File
      cropCanvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsProcessing(false);
            return;
          }
          const baseName = fileName.replace(/\.[^/.]+$/, '');
          const croppedFile = new File([blob], `${baseName}-cropped.jpg`, { type: 'image/jpeg' });
          setIsProcessing(false);
          onCropComplete(croppedFile);
        },
        'image/jpeg',
        0.95
      );
    } catch (err) {
      console.error('Cropping failed:', err);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="bg-[#14171C] text-[#E8E6E3] w-full max-w-4xl rounded-2xl shadow-2xl border border-white/10 flex flex-col max-h-[96vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex justify-between items-center bg-[#1A1E24]">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-base sm:text-lg font-bold font-display uppercase tracking-wide text-white">
                  Crop & Frame Image
                </h3>
                {queueInfo && queueInfo.total > 1 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-white tracking-wider">
                    {queueInfo.current} / {queueInfo.total}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Optimize framing for Desktop, Mobile & Foldables
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              title="Close without saving"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Preset Buttons Bar */}
          <div className="px-4 py-3 bg-[#111317] border-b border-white/5 overflow-x-auto flex items-center gap-2 scrollbar-none">
            <span className="text-xs uppercase font-semibold text-neutral-400 tracking-wider mr-1 whitespace-nowrap">
              Presets:
            </span>
            {CROP_PRESETS.map((preset) => {
              const isActive = selectedPreset.label === preset.label;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/30 ring-1 ring-white/20'
                      : 'bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                  title={preset.description}
                >
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Cropping Viewport */}
          <div
            className="flex-1 relative bg-black/90 flex items-center justify-center p-4 sm:p-6 overflow-hidden min-h-[300px] sm:min-h-[440px]"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div
              ref={containerRef}
              className="relative inline-block max-w-full max-h-[55vh] select-none touch-none"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={handleImageLoaded}
                style={{
                  transform: `rotate(${rotation}deg) scale(${zoom})`,
                  transition: 'transform 0.2s ease',
                  maxHeight: '55vh',
                  maxWidth: '100%',
                  display: 'block',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
                className="rounded shadow-inner object-contain"
              />

              {/* Darkened Mask Over Entire Image */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Top mask */}
                <div
                  className="absolute left-0 right-0 top-0 bg-black/65 backdrop-blur-[1px]"
                  style={{ height: `${crop.y}%` }}
                />
                {/* Bottom mask */}
                <div
                  className="absolute left-0 right-0 bottom-0 bg-black/65 backdrop-blur-[1px]"
                  style={{ height: `${100 - (crop.y + crop.height)}%` }}
                />
                {/* Left mask */}
                <div
                  className="absolute left-0 bg-black/65 backdrop-blur-[1px]"
                  style={{
                    top: `${crop.y}%`,
                    height: `${crop.height}%`,
                    width: `${crop.x}%`,
                  }}
                />
                {/* Right mask */}
                <div
                  className="absolute right-0 bg-black/65 backdrop-blur-[1px]"
                  style={{
                    top: `${crop.y}%`,
                    height: `${crop.height}%`,
                    width: `${100 - (crop.x + crop.width)}%`,
                  }}
                />
              </div>

              {/* Active Draggable Crop Box */}
              <div
                className="absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)] cursor-move touch-none"
                style={{
                  left: `${crop.x}%`,
                  top: `${crop.y}%`,
                  width: `${crop.width}%`,
                  height: `${crop.height}%`,
                }}
                onPointerDown={(e) => handlePointerDown(e, 'move')}
              >
                {/* Rule of Thirds Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                  <div className="border-r border-b border-white/60" />
                  <div className="border-r border-b border-white/60" />
                  <div className="border-b border-white/60" />
                  <div className="border-r border-b border-white/60" />
                  <div className="border-r border-b border-white/60" />
                  <div className="border-b border-white/60" />
                  <div className="border-r border-white/60" />
                  <div className="border-r border-white/60" />
                  <div />
                </div>

                {/* Corner Drag Handles */}
                <div
                  className="absolute -top-2 -left-2 w-5 h-5 bg-white border-2 border-[#14171C] rounded-sm cursor-nwse-resize shadow-md"
                  onPointerDown={(e) => handlePointerDown(e, 'tl')}
                />
                <div
                  className="absolute -top-2 -right-2 w-5 h-5 bg-white border-2 border-[#14171C] rounded-sm cursor-nesw-resize shadow-md"
                  onPointerDown={(e) => handlePointerDown(e, 'tr')}
                />
                <div
                  className="absolute -bottom-2 -left-2 w-5 h-5 bg-white border-2 border-[#14171C] rounded-sm cursor-nesw-resize shadow-md"
                  onPointerDown={(e) => handlePointerDown(e, 'bl')}
                />
                <div
                  className="absolute -bottom-2 -right-2 w-5 h-5 bg-white border-2 border-[#14171C] rounded-sm cursor-nwse-resize shadow-md"
                  onPointerDown={(e) => handlePointerDown(e, 'br')}
                />

                {/* Edge Drag Handles */}
                <div
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/90 border border-[#14171C] rounded-sm cursor-ns-resize shadow"
                  onPointerDown={(e) => handlePointerDown(e, 't')}
                />
                <div
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/90 border border-[#14171C] rounded-sm cursor-ns-resize shadow"
                  onPointerDown={(e) => handlePointerDown(e, 'b')}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 -left-1.5 h-8 w-3 bg-white/90 border border-[#14171C] rounded-sm cursor-ew-resize shadow"
                  onPointerDown={(e) => handlePointerDown(e, 'l')}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 -right-1.5 h-8 w-3 bg-white/90 border border-[#14171C] rounded-sm cursor-ew-resize shadow"
                  onPointerDown={(e) => handlePointerDown(e, 'r')}
                />

                {/* Live Aspect Ratio Overlay Tag */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-mono uppercase text-white pointer-events-none tracking-wider">
                  {selectedPreset.label}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Adjustment Tools (Rotate, Reset) */}
          <div className="px-4 py-2.5 bg-[#171A20] border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors border border-white/5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Rotate 90°</span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(selectedPreset)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors border border-white/5"
              >
                <span>Center & Reset</span>
              </button>
            </div>

            <div className="text-neutral-400 text-xs hidden sm:block">
              Drag inside the box to reposition • Drag edges to resize
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#1A1E24]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs sm:text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onSkipCrop}
                className="px-4 py-2 rounded-xl border border-white/15 text-neutral-200 hover:text-white text-xs sm:text-sm font-medium hover:bg-white/5 transition-colors"
                title="Upload original uncropped photo"
              >
                Upload Original (Skip Crop)
              </button>

              <button
                type="button"
                onClick={handlePerformCrop}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-primary hover:opacity-95 text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Cropping...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Crop & Upload</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ImageCropperModal;
