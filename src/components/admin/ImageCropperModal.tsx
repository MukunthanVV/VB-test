import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type DeviceType = 'desktop' | 'foldable' | 'mobile';

export interface DeviceCropConfig {
  id: DeviceType;
  label: string;
  subLabel: string;
  ratio: number; // width / height
  ratioText: string;
  icon: string;
  description: string;
}

export const DEVICE_CONFIGS: DeviceCropConfig[] = [
  {
    id: 'desktop',
    label: 'Desktop',
    subLabel: 'Widescreen & Laptops',
    ratio: 16 / 9,
    ratioText: '16:9',
    icon: 'desktop_windows',
    description: 'Hero banners and desktop screens (1024px+)',
  },
  {
    id: 'foldable',
    label: 'Foldables & iPads',
    subLabel: 'Tablets & Folded/Unfolded',
    ratio: 4 / 3,
    ratioText: '4:3',
    icon: 'devices_fold',
    description: 'Galaxy Fold, Pixel Fold & iPads (641px - 1024px)',
  },
  {
    id: 'mobile',
    label: 'Mobile Phones',
    subLabel: 'Smartphones Portrait',
    ratio: 9 / 16,
    ratioText: '9:16',
    icon: 'smartphone',
    description: 'Vertical mobile screens (up to 640px)',
  },
];

export interface CropRect {
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  width: number; // percentage (0 - 100)
  height: number; // percentage (0 - 100)
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

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  fileName = 'image.jpg',
  queueInfo,
  onClose,
  onCropComplete,
}) => {
  const [activeDevice, setActiveDevice] = useState<DeviceType>('desktop');
  const [rotation, setRotation] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Store crop coordinates for all 3 devices
  const [crops, setCrops] = useState<Record<DeviceType, CropRect>>({
    desktop: { x: 5, y: 15, width: 90, height: 50.6 },
    foldable: { x: 10, y: 10, width: 80, height: 60 },
    mobile: { x: 25, y: 5, width: 50, height: 88.8 },
  });

  // Track whether each device has been viewed/confirmed
  const [confirmed, setConfirmed] = useState<Record<DeviceType, boolean>>({
    desktop: true, // initial active is desktop
    foldable: false,
    mobile: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Dragging tracker
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

  const currentConfig = DEVICE_CONFIGS.find((c) => c.id === activeDevice)!;
  const currentCrop = crops[activeDevice];

  // Calculate default crop for a specific device ratio
  const calculateDefaultCropForRatio = useCallback(
    (targetRatio: number): CropRect => {
      const img = imgRef.current;
      if (!img || !img.naturalWidth || !img.naturalHeight) {
        return { x: 5, y: 5, width: 90, height: 90 };
      }

      const imgWidth = rotation % 180 === 0 ? img.naturalWidth : img.naturalHeight;
      const imgHeight = rotation % 180 === 0 ? img.naturalHeight : img.naturalWidth;
      const imgRatio = imgWidth / imgHeight;

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

      newW = Math.min(newW, 96);
      newH = Math.min(newH, 96);

      const newX = (100 - newW) / 2;
      const newY = (100 - newH) / 2;

      return { x: newX, y: newY, width: newW, height: newH };
    },
    [rotation]
  );

  // Initialize all 3 crops when image loads
  const handleImageLoaded = () => {
    const desktopCrop = calculateDefaultCropForRatio(16 / 9);
    const foldableCrop = calculateDefaultCropForRatio(4 / 3);
    const mobileCrop = calculateDefaultCropForRatio(9 / 16);

    setCrops({
      desktop: desktopCrop,
      foldable: foldableCrop,
      mobile: mobileCrop,
    });
  };

  useEffect(() => {
    if (isOpen) {
      setRotation(0);
      setIsProcessing(false);
      setActiveDevice('desktop');
      setConfirmed({
        desktop: true,
        foldable: false,
        mobile: false,
      });
      setTimeout(() => {
        handleImageLoaded();
      }, 50);
    }
  }, [isOpen, imageSrc]);

  // Pointer drag events for crop handles and movement
  const handlePointerDown = (
    e: React.PointerEvent,
    type: 'move' | 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Mark current device as adjusted/confirmed
    setConfirmed((prev) => ({ ...prev, [activeDevice]: true }));

    dragRef.current = {
      isDragging: true,
      dragType: type,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...currentCrop },
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

    setCrops((prevCrops) => {
      let next = { ...startCrop };
      const ratio = currentConfig.ratio;
      const img = imgRef.current;
      const imgRatio =
        img && img.naturalWidth && img.naturalHeight
          ? (rotation % 180 === 0 ? img.naturalWidth : img.naturalHeight) /
            (rotation % 180 === 0 ? img.naturalHeight : img.naturalWidth)
          : 1;

      if (dragType === 'move') {
        next.x = Math.max(0, Math.min(100 - startCrop.width, startCrop.x + deltaX));
        next.y = Math.max(0, Math.min(100 - startCrop.height, startCrop.y + deltaY));
      } else if (dragType === 'br') {
        let newW = Math.max(10, Math.min(100 - startCrop.x, startCrop.width + deltaX));
        let newH = (newW * imgRatio) / ratio;
        if (startCrop.y + newH > 100) {
          newH = 100 - startCrop.y;
          newW = (newH * ratio) / imgRatio;
        }
        next.width = newW;
        next.height = newH;
      } else if (dragType === 'bl') {
        let newW = Math.max(10, startCrop.width - deltaX);
        let newX = startCrop.x + (startCrop.width - newW);
        let newH = (newW * imgRatio) / ratio;
        if (startCrop.y + newH > 100) {
          newH = 100 - startCrop.y;
          newW = (newH * ratio) / imgRatio;
          newX = startCrop.x + (startCrop.width - newW);
        }
        if (newX >= 0) {
          next.x = newX;
          next.width = newW;
          next.height = newH;
        }
      } else if (dragType === 'tr') {
        let newW = Math.max(10, Math.min(100 - startCrop.x, startCrop.width + deltaX));
        let newH = (newW * imgRatio) / ratio;
        let newY = startCrop.y + (startCrop.height - newH);
        if (newY < 0) {
          newY = 0;
          newH = startCrop.y + startCrop.height;
          newW = (newH * ratio) / imgRatio;
        }
        if (newY >= 0) {
          next.y = newY;
          next.width = newW;
          next.height = newH;
        }
      } else if (dragType === 'tl') {
        let newW = Math.max(10, startCrop.width - deltaX);
        let newX = startCrop.x + (startCrop.width - newW);
        let newH = (newW * imgRatio) / ratio;
        let newY = startCrop.y + (startCrop.height - newH);
        if (newY >= 0 && newX >= 0) {
          next.x = newX;
          next.y = newY;
          next.width = newW;
          next.height = newH;
        }
      }

      next.x = Math.max(0, Math.min(100 - next.width, next.x));
      next.y = Math.max(0, Math.min(100 - next.height, next.y));

      return {
        ...prevCrops,
        [activeDevice]: next,
      };
    });
  };

  const handlePointerUp = () => {
    dragRef.current.isDragging = false;
    dragRef.current.dragType = null;
  };

  // Step transition handlers
  const handleSelectDevice = (device: DeviceType) => {
    setConfirmed((prev) => ({ ...prev, [device]: true }));
    setActiveDevice(device);
  };

  const handleNextStep = () => {
    if (activeDevice === 'desktop') {
      setConfirmed((prev) => ({ ...prev, desktop: true, foldable: true }));
      setActiveDevice('foldable');
    } else if (activeDevice === 'foldable') {
      setConfirmed((prev) => ({ ...prev, foldable: true, mobile: true }));
      setActiveDevice('mobile');
    } else {
      setConfirmed((prev) => ({ ...prev, mobile: true }));
    }
  };

  const allThreeDone = confirmed.desktop && confirmed.foldable && confirmed.mobile;
  const completedCount = [confirmed.desktop, confirmed.foldable, confirmed.mobile].filter(Boolean).length;

  // Render a specific crop to a File using an offscreen canvas
  const renderCropToFile = (
    cropRect: CropRect,
    deviceTag: DeviceType,
    rotCanvas: HTMLCanvasElement,
    naturalW: number,
    naturalH: number
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      try {
        const pixelX = Math.round((cropRect.x / 100) * naturalW);
        const pixelY = Math.round((cropRect.y / 100) * naturalH);
        const pixelW = Math.round((cropRect.width / 100) * naturalW);
        const pixelH = Math.round((cropRect.height / 100) * naturalH);

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

  // Export all 3 crops at once
  const handleFinalizeAllThreeCrops = async () => {
    const img = imgRef.current;
    if (!img) return;

    setIsProcessing(true);

    try {
      // 1. Prepare rotated canvas
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

      // 2. Generate all 3 cropped files in parallel
      const [desktopFile, foldableFile, mobileFile] = await Promise.all([
        renderCropToFile(crops.desktop, 'desktop', rotCanvas, naturalW, naturalH),
        renderCropToFile(crops.foldable, 'foldable', rotCanvas, naturalW, naturalH),
        renderCropToFile(crops.mobile, 'mobile', rotCanvas, naturalW, naturalH),
      ]);

      setIsProcessing(false);
      onCropComplete({
        desktop: desktopFile,
        foldable: foldableFile,
        mobile: mobileFile,
      });
    } catch (err) {
      console.error('3-Device cropping error:', err);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#121418] text-[#E8E6E3] w-full max-w-5xl rounded-2xl shadow-2xl border border-white/10 flex flex-col max-h-[98vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex justify-between items-center bg-[#181B21]">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-base sm:text-lg font-bold font-display uppercase tracking-wide text-white">
                  3-Device Image Cropping
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider transition-colors ${
                    allThreeDone
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-primary/20 text-primary border border-primary/30'
                  }`}
                >
                  {allThreeDone ? '✓ All 3 Devices Cropped' : `Step: ${completedCount} of 3 Set`}
                </span>
                {queueInfo && queueInfo.total > 1 && (
                  <span className="px-2 py-0.5 rounded bg-white/10 text-neutral-300 text-xs">
                    File {queueInfo.current} / {queueInfo.total}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                You must crop the image for <span className="text-white font-medium">Desktop</span>,{' '}
                <span className="text-white font-medium">Foldables & iPads</span>, and{' '}
                <span className="text-white font-medium">Mobile Phones</span> before saving.
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              title="Cancel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Device Tabs Bar (Required 3 Options) */}
          <div className="grid grid-cols-3 bg-[#0E1013] border-b border-white/10 p-1.5 gap-1.5 sm:gap-2">
            {DEVICE_CONFIGS.map((device, index) => {
              const isActive = activeDevice === device.id;
              const isDone = confirmed[device.id];

              return (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => handleSelectDevice(device.id)}
                  className={`relative p-2.5 sm:p-3 rounded-xl transition-all duration-200 text-left flex flex-col justify-between border ${
                    isActive
                      ? 'bg-[#1E232B] border-primary text-white shadow-lg ring-1 ring-primary/40'
                      : isDone
                      ? 'bg-[#14171C] border-emerald-500/30 text-neutral-200 hover:bg-[#1A1E24]'
                      : 'bg-[#14171C]/60 border-white/5 text-neutral-400 hover:bg-[#181B22]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs sm:text-sm font-bold tracking-tight flex items-center gap-1.5">
                      <span className="text-primary font-mono">{index + 1}.</span> {device.label}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-semibold ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-white/5 text-neutral-400'
                      }`}
                    >
                      {isDone ? '✓ Set' : 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>{device.ratioText} ratio</span>
                    <span className="hidden sm:inline text-[10px] text-neutral-400">{device.subLabel}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Device Info Bar */}
          <div className="px-4 py-2 bg-[#16191F] border-b border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white uppercase tracking-wider">
                Now Cropping for {currentConfig.label}:
              </span>
              <span className="text-primary font-mono bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                Locked Aspect Ratio {currentConfig.ratioText}
              </span>
            </div>
            <div className="text-neutral-400 hidden md:block">
              {currentConfig.description}
            </div>
          </div>

          {/* Interactive Crop Viewport */}
          <div
            className="flex-1 relative bg-black/95 flex items-center justify-center p-3 sm:p-5 overflow-hidden min-h-[300px] sm:min-h-[400px]"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div
              ref={containerRef}
              className="relative inline-block max-w-full max-h-[50vh] select-none touch-none"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Source preview"
                onLoad={handleImageLoaded}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease',
                  maxHeight: '50vh',
                  maxWidth: '100%',
                  display: 'block',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
                className="rounded shadow-inner object-contain"
              />

              {/* Darkened Mask Over Entire Image */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                  className="absolute left-0 right-0 top-0 bg-black/70 backdrop-blur-[1px]"
                  style={{ height: `${currentCrop.y}%` }}
                />
                <div
                  className="absolute left-0 right-0 bottom-0 bg-black/70 backdrop-blur-[1px]"
                  style={{ height: `${100 - (currentCrop.y + currentCrop.height)}%` }}
                />
                <div
                  className="absolute left-0 bg-black/70 backdrop-blur-[1px]"
                  style={{
                    top: `${currentCrop.y}%`,
                    height: `${currentCrop.height}%`,
                    width: `${currentCrop.x}%`,
                  }}
                />
                <div
                  className="absolute right-0 bg-black/70 backdrop-blur-[1px]"
                  style={{
                    top: `${currentCrop.y}%`,
                    height: `${currentCrop.height}%`,
                    width: `${100 - (currentCrop.x + currentCrop.width)}%`,
                  }}
                />
              </div>

              {/* Active Draggable Crop Box */}
              <div
                className="absolute border-2 border-primary shadow-[0_0_0_1px_rgba(0,0,0,0.8),0_0_15px_rgba(200,160,93,0.3)] cursor-move touch-none"
                style={{
                  left: `${currentCrop.x}%`,
                  top: `${currentCrop.y}%`,
                  width: `${currentCrop.width}%`,
                  height: `${currentCrop.height}%`,
                }}
                onPointerDown={(e) => handlePointerDown(e, 'move')}
              >
                {/* Rule of Thirds Grid */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-50">
                  <div className="border-r border-b border-primary/50" />
                  <div className="border-r border-b border-primary/50" />
                  <div className="border-b border-primary/50" />
                  <div className="border-r border-b border-primary/50" />
                  <div className="border-r border-b border-primary/50" />
                  <div className="border-b border-primary/50" />
                  <div className="border-r border-b border-primary/50" />
                  <div className="border-r border-b border-primary/50" />
                  <div />
                </div>

                {/* Corner Drag Handles */}
                <div
                  className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-primary border-2 border-[#121418] rounded-sm cursor-nwse-resize shadow-md"
                  onPointerDown={(e) => handlePointerDown(e, 'tl')}
                />
                <div
                  className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-primary border-2 border-[#121418] rounded-sm cursor-nesw-resize shadow-md"
                  onPointerDown={(e) => handlePointerDown(e, 'tr')}
                />
                <div
                  className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-primary border-2 border-[#121418] rounded-sm cursor-nesw-resize shadow-md"
                  onPointerDown={(e) => handlePointerDown(e, 'bl')}
                />
                <div
                  className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-primary border-2 border-[#121418] rounded-sm cursor-nwse-resize shadow-md"
                  onPointerDown={(e) => handlePointerDown(e, 'br')}
                />

                {/* Current Preset Badge Tag */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-mono font-bold uppercase text-primary border border-primary/30 pointer-events-none tracking-wider">
                  {currentConfig.label} ({currentConfig.ratioText})
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tools Bar */}
          <div className="px-4 py-2.5 bg-[#15181E] border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
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
                onClick={() => {
                  const resetCrop = calculateDefaultCropForRatio(currentConfig.ratio);
                  setCrops((prev) => ({ ...prev, [activeDevice]: resetCrop }));
                }}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors border border-white/5"
              >
                <span>Reset Frame</span>
              </button>
            </div>

            <div className="text-neutral-400 text-xs">
              Drag corners to resize • Drag inside box to position
            </div>
          </div>

          {/* Footer Actions with Mandatory 3-Set Enforcement */}
          <div className="p-4 sm:p-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#181B21]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs sm:text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              {/* Stepper Next button if not on last device */}
              {activeDevice !== 'mobile' && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-4 py-2 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-xs sm:text-sm font-semibold tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>
                    Confirm {currentConfig.label} & Next:{' '}
                    {activeDevice === 'desktop' ? 'Foldables' : 'Mobile'}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {/* Final Save 3-Device Set Button (Locked until all 3 are completed) */}
              <button
                type="button"
                onClick={handleFinalizeAllThreeCrops}
                disabled={!allThreeDone || isProcessing}
                className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
                  allThreeDone && !isProcessing
                    ? 'bg-primary hover:opacity-90 text-on-primary shadow-primary/30'
                    : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed opacity-60'
                }`}
                title={
                  !allThreeDone
                    ? `Please complete all 3 device crops (${completedCount}/3 done)`
                    : 'Save and upload responsive crops for all 3 screen formats'
                }
              >
                {isProcessing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Generating 3 Crops & Uploading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>
                      {allThreeDone
                        ? 'Save & Upload 3-Device Set'
                        : `Crop for All 3 Devices (${completedCount}/3)`}
                    </span>
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
