import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type DeviceType = 'desktop' | 'foldable' | 'mobile';

export interface DeviceCropConfig {
  id: DeviceType;
  label: string;
  subLabel: string;
  defaultRatio: number; // width / height
  ratioText: string;
  description: string;
  aspectClass: string;
}

export const DEVICE_CONFIGS: DeviceCropConfig[] = [
  {
    id: 'desktop',
    label: 'Desktop',
    subLabel: 'Widescreen & Laptops (1024px+)',
    defaultRatio: 16 / 9,
    ratioText: '16:9 Widescreen',
    description: 'How visitors on desktop and laptop screens will see this section',
    aspectClass: 'aspect-[16/9]',
  },
  {
    id: 'foldable',
    label: 'Foldables & iPads',
    subLabel: 'Tablets & Folded/Unfolded (641px - 1024px)',
    defaultRatio: 4 / 3,
    ratioText: '4:3 Tablet',
    description: 'How visitors on iPads, tablets, and foldable phones will see this section',
    aspectClass: 'aspect-[4/3]',
  },
  {
    id: 'mobile',
    label: 'Mobile Phones',
    subLabel: 'Smartphones Portrait (up to 640px)',
    defaultRatio: 9 / 16,
    ratioText: '9:16 Portrait',
    description: 'How visitors on iPhone and Android smartphones will see this section',
    aspectClass: 'aspect-[9/16]',
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
  ratio: number | null;
  label: string;
}

// -------------------------------------------------------------
// Pure HTML5 Canvas Live Preview (Zero Distortion / True Output)
// -------------------------------------------------------------
const LiveCanvasPreview: React.FC<{
  imageSrc: string;
  crop: CropRect;
  rotation: number;
  className?: string;
  aspectClass?: string;
}> = ({ imageSrc, crop, rotation, className = '', aspectClass = 'aspect-[16/9]' }) => {
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

      // 1. Prepare rotated canvas
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

      // 2. Compute exact crop slice coordinates in real pixels
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
    <div className={`relative overflow-hidden ${aspectClass} bg-black/60 rounded-xl flex items-center justify-center border border-white/10 ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover select-none pointer-events-none"
      />
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
  const [activeDevice, setActiveDevice] = useState<DeviceType>('desktop');
  const [rotation, setRotation] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Settings per device - default to device-matching ratios so previews match website sections
  const [deviceSettings, setDeviceSettings] = useState<Record<DeviceType, DeviceSetting>>({
    desktop: { isFree: false, ratio: 16 / 9, label: '16:9 Widescreen' },
    foldable: { isFree: false, ratio: 4 / 3, label: '4:3 Tablet' },
    mobile: { isFree: false, ratio: 9 / 16, label: '9:16 Portrait' },
  });

  // Store crop coordinates for all 3 devices
  const [crops, setCrops] = useState<Record<DeviceType, CropRect>>({
    desktop: { x: 5, y: 15, width: 90, height: 50.6 },
    foldable: { x: 10, y: 10, width: 80, height: 60 },
    mobile: { x: 25, y: 5, width: 50, height: 88.8 },
  });

  // Track confirmation
  const [confirmed, setConfirmed] = useState<Record<DeviceType, boolean>>({
    desktop: true,
    foldable: false,
    mobile: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Dragging tracker ref
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

  // Calculate centered crop for a ratio or free mode
  const calculateDefaultCrop = useCallback(
    (targetRatio: number | null, isFree: boolean): CropRect => {
      if (isFree || targetRatio === null) {
        return { x: 5, y: 5, width: 90, height: 90 };
      }

      const imgRatio = getImageRatio();
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

      newW = Math.min(newW, 98);
      newH = Math.min(newH, 98);

      const newX = Math.max(0, (100 - newW) / 2);
      const newY = Math.max(0, (100 - newH) / 2);

      return { x: newX, y: newY, width: newW, height: newH };
    },
    [getImageRatio]
  );

  // Initialize crops when image loads or modal opens
  const handleImageLoaded = useCallback(() => {
    setCrops({
      desktop: calculateDefaultCrop(16 / 9, false),
      foldable: calculateDefaultCrop(4 / 3, false),
      mobile: calculateDefaultCrop(9 / 16, false),
    });
  }, [calculateDefaultCrop]);

  useEffect(() => {
    if (isOpen) {
      setRotation(0);
      setIsProcessing(false);
      setActiveDevice('desktop');
      setDeviceSettings({
        desktop: { isFree: false, ratio: 16 / 9, label: '16:9 Widescreen' },
        foldable: { isFree: false, ratio: 4 / 3, label: '4:3 Tablet' },
        mobile: { isFree: false, ratio: 9 / 16, label: '9:16 Portrait' },
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

  // Handle Free Crop Toggle
  const handleToggleFreeCrop = () => {
    setConfirmed((prev) => ({ ...prev, [activeDevice]: true }));
    if (currentSetting.isFree) {
      // Switch back to device recommended ratio
      const ratio = currentConfig.defaultRatio;
      setDeviceSettings((prev) => ({
        ...prev,
        [activeDevice]: { isFree: false, ratio, label: currentConfig.ratioText },
      }));
      const newCrop = calculateDefaultCrop(ratio, false);
      setCrops((prev) => ({ ...prev, [activeDevice]: newCrop }));
    } else {
      // Unlock: keep current frame, allow free resizing
      setDeviceSettings((prev) => ({
        ...prev,
        [activeDevice]: { isFree: true, ratio: null, label: 'Free Crop' },
      }));
    }
  };

  // Quick Preset ratios
  const handleApplyRatio = (ratio: number, label: string) => {
    setConfirmed((prev) => ({ ...prev, [activeDevice]: true }));
    setDeviceSettings((prev) => ({
      ...prev,
      [activeDevice]: { isFree: false, ratio, label },
    }));
    const newCrop = calculateDefaultCrop(ratio, false);
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

  // Center current crop
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

  // Rotate 90deg
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

  // Window Pointer Drag Handling
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
    const ratio = deviceSettings[activeDevice].ratio || 1;
    const imgRatio = getImageRatio();
    const aspectFactor = imgRatio / ratio;
    const MIN_SIZE = 5;

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

  // Render crop to a File using an offscreen canvas
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
                  3-Device Image Cropping & Preview
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider ${
                    allThreeDone
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-primary/20 text-primary border border-primary/30'
                  }`}
                >
                  {allThreeDone ? 'All 3 Views Ready' : `${completedCount} of 3 Set`}
                </span>
                {queueInfo && queueInfo.total > 1 && (
                  <span className="px-2 py-0.5 rounded bg-white/10 text-neutral-300 text-xs">
                    File {queueInfo.current} / {queueInfo.total}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Crop for <span className="text-white font-medium">Desktop</span>,{' '}
                <span className="text-white font-medium">Foldables</span>, and{' '}
                <span className="text-white font-medium">Mobile Phones</span>. Right preview shows the exact result.
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer text-sm font-semibold"
              title="Close"
            >
              ✕ Close
            </button>
          </div>

          {/* Device Tabs Bar (Clean, Minimal, No Broken Icons) */}
          <div className="grid grid-cols-3 bg-[#0B0D10] border-b border-white/10 p-2 gap-2">
            {DEVICE_CONFIGS.map((device, index) => {
              const isActive = activeDevice === device.id;
              const isDone = confirmed[device.id];
              const setting = deviceSettings[device.id];

              return (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => handleSelectDevice(device.id)}
                  className={`relative p-2.5 rounded-xl transition-all text-left flex items-center justify-between border cursor-pointer ${
                    isActive
                      ? 'bg-[#1E232B] border-primary text-white shadow-lg ring-1 ring-primary/40'
                      : isDone
                      ? 'bg-[#14171C] border-emerald-500/30 text-neutral-200 hover:bg-[#1A1E24]'
                      : 'bg-[#14171C]/60 border-white/5 text-neutral-400 hover:bg-[#181B22]'
                  }`}
                >
                  <div>
                    <div className="text-xs sm:text-sm font-bold tracking-tight">
                      <span className="text-primary font-mono mr-1">{index + 1}.</span> {device.label}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      {setting.isFree ? 'Free Crop (Custom)' : setting.label}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold ${
                      isActive
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : isDone
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-white/5 text-neutral-400'
                    }`}
                  >
                    {isActive ? 'Editing' : isDone ? 'Ready' : 'Pending'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Ratios Bar (Clean text buttons, No icons) */}
          <div className="px-3 sm:px-4 py-2 bg-[#16191F] border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] mr-1">
                {currentConfig.label} Ratio:
              </span>

              {/* Quick Preset Buttons */}
              <button
                type="button"
                onClick={() => handleApplyRatio(currentConfig.defaultRatio, currentConfig.ratioText)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  !currentSetting.isFree && currentSetting.ratio === currentConfig.defaultRatio
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-[#0E1013] text-neutral-300 hover:text-white border border-white/5'
                }`}
              >
                Recommended ({currentConfig.ratioText})
              </button>

              <button
                type="button"
                onClick={() => handleApplyRatio(9 / 16, '9:16 Mobile')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  !currentSetting.isFree && currentSetting.ratio === 9 / 16
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-[#0E1013] text-neutral-300 hover:text-white border border-white/5'
                }`}
              >
                9:16 Mobile
              </button>

              <button
                type="button"
                onClick={() => handleApplyRatio(4 / 5, '4:5 Social')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  !currentSetting.isFree && currentSetting.ratio === 4 / 5
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-[#0E1013] text-neutral-300 hover:text-white border border-white/5'
                }`}
              >
                4:5 Portrait
              </button>

              <button
                type="button"
                onClick={() => handleApplyRatio(1, '1:1 Square')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  !currentSetting.isFree && currentSetting.ratio === 1
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-[#0E1013] text-neutral-300 hover:text-white border border-white/5'
                }`}
              >
                1:1 Square
              </button>

              <button
                type="button"
                onClick={() => handleApplyRatio(16 / 9, '16:9 Widescreen')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  !currentSetting.isFree && currentSetting.ratio === 16 / 9
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-[#0E1013] text-neutral-300 hover:text-white border border-white/5'
                }`}
              >
                16:9 Desktop
              </button>

              <button
                type="button"
                onClick={handleToggleFreeCrop}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  currentSetting.isFree
                    ? 'bg-amber-500 text-black font-bold shadow-sm'
                    : 'bg-[#0E1013] text-neutral-300 hover:text-white border border-white/5'
                }`}
              >
                Free Crop (Custom)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${
                currentSetting.isFree
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-primary/10 text-primary border-primary/20'
              }`}>
                {currentSetting.isFree ? 'Free Crop Mode' : `Locked: ${currentSetting.label}`}
              </span>
            </div>
          </div>

          {/* Main Body: Split View (Interactive Cropper on Left, Live Preview on Right) */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden bg-black/95">
            {/* Left: Source Image + Draggable Crop Box */}
            <div className="flex-1 relative flex items-center justify-center p-3 sm:p-5 overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 min-h-[300px]">
              <div
                ref={containerRef}
                className="relative inline-block max-w-full max-h-[50vh] select-none touch-none"
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop Source"
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

                {/* Dark Mask Over Outside Area */}
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

                {/* Active Draggable Crop Box (CLEAN: No dark text badge covering the image) */}
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
                  {/* Subtle Grid */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                    <div className="border-r border-b border-primary/40" />
                    <div className="border-r border-b border-primary/40" />
                    <div className="border-b border-primary/40" />
                    <div className="border-r border-b border-primary/40" />
                    <div className="border-r border-b border-primary/40" />
                    <div className="border-b border-primary/40" />
                    <div className="border-r border-b border-primary/40" />
                    <div className="border-r border-b border-primary/40" />
                    <div />
                  </div>

                  {/* 4 Corner Handles */}
                  <div
                    className="absolute -top-3 -left-3 w-6 h-6 bg-primary border-2 border-[#121418] rounded-md cursor-nwse-resize shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    onPointerDown={(e) => handlePointerDown(e, 'tl')}
                  >
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                  </div>
                  <div
                    className="absolute -top-3 -right-3 w-6 h-6 bg-primary border-2 border-[#121418] rounded-md cursor-nesw-resize shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    onPointerDown={(e) => handlePointerDown(e, 'tr')}
                  >
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                  </div>
                  <div
                    className="absolute -bottom-3 -left-3 w-6 h-6 bg-primary border-2 border-[#121418] rounded-md cursor-nesw-resize shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    onPointerDown={(e) => handlePointerDown(e, 'bl')}
                  >
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                  </div>
                  <div
                    className="absolute -bottom-3 -right-3 w-6 h-6 bg-primary border-2 border-[#121418] rounded-md cursor-nwse-resize shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    onPointerDown={(e) => handlePointerDown(e, 'br')}
                  >
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                  </div>

                  {/* 4 Edge Handles */}
                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3.5 bg-primary/90 hover:bg-primary border border-[#121418] rounded-full cursor-ns-resize shadow-md flex items-center justify-center active:scale-95 transition-all"
                    onPointerDown={(e) => handlePointerDown(e, 't')}
                  >
                    <div className="w-3 h-0.5 bg-black/70 rounded" />
                  </div>
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-3.5 bg-primary/90 hover:bg-primary border border-[#121418] rounded-full cursor-ns-resize shadow-md flex items-center justify-center active:scale-95 transition-all"
                    onPointerDown={(e) => handlePointerDown(e, 'b')}
                  >
                    <div className="w-3 h-0.5 bg-black/70 rounded" />
                  </div>
                  <div
                    className="absolute top-1/2 -left-2 -translate-y-1/2 w-3.5 h-8 bg-primary/90 hover:bg-primary border border-[#121418] rounded-full cursor-ew-resize shadow-md flex items-center justify-center active:scale-95 transition-all"
                    onPointerDown={(e) => handlePointerDown(e, 'l')}
                  >
                    <div className="w-0.5 h-3 bg-black/70 rounded" />
                  </div>
                  <div
                    className="absolute top-1/2 -right-2 -translate-y-1/2 w-3.5 h-8 bg-primary/90 hover:bg-primary border border-[#121418] rounded-full cursor-ew-resize shadow-md flex items-center justify-center active:scale-95 transition-all"
                    onPointerDown={(e) => handlePointerDown(e, 'r')}
                  >
                    <div className="w-0.5 h-3 bg-black/70 rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: EXACT SECTION PREVIEW (No Distortion, Matches Saved Image) */}
            <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 bg-[#0E1014] p-4 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                  <div className="text-xs font-bold text-white uppercase tracking-wider">
                    Exact {currentConfig.label} Section Preview
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Live Result</span>
                </div>

                <p className="text-[11px] text-neutral-400 mb-3">
                  {currentConfig.description}. This preview displays the exact pixel crop that will be rendered.
                </p>

                {/* Pixel-Perfect Canvas Live Preview Container */}
                <div className="py-2 flex items-center justify-center">
                  <div className="w-full max-w-[340px]">
                    <LiveCanvasPreview
                      imageSrc={imageSrc}
                      crop={currentCrop}
                      rotation={rotation}
                      aspectClass={currentConfig.aspectClass}
                      className="w-full shadow-2xl"
                    />
                  </div>
                </div>
              </div>

              {/* Other Section Previews with Switch Buttons */}
              <div className="pt-3 border-t border-white/10 mt-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-2 block">
                  Other Device Views (Click to Switch & Crop):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {DEVICE_CONFIGS.filter((d) => d.id !== activeDevice).map((other) => (
                    <button
                      key={other.id}
                      type="button"
                      onClick={() => handleSelectDevice(other.id)}
                      className="bg-[#141820] hover:bg-[#1A202A] p-2 rounded-xl border border-white/5 hover:border-primary/40 text-left transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-300 mb-1">
                        <span>{other.label}</span>
                        <span className="text-[10px] text-primary font-bold">Edit →</span>
                      </div>
                      <LiveCanvasPreview
                        imageSrc={imageSrc}
                        crop={crops[other.id]}
                        rotation={rotation}
                        aspectClass={other.aspectClass}
                        className="w-full h-16"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tools Bar (Clean Text Controls) */}
          <div className="px-3 sm:px-4 py-2 bg-[#15181E] border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handleRotate}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-300 hover:text-white transition-colors border border-white/5 cursor-pointer text-xs font-medium"
              >
                Rotate 90°
              </button>

              <button
                type="button"
                onClick={handleMaximize}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-300 hover:text-white transition-colors border border-white/5 cursor-pointer text-xs font-medium"
              >
                Fit Full Image
              </button>

              <button
                type="button"
                onClick={handleCenter}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-300 hover:text-white transition-colors border border-white/5 cursor-pointer text-xs font-medium"
              >
                Center Box
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
                      label: currentConfig.ratioText,
                    },
                  }));
                }}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-300 hover:text-white transition-colors border border-white/5 cursor-pointer text-xs font-medium"
              >
                Reset Frame
              </button>
            </div>

            <div className="text-neutral-400 text-xs hidden sm:block">
              Drag handles to crop • Right preview updates in real time with exact output
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

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Stepper Next button if not on last device */}
              {activeDevice !== 'mobile' && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-4 py-2 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-xs sm:text-sm font-semibold tracking-wide transition-colors cursor-pointer"
                >
                  Confirm {currentConfig.label} & Next:{' '}
                  {activeDevice === 'desktop' ? 'Foldables' : 'Mobile'} →
                </button>
              )}

              {/* Final Save 3-Device Set Button */}
              <button
                type="button"
                onClick={handleFinalizeAllThreeCrops}
                disabled={!allThreeDone || isProcessing}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg cursor-pointer ${
                  allThreeDone && !isProcessing
                    ? 'bg-primary hover:opacity-90 text-on-primary shadow-primary/30'
                    : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed opacity-60'
                }`}
              >
                {isProcessing
                  ? 'Generating 3 Crops & Uploading...'
                  : allThreeDone
                  ? 'Save & Upload 3-Device Set'
                  : `Preview & Save (${completedCount}/3 Ready)`}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ImageCropperModal;
