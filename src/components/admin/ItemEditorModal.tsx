import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import { db } from '../../firebase';
import { doc, addDoc, setDoc, collection, deleteField } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import ImageCropperModal, { type ThreeDeviceFiles } from './ImageCropperModal';

export type FieldConfig = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'image-gallery';
  required?: boolean;
};

interface ItemEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  collectionName: string;
  docId?: string | null;
  initialData?: any;
  fields: FieldConfig[];
  onSuccess?: () => void;
}

interface CropQueueItem {
  file: File;
  previewUrl: string;
  fieldName: string;
  isGallery: boolean;
  replaceIndex?: number;
}

export const getDisplayImageUrl = (
  val: any,
  device: 'desktop' | 'foldable' | 'mobile' = 'desktop'
): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return val[device] || val.desktop || val.foldable || val.mobile || '';
  }
  return '';
};

const ItemEditorModal: React.FC<ItemEditorModalProps> = ({
  isOpen,
  onClose,
  title,
  collectionName,
  docId,
  initialData,
  fields,
  onSuccess
}) => {
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const activeDocId = useRef<string | null>(docId || null);
  const { isAdmin } = useAuth();

  // Active preview device for inspecting multi-device crops
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'foldable' | 'mobile'>('desktop');

  // Mandatory 3-Device Cropping Queue State
  const [cropQueue, setCropQueue] = useState<CropQueueItem[]>([]);
  const [currentCropItem, setCurrentCropItem] = useState<CropQueueItem | null>(null);
  const [queueTotal, setQueueTotal] = useState<number>(0);
  const [queueCurrentIndex, setQueueCurrentIndex] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {});
      activeDocId.current = docId || null;
      setError(null);
      setSaveStatus('idle');
      setUploadProgress({});
      setCropQueue([]);
      setCurrentCropItem(null);
      setQueueTotal(0);
      setQueueCurrentIndex(0);
    }
  }, [isOpen, docId, initialData]);

  const handleSave = async () => {
    if (!isAdmin) {
      setError("Unauthorized: Only admins can perform this action.");
      return;
    }

    // Validate required fields
    for (const field of fields) {
      const val = formData[field.name];
      if (field.required && (!val || (typeof val === 'string' && val.trim() === ''))) {
        setError(`"${field.label}" is required.`);
        return;
      }
    }
    
    setSaveStatus('saving');
    setError(null);
    try {
      const targetId = activeDocId.current || docId;
      const dataToSave = { ...formData };
      delete dataToSave.id;

      const savePromise = (async () => {
        if (targetId) {
          await setDoc(doc(db, collectionName, targetId), dataToSave, { merge: true });
          if (!activeDocId.current) activeDocId.current = targetId;
        } else {
          const newDoc = await addDoc(collection(db, collectionName), dataToSave);
          activeDocId.current = newDoc.id;
        }
      })();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Save operation timed out. Please check your connection and Firestore permissions.")), 8000);
      });

      await Promise.race([savePromise, timeoutPromise]);

      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error("Save failed:", err);
      setError(err.message || "Failed to save.");
      setSaveStatus('idle');
    }
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setError(null);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Upload a single file to Cloudinary with compression
  const uploadSingleFileToCloudinary = async (file: File): Promise<string> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    const compressedFile = await imageCompression(file, options);

    const formDataToUpload = new FormData();
    formDataToUpload.append('file', compressedFile);
    formDataToUpload.append('upload_preset', 'vbassociate');

    const response = await fetch(`https://api.cloudinary.com/v1_1/dgssrfsli/image/upload`, {
      method: 'POST',
      body: formDataToUpload,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload ${file.name}`);
    }

    const data = await response.json();
    return data.secure_url;
  };

  // Triggered when admin selects image file(s) from device
  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, isGallery: boolean) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const newItems: CropQueueItem[] = selectedFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        fieldName,
        isGallery,
      }));

      setQueueTotal(newItems.length);
      setQueueCurrentIndex(1);
      setCurrentCropItem(newItems[0]);
      setCropQueue(newItems.slice(1));

      e.target.value = '';
    }
  };

  // Triggered when admin clicks "Crop" on an existing image
  const handleCropExistingImage = async (url: string | any, fieldName: string, isGallery: boolean, index?: number) => {
    try {
      setError(null);
      const targetUrl = typeof url === 'string' ? url : (url.desktop || url.foldable || url.mobile);
      if (!targetUrl) return;

      const res = await fetch(targetUrl);
      const blob = await res.blob();
      const file = new File([blob], `edit-${fieldName}-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
      const item: CropQueueItem = {
        file,
        previewUrl: URL.createObjectURL(blob),
        fieldName,
        isGallery,
        replaceIndex: index,
      };
      setQueueTotal(1);
      setQueueCurrentIndex(1);
      setCurrentCropItem(item);
    } catch (err) {
      console.warn("Direct fetch for crop failed, falling back to URL preview:", err);
      const targetUrl = typeof url === 'string' ? url : (url.desktop || url.foldable || url.mobile);
      const item: CropQueueItem = {
        file: new File([], `edit-${fieldName}.jpg`),
        previewUrl: targetUrl,
        fieldName,
        isGallery,
        replaceIndex: index,
      };
      setQueueTotal(1);
      setQueueCurrentIndex(1);
      setCurrentCropItem(item);
    }
  };

  // Called when all 3 device crops (Desktop, Foldable, Mobile) are finalized
  const handleCroppedSetReady = async (cropSet: ThreeDeviceFiles) => {
    if (!currentCropItem) return;

    const { fieldName, isGallery, replaceIndex, previewUrl } = currentCropItem;
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    try {
      setError(null);
      setUploadProgress((prev) => ({
        ...prev,
        'Desktop Crop': 20,
        'Foldables Crop': 20,
        'Mobile Crop': 20,
      }));

      // Upload all 3 crops in parallel to Cloudinary
      const [desktopUrl, foldableUrl, mobileUrl] = await Promise.all([
        uploadSingleFileToCloudinary(cropSet.desktop),
        uploadSingleFileToCloudinary(cropSet.foldable),
        uploadSingleFileToCloudinary(cropSet.mobile),
      ]);

      setUploadProgress({});

      const responsiveCropSet = {
        desktop: desktopUrl,
        foldable: foldableUrl,
        mobile: mobileUrl,
      };

      if (isGallery) {
        setFormData((prev: any) => {
          const arr = prev[fieldName]
            ? [...(Array.isArray(prev[fieldName]) ? prev[fieldName] : [prev[fieldName]])]
            : [];
          if (replaceIndex !== undefined && replaceIndex >= 0 && replaceIndex < arr.length) {
            arr[replaceIndex] = responsiveCropSet;
          } else {
            arr.push(responsiveCropSet);
          }
          return {
            ...prev,
            [fieldName]: arr,
          };
        });
      } else {
        setFormData((prev: any) => ({
          ...prev,
          [fieldName]: responsiveCropSet,
        }));
      }
    } catch (err: any) {
      console.error('Failed to upload 3-device crop set:', err);
      setError(err.message || 'Image set upload failed');
      setUploadProgress({});
    }

    // Process next queued file if any
    if (cropQueue.length > 0) {
      const nextItem = cropQueue[0];
      setCropQueue((prev) => prev.slice(1));
      setQueueCurrentIndex((prev) => prev + 1);
      setCurrentCropItem(nextItem);
    } else {
      setCurrentCropItem(null);
      setQueueTotal(0);
      setQueueCurrentIndex(0);
    }
  };

  const handleCancelCropping = () => {
    if (currentCropItem && currentCropItem.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentCropItem.previewUrl);
    }
    cropQueue.forEach((item) => {
      if (item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    setCropQueue([]);
    setCurrentCropItem(null);
    setQueueTotal(0);
    setQueueCurrentIndex(0);
  };

  const removeGalleryImage = (fieldName: string, indexToRemove: number) => {
    setFormData((prev: any) => {
      const arr = prev[fieldName] ? (Array.isArray(prev[fieldName]) ? prev[fieldName] : [prev[fieldName]]) : [];
      return {
        ...prev,
        [fieldName]: arr.filter((_: any, i: number) => i !== indexToRemove)
      };
    });
  };

  const removeSingleImage = (fieldName: string) => {
    setFormData((prev: any) => {
      const newData = { ...prev };
      newData[fieldName] = deleteField();
      return newData;
    });
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-outline/20 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-outline/10 flex justify-between items-center bg-surface-variant/50">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold font-display uppercase tracking-tight">{title}</h2>
                  {saveStatus === 'saving' && <span className="text-xs text-primary font-medium animate-pulse">Saving...</span>}
                  {saveStatus === 'saved' && <span className="text-xs text-green-500 font-medium">All changes saved</span>}
                </div>
                <button onClick={() => { if(onSuccess) onSuccess(); onClose(); }} className="text-on-surface-variant hover:text-on-surface">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Form Body */}
              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
                {error && <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">{error}</div>}

                {fields.map((field) => (
                  <div key={field.name} className="flex flex-col gap-2">
                    <label className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                      {field.label}
                    </label>
                    
                    {field.type === 'text' && (
                      <input
                        type="text"
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleChange}
                        required={field.required}
                        className={`bg-surface-variant border ${field.required && !formData[field.name] ? 'border-red-500/50' : 'border-outline/20'} rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary transition-colors`}
                      />
                    )}

                    {field.type === 'textarea' && (
                      <textarea
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleChange}
                        required={field.required}
                        rows={4}
                        className={`bg-surface-variant border ${field.required && !formData[field.name] ? 'border-red-500/50' : 'border-outline/20'} rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary transition-colors resize-none`}
                      />
                    )}

                    {/* Single Image Field with 3-Device Crop Support */}
                    {field.type === 'image' && (
                      <div className="flex flex-col gap-3">
                        {formData[field.name] && (
                          <div className="relative w-full h-52 rounded-xl overflow-hidden border border-outline/20 group bg-black/10">
                            <img
                              src={getDisplayImageUrl(formData[field.name], previewDevice)}
                              alt="Preview"
                              className="w-full h-full object-cover transition-all duration-300"
                            />

                            {/* Multi-Device Format Badges */}
                            {typeof formData[field.name] === 'object' && formData[field.name].desktop && (
                              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/75 backdrop-blur-md rounded-lg p-1 border border-white/10 z-10">
                                <span className="text-[10px] uppercase font-bold text-emerald-400 px-1.5 py-0.5">
                                  ✓ 3-Device Set:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setPreviewDevice('desktop')}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase transition-colors ${
                                    previewDevice === 'desktop'
                                      ? 'bg-primary text-white'
                                      : 'text-neutral-400 hover:text-white'
                                  }`}
                                >
                                  Desktop
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPreviewDevice('foldable')}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase transition-colors ${
                                    previewDevice === 'foldable'
                                      ? 'bg-primary text-white'
                                      : 'text-neutral-400 hover:text-white'
                                  }`}
                                >
                                  Foldables
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPreviewDevice('mobile')}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase transition-colors ${
                                    previewDevice === 'mobile'
                                      ? 'bg-primary text-white'
                                      : 'text-neutral-400 hover:text-white'
                                  }`}
                                >
                                  Mobile
                                </button>
                              </div>
                            )}

                            {/* Top Action Buttons (Re-Crop / Remove) */}
                            <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                              <button 
                                type="button"
                                onClick={() => handleCropExistingImage(formData[field.name], field.name, false)}
                                className="bg-primary hover:opacity-90 text-white px-3 py-1.5 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5 text-xs font-semibold backdrop-blur-sm cursor-pointer"
                                title="Re-crop for Desktop, Foldables & Mobile"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                                </svg>
                                <span>Re-Crop (3 Sets)</span>
                              </button>
                              <button 
                                type="button"
                                onClick={() => removeSingleImage(field.name)}
                                className="bg-red-500/90 hover:bg-red-500 text-white p-1.5 rounded-full shadow-lg transition-transform hover:scale-110 backdrop-blur-sm cursor-pointer"
                                title="Remove Image"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Active Upload Progress */}
                        {Object.entries(uploadProgress).map(([fileName, prog]) => (
                          <div key={fileName} className="flex flex-col gap-1">
                            <span className="text-[11px] font-mono text-neutral-400">Uploading {fileName}...</span>
                            <div className="w-full bg-surface-variant rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${prog}%` }}></div>
                            </div>
                          </div>
                        ))}

                        <div>
                          <label className="cursor-pointer inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors border border-primary/25 shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Upload Image & Crop for 3 Devices (Desktop / Foldables / Mobile)</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageSelection(e, field.name, false)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Image Gallery Field with 3-Device Crop Support */}
                    {field.type === 'image-gallery' && (
                      <div className="flex flex-col gap-4">
                        {formData[field.name] && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {(Array.isArray(formData[field.name]) ? formData[field.name] : [formData[field.name]]).map((itemVal: any, i: number) => {
                              const displayUrl = getDisplayImageUrl(itemVal, previewDevice);
                              const is3Device = typeof itemVal === 'object' && itemVal.desktop;

                              return (
                                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-outline/20 group bg-black/10">
                                  <img src={displayUrl} alt={`Gallery ${i}`} className="w-full h-full object-cover" />

                                  {is3Device && (
                                    <div className="absolute bottom-1.5 left-1.5 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                                      3-Set
                                    </div>
                                  )}

                                  <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                                    <button 
                                      type="button"
                                      onClick={() => handleCropExistingImage(itemVal, field.name, true, i)}
                                      className="bg-primary/95 hover:bg-primary text-white p-1.5 rounded-full shadow-lg transition-transform hover:scale-110 backdrop-blur-sm cursor-pointer"
                                      title="Re-crop for Desktop, Foldables & Mobile"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                                      </svg>
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => removeGalleryImage(field.name, i)}
                                      className="bg-red-500/90 hover:bg-red-500 text-white p-1.5 rounded-full shadow-lg transition-transform hover:scale-110 backdrop-blur-sm cursor-pointer"
                                      title="Remove Image"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Active Uploads */}
                        {Object.entries(uploadProgress).map(([fileName, prog]) => (
                          <div key={fileName} className="flex flex-col gap-1">
                            <span className="text-[11px] font-mono text-neutral-400">Uploading {fileName}...</span>
                            <div className="w-full bg-surface-variant rounded-full h-2 mb-2">
                              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${prog}%` }}></div>
                            </div>
                          </div>
                        ))}

                        <div>
                          <label className="cursor-pointer inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors border border-primary/25 shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Photos & Crop for 3 Devices (Desktop / Foldables / Mobile)</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleImageSelection(e, field.name, true)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Footer */}
              <div className="p-6 border-t border-outline/10 flex justify-end gap-4">
                <button
                  onClick={() => onClose()}
                  className="px-6 py-2 rounded-full border border-outline/20 text-on-surface font-medium hover:bg-surface-variant transition-colors"
                  disabled={saveStatus === 'saving'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving' || Object.keys(uploadProgress).length > 0 || !!error}
                  className="px-6 py-2 rounded-full bg-primary text-on-primary font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saveStatus === 'saving' ? 'Saving...' : Object.keys(uploadProgress).length > 0 ? 'Uploading Crops...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mandatory 3-Device Crop Modal */}
      {currentCropItem && (
        <ImageCropperModal
          isOpen={true}
          imageSrc={currentCropItem.previewUrl}
          fileName={currentCropItem.file.name}
          queueInfo={
            queueTotal > 1 ? { current: queueCurrentIndex, total: queueTotal } : undefined
          }
          onClose={handleCancelCropping}
          onCropComplete={handleCroppedSetReady}
        />
      )}
    </>
  );
};

export default ItemEditorModal;
