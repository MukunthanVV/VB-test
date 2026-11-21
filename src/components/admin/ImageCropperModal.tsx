import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type DeviceType = 'desktop' | 'foldable' | 'mobile';

export interface DeviceCropConfig {
  id: DeviceType;
  label: string;
  subLabel: string;
  defaultRatio: number; // width / height
  defaultRatioText: string;
  icon: string;
  description: string;
  presets: Array<{ label: string; ratio: number | null; isFree?: boolean }>;
}

export const DEVICE_CONFIGS: DeviceCropConfig[] = [
  {
    id: 'desktop',
    label: 'Desktop',
    subLabel: 'Widescreen & Laptops',
    defaultRatio: 16 / 9,
    defaultRatioText: '16:9',
    icon: 'desktop_windows',
    description: 'Hero banners, cards, and desktop screens (1024px+)',
    presets: [
      { label: '16:9 Widescreen', ratio: 16 / 9 },
      { label: '21:9 Ultrawide', ratio: 21 / 9 },
      { label: '16:10 Laptop', ratio: 16 / 10 },
      { label: 'Free Crop', ratio: null, isFree: true },
    ],
  },
  {
    id: 'foldable',
    label: 'Foldables & iPads',
    subLabel: 'Tablets & Folded/Unfolded',
    defaultRatio: 4 / 3,
    defaultRatioText: '4:3',
    icon: 'devices_fold',
    description: 'Galaxy Fold, Pixel Fold, iPads & Tablets (641px - 1024px)',
    presets: [
      { label: '4:3 Tablet', ratio: 4 / 3 },
      { label: '1:1 Square', ratio: 1 },
      { label: '16:10 Folded', ratio: 16 / 10 },
      { label: 'Free Crop', ratio: null, isFree: true },
    ],
  },
  {
    id: 'mobile',
    label: 'Mobile Phones',
    subLabel: 'Smartphones Portrait',
    defaultRatio: 9 / 16,
    defaultRatioText: '9:16',
    icon: 'smartphone',
    description: 'Vertical mobile screens and reels (up to 640px)',
    presets: [
      { label: '9:16 Portrait', ratio: 9 / 16 },
      { label: '4:5 Social', ratio: 4 / 5 },
      { label: '1:1 Square', ratio: 1 },
      { label: 'Free Crop', ratio: null, isFree: true },
    ],
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

interface DeviceSetting {
  isFree: boolean;
  ratio: number;
  label: string;
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

  // Settings per device (aspect ratio or free crop)
  const [deviceSettings, setDeviceSettings] = useState<Record<DeviceType, DeviceSetting>>({
    desktop: { isFree: false, ratio: 16 / 9, label: '16:9' },
    foldable: { isFree: false, ratio: 4 / 3, label: '4:3' },
    mobile: { isFree: false, ratio: 9 / 16, label: '9:16' },
  });

  // Store crop coordinates for all 3 devices
  const [crops, setCrops] = useState<Record<DeviceType, CropRect>>({
    desktop: { x: 5, y: 15, width: 90, height: 50.6 },
    foldable: { x: 10, y: 10, width: 80, height: 60 },
    mobile: { x: 25, y: 5, width: 50, height: 88.8 },
  });

  // Track whether each device has been viewed/confirmed
  const [confirmed, setConfirmed] = useState<Record<DeviceType, boolean>>({
    desktop: true,
    foldable: false,
    mobile: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Dragging tracker ref (shared across pointer event listeners)
  const dragRef = useRef<{
    isDragging: boolean;
    dragType: 'move' | 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r' | 'draw' | null;
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
  const currentSetting = deviceSettings[activeDevice];
  const currentCrop = crops[activeDevice];

  // Helper to get image aspect ratio considering rotation
  const getImageRatio = useCallback((): number => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth || !img.naturalHeight) return 1;
    const isRotated = rotation % 180 !== 0;
    const w = isRotated ? img.naturalHeight : img.naturalWidth;
    const h = isRotated ? img.naturalWidth : img.naturalHeight;
    return w / h;
  }, [rotation]);

  // Calculate default centered crop for a ratio or free mode
  const calculateDefaultCrop = useCallback(
    (targetRatio: number | null, isFree: boolean): CropRect => {
      if (isFree || targetRatio === null) {
        return { x: 5, y: 5, width: 90, height: 90 };
      }

      const imgRatio = getImageRatio();
      let newW = 92;
      let newH = 92;

      if (targetRatio > imgRatio) {
        // Target is wider than image
        newW = 94;
        newH = (newW * imgRatio) / targetRatio;
      } else {
        // Target is taller than image
        newH = 94;
        newW = (newH * targetRatio) / imgRatio;
      }

      newW = Math.min(newW, 98);
      newH = Math.min(newH, 98);

      const newX = Math.max(0, (100 - newW) / 2);
      const newY = Math.max(0, (100 - newH) / 2);

      return { x: newX, y: newY, width: newW, height: newH };
    },
    [getImageRatio]
  );

  // Initialize all 3 crops when image loads or modal opens
  const handleImageLoaded = useCallback(() => {
    const desktopCrop = calculateDefaultCrop(deviceSettings.desktop.ratio, deviceSettings.desktop.isFree);
    const foldableCrop = calculateDefaultCrop(deviceSettings.foldable.ratio, deviceSettings.foldable.isFree);
    const mobileCrop = calculateDefaultCrop(deviceSettings.mobile.ratio, deviceSettings.mobile.isFree);

    setCrops({
      desktop: desktopCrop,
      foldable: foldableCrop,
      mobile: mobileCrop,
    });
  }, [calculateDefaultCrop, deviceSettings]);

  useEffect(() => {
    if (isOpen) {
      setRotation(0);
      setIsProcessing(false);
      setActiveDevice('desktop');
      setDeviceSettings({
        desktop: { isFree: false, ratio: 16 / 9, label: '16:9' },
        foldable: { isFree: false, ratio: 4 / 3, label: '4:3' },
        mobile: { isFree: false, ratio: 9 / 16, label: '9:16' },
      });
      setConfirmed({
        desktop: true,
        foldable: false,
        mobile: false,
      });
      setTimeout(() => {
        handleImageLoaded();
      }, 60);
    }
  }, [isOpen, imageSrc, handleImageLoaded]);

  // Handle Preset Switch (e.g. 16:9 vs Free Crop)
  const handleSelectPreset = (ratio: number | null, isFree: boolean, label: string) => {
    setConfirmed((prev) => ({ ...prev, [activeDevice]: true }));
    const newSetting: DeviceSetting = {
      isFree,
      ratio: ratio || 1,
      label,
    };
    setDeviceSettings((prev) => ({ ...prev, [activeDevice]: newSetting }));

    // Apply new crop frame
    const newCrop = calculateDefaultCrop(ratio, isFree);
    setCrops((prev) => ({ ...prev, [activeDevice]: newCrop }));
  };

  // Maximize / Fit to Image
  const handleMaximize = () => {
    setConfirmed((prev) => ({ ...prev, [activeDevice]: true }));
    if (currentSetting.isFree) {
      setCrops((prev) => ({
        ...prev,
        [activeDevice]: { x: 0, y: 0, width: 100, height: 100 },
      }));
    } else {
      const maximized = calculateDefaultCrop(currentSetting.ratio, false);
      setCrops((prev) => ({
        ...prev,
        [activeDevice]: maximized,
      }));
    }
  };

  // Center the current frame
  const handleCenter = () => {
    setCrops((prev) => {
      const c = prev[activeDevice];
      return {
        ...prev,
        [activeDevice]: {
          ...c,
          x: Math.max(0, (100 - c.width) / 2),
          y: Math.max(0, (100 - c.height) / 2),
        },
      };
    });
  };

  // Handle Rotation 90deg
  const handleRotate = () => {
    const nextRot = (rotation + 90) % 360;
    setRotation(nextRot);
    setTimeout(() => {
      setCrops({
        desktop: calculateDefaultCrop(deviceSettings.desktop.ratio, deviceSettings.desktop.isFree),
        foldable: calculateDefaultCrop(deviceSettings.foldable.ratio, deviceSettings.foldable.isFree),
        mobile: calculateDefaultCrop(deviceSettings.mobile.ratio, deviceSettings.mobile.isFree),
      });
    }, 50);
  };

  // Rock-Solid Window Pointer Drag Handling
  const handlePointerDown = (
    e: React.PointerEvent,
    type: 'move' | 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setConfirmed((prev) => ({ ...prev, [activeDevice]: true }));

    dragRef.current = {
      isDragging: true,
      dragType: type,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...crops[activeDevice] },
    };

    const isFree = deviceSettings[activeDevice].isFree;
    const ratio = deviceSettings[activeDevice].ratio;
    const imgRatio = getImageRatio();
    // aspectFactor translates width% to height% for the target ratio:
    // height% = width% * (imgRatio / targetRatio)
    const aspectFactor = imgRatio / ratio;
    const MIN_SIZE = 5; // minimum 5% size

    const onPointerMove = (moveEv: PointerEvent) => {
      if (!dragRef.current.isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const deltaX = ((moveEv.clientX - dragRef.current.startX) / rect.width) * 100;
      const deltaY = ((moveEv.clientY - dragRef.current.startY) / rect.height) * 100;
      const { startCrop, dragType } = dragRef.current;
      if (!dragType) return;

      setCrops((prevCrops) => {
        let next = { ...startCrop };

        if (dragType === 'move') {
          next.x = Math.max(0, Math.min(100 - startCrop.width, startCrop.x + deltaX));
          next.y = Math.max(0, Math.min(100 - startCrop.height, startCrop.y + deltaY));
        } else if (isFree) {
          // ================= FREE FORM CROPPING (No constraints) =================
          if (dragType === 'r') {
            next.width = Math.max(MIN_SIZE, Math.min(100 - startCrop.x, startCrop.width + deltaX));
          } else if (dragType === 'l') {
            const maxDeltaX = startCrop.width - MIN_SIZE;
            const clampedDeltaX = Math.max(-startCrop.x, Math.min(maxDeltaX, deltaX));
            next.x = startCrop.x + clampedDeltaX;
            next.width = startCrop.width - clampedDeltaX;
          } else if (dragType === 'b') {
            next.height = Math.max(MIN_SIZE, Math.min(100 - startCrop.y, startCrop.height + deltaY));
          } else if (dragType === 't') {
            const maxDeltaY = startCrop.height - MIN_SIZE;
            const clampedDeltaY = Math.max(-startCrop.y, Math.min(maxDeltaY, deltaY));
            next.y = startCrop.y + clampedDeltaY;
            next.height = startCrop.height - clampedDeltaY;
          } else if (dragType === 'br') {
            next.width = Math.max(MIN_SIZE, Math.min(100 - startCrop.x, startCrop.width + deltaX));
            next.height = Math.max(MIN_SIZE, Math.min(100 - startCrop.y, startCrop.height + deltaY));
          } else if (dragType === 'bl') {
            const maxDeltaX = startCrop.width - MIN_SIZE;
            const clampedDeltaX = Math.max(-startCrop.x, Math.min(maxDeltaX, deltaX));
            next.x = startCrop.x + clampedDeltaX;
            next.width = startCrop.width - clampedDeltaX;
            next.height = Math.max(MIN_SIZE, Math.min(100 - startCrop.y, startCrop.height + deltaY));
          } else if (dragType === 'tr') {
            next.width = Math.max(MIN_SIZE, Math.min(100 - startCrop.x, startCrop.width + deltaX));
            const maxDeltaY = startCrop.height - MIN_SIZE;
            const clampedDeltaY = Math.max(-startCrop.y, Math.min(maxDeltaY, deltaY));
            next.y = startCrop.y + clampedDeltaY;
            next.height = startCrop.height - clampedDeltaY;
          } else if (dragType === 'tl') {
            const maxDeltaX = startCrop.width - MIN_SIZE;
            const clampedDeltaX = Math.max(-startCrop.x, Math.min(maxDeltaX, deltaX));
            next.x = startCrop.x + clampedDeltaX;
            next.width = startCrop.width - clampedDeltaX;

            const maxDeltaY = startCrop.height - MIN_SIZE;
            const clampedDeltaY = Math.max(-startCrop.y, Math.min(maxDeltaY, deltaY));
            next.y = startCrop.y + clampedDeltaY;
            next.height = startCrop.height - clampedDeltaY;
          }
        } else {
          // ================= LOCKED RATIO CROPPING =================
          if (dragType === 'br' || dragType === 'r' || dragType === 'b') {
            let newW = startCrop.width + deltaX;
            let newH = newW * aspectFactor;
            if (startCrop.x + newW > 100) {
              newW = 100 - startCrop.x;
              newH = newW * aspectFactor;
            }
            if (startCrop.y + newH > 100) {
              newH = 100 - startCrop.y;
              newW = newH / aspectFactor;
            }
            next.width = Math.max(MIN_SIZE, Math.min(100 - startCrop.x, newW));
            next.height = Math.max(MIN_SIZE, Math.min(100 - startCrop.y, newH));
          } else if (dragType === 'bl' || dragType === 'l') {
            let newW = startCrop.width - deltaX;
            let newH = newW * aspectFactor;
            if (startCrop.y + newH > 100) {
              newH = 100 - startCrop.y;
              newW = newH / aspectFactor;
            }
            if (startCrop.x + (startCrop.width - newW) < 0) {
              newW = startCrop.x + startCrop.width;
              newH = newW * aspectFactor;
            }
            newW = Math.max(MIN_SIZE, newW);
            newH = Math.max(MIN_SIZE, newH);
            next.x = Math.max(0, startCrop.x + (startCrop.width - newW));
            next.width = newW;
            next.height = newH;
          } else if (dragType === 'tr') {
            let newW = startCrop.width + deltaX;
            let newH = newW * aspectFactor;
            if (startCrop.x + newW > 100) {
              newW = 100 - startCrop.x;
              newH = newW * aspectFactor;
            }
            if (startCrop.y + (startCrop.height - newH) < 0) {
              newH = startCrop.y + startCrop.height;
              newW = newH / aspectFactor;
            }
            newW = Math.max(MIN_SIZE, newW);
            newH = Math.max(MIN_SIZE, newH);
            next.y = Math.max(0, startCrop.y + (startCrop.height - newH));
            next.width = newW;
            next.height = newH;
          } else if (dragType === 'tl' || dragType === 't') {
            let newW = startCrop.width - deltaX;
            let newH = newW * aspectFactor;
            if (startCrop.x + (startCrop.width - newW) < 0) {
              newW = startCrop.x + startCrop.width;
              newH = newW * aspectFactor;
            }
            if (startCrop.y + (startCrop.height - newH) < 0) {
              newH = startCrop.y + startCrop.height;
              newW = newH / aspectFactor;
            }
            newW = Math.max(MIN_SIZE, newW);
            newH = Math.max(MIN_SIZE, newH);
            next.x = Math.max(0, startCrop.x + (startCrop.width - newW));
            next.y = Math.max(0, startCrop.y + (startCrop.height - newH));
            next.width = newW;
            next.height = newH;
          }
        }

        // Final boundary clamps
        next.x = Math.max(0, Math.min(100 - next.width, next.x));
        next.y = Math.max(0, Math.min(100 - next.height, next.y));

        return {
          ...prevCrops,
          [activeDevice]: next,
        };
      });
    };

    const onPointerUp = () => {
      dragRef.current.isDragging = false;
      dragRef.current.dragType = null;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // Step transition handlers
  const handleSelectDevice = (device: DeviceType) => {
    setConfirmed((prev) => ({ ...prev, [device]: true }));
    setActiveDevice(device);
  };

  const handleNextStep = () => {
    if (activeDevice === 'desktop') {
      setActiveDevice('foldable');
      setConfirmed((prev) => ({ ...prev, foldable: true }));
    } else if (activeDevice === 'foldable') {
      setActiveDevice('mobile');
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
                Crop for <span className="text-white font-medium">Desktop</span>,{' '}
                <span className="text-white font-medium">Foldables & iPads</span>, and{' '}
                <span className="text-white font-medium">Mobile</span>. Use presets or crop freely.
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
              const setting = deviceSettings[device.id];

              return (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => handleSelectDevice(device.id)}
                  className={`relative p-2.5 sm:p-3 rounded-xl transition-all duration-200 text-left flex flex-col justify-between border cursor-pointer ${
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
                    <span className="font-mono text-primary/90 font-medium">
                      {setting.isFree ? 'Free Crop' : `${setting.label} ratio`}
                    </span>
                    <span className="hidden sm:inline text-[10px] text-neutral-400">{device.subLabel}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Device Info Bar & Presets */}
          <div className="px-4 py-2.5 bg-[#16191F] border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-white uppercase tracking-wider">
                {currentConfig.label} Mode:
              </span>

              {/* Preset buttons including Free Crop */}
              <div className="flex items-center gap-1.5 bg-[#0E1013] p-1 rounded-lg border border-white/5">
                {currentConfig.presets.map((p) => {
                  const isCurrent =
                    (p.isFree && currentSetting.isFree) ||
                    (!p.isFree && !currentSetting.isFree && currentSetting.label === p.label);

                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleSelectPreset(p.ratio, !!p.isFree, p.label)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-primary text-on-primary font-bold shadow-sm'
                          : 'text-neutral-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${
                currentSetting.isFree
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-primary/10 text-primary border-primary/20'
              }`}>
                {currentSetting.isFree ? '🔓 Free-Form (No Limits)' : `🔒 Locked ${currentSetting.label}`}
              </span>
            </div>
          </div>

          {/* Interactive Crop Viewport */}
          <div className="flex-1 relative bg-black/95 flex items-center justify-center p-3 sm:p-5 overflow-hidden min-h-[320px] sm:min-h-[420px]">
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

              {/* Active Draggable & Resizable Crop Box */}
              <div
                className="absolute border-2 border-primary shadow-[0_0_0_1px_rgba(0,0,0,0.8),0_0_18px_rgba(200,160,93,0.35)] cursor-move touch-none"
                style={{
                  left: `${currentCrop.x}%`,
                  top: `${currentCrop.y}%`,
                  width: `${currentCrop.width}%`,
                  height: `${currentCrop.height}%`,
                }}
                onPointerDown={(e) => handlePointerDown(e, 'move')}
              >
                {/* Rule of Thirds Grid */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-45">
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

                {/* 4 Corner Drag Handles */}
                <div
                  className="absolute -top-3 -left-3 w-6 h-6 bg-primary border-2 border-[#121418] rounded-md cursor-nwse-resize shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                  onPointerDown={(e) => handlePointerDown(e, 'tl')}
                  title="Resize Top-Left"
                >
                  <div className="w-1.5 h-1.5 bg-black rounded-full" />
                </div>
                <div
                  className="absolute -top-3 -right-3 w-6 h-6 bg-primary border-2 border-[#121418] rounded-md cursor-nesw-resize shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                  onPointerDown={(e) => handlePointerDown(e, 'tr')}
                  title="Resize Top-Right"
                >
                  <div className="w-1.5 h-1.5 bg-black rounded-full" />
                </div>
                <div
                  className="absolute -bottom-3 -left-3 w-6 h-6 bg-primary border-2 border-[#121418] rounded-md cursor-nesw-resize shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                  onPointerDown={(e) => handlePointerDown(e, 'bl')}
                  title="Resize Bottom-Left"
                >
                  <div className="w-1.5 h-1.5 bg-black rounded-full" />
                </div>
                <div
                  className="absolute -bottom-3 -right-3 w-6 h-6 bg-primary border-2 border-[#121418] rounded-md cursor-nwse-resize shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                  onPointerDown={(e) => handlePointerDown(e, 'br')}
                  title="Resize Bottom-Right"
                >
                  <div className="w-1.5 h-1.5 bg-black rounded-full" />
                </div>

                {/* 4 Edge Handles (Pull sides freely) */}
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3.5 bg-primary/90 hover:bg-primary border border-[#121418] rounded-full cursor-ns-resize shadow-md flex items-center justify-center active:scale-95 transition-all"
                  onPointerDown={(e) => handlePointerDown(e, 't')}
                  title="Resize Top"
                >
                  <div className="w-3 h-0.5 bg-black/70 rounded" />
                </div>
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-3.5 bg-primary/90 hover:bg-primary border border-[#121418] rounded-full cursor-ns-resize shadow-md flex items-center justify-center active:scale-95 transition-all"
                  onPointerDown={(e) => handlePointerDown(e, 'b')}
                  title="Resize Bottom"
                >
                  <div className="w-3 h-0.5 bg-black/70 rounded" />
                </div>
                <div
                  className="absolute top-1/2 -left-2 -translate-y-1/2 w-3.5 h-8 bg-primary/90 hover:bg-primary border border-[#121418] rounded-full cursor-ew-resize shadow-md flex items-center justify-center active:scale-95 transition-all"
                  onPointerDown={(e) => handlePointerDown(e, 'l')}
                  title="Resize Left"
                >
                  <div className="w-0.5 h-3 bg-black/70 rounded" />
                </div>
                <div
                  className="absolute top-1/2 -right-2 -translate-y-1/2 w-3.5 h-8 bg-primary/90 hover:bg-primary border border-[#121418] rounded-full cursor-ew-resize shadow-md flex items-center justify-center active:scale-95 transition-all"
                  onPointerDown={(e) => handlePointerDown(e, 'r')}
                  title="Resize Right"
                >
                  <div className="w-0.5 h-3 bg-black/70 rounded" />
                </div>

                {/* Current Badge Tag */}
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded bg-black/85 backdrop-blur-md text-[10px] font-mono font-bold uppercase text-primary border border-primary/40 pointer-events-none tracking-wider shadow-md">
                  {currentConfig.label}: {currentSetting.isFree ? 'FREE CROP' : currentSetting.label} ({Math.round(currentCrop.width)}% × {Math.round(currentCrop.height)}%)
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tools Bar */}
          <div className="px-4 py-2.5 bg-[#15181E] border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRotate}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors border border-white/5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Rotate 90°</span>
              </button>

              <button
                type="button"
                onClick={handleMaximize}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors border border-white/5 cursor-pointer"
                title="Expand frame to maximum size"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span>Fit / Maximize</span>
              </button>

              <button
                type="button"
                onClick={handleCenter}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors border border-white/5 cursor-pointer"
                title="Center frame on image"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" strokeWidth={2} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v3m0 14v3M2 12h3m14 0h3" />
                </svg>
                <span>Center Frame</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const resetCrop = calculateDefaultCrop(currentConfig.defaultRatio, false);
                  setCrops((prev) => ({ ...prev, [activeDevice]: resetCrop }));
                  setDeviceSettings((prev) => ({
                    ...prev,
                    [activeDevice]: {
                      isFree: false,
                      ratio: currentConfig.defaultRatio,
                      label: currentConfig.defaultRatioText,
                    },
                  }));
                }}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors border border-white/5 cursor-pointer"
                title="Reset to recommended aspect ratio"
              >
                <span>Reset to Recommended</span>
              </button>
            </div>

            <div className="text-neutral-400 text-xs hidden sm:block">
              {currentSetting.isFree
                ? 'Free Mode: Drag any corner or side handle to crop freely'
                : 'Locked Mode: Drag corners to resize • Drag inside box to position'}
            </div>
          </div>

          {/* Footer Actions with Mandatory 3-Set Enforcement */}
          <div className="p-4 sm:p-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#181B21]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs sm:text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer"
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
