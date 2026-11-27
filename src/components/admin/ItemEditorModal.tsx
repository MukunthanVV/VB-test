import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { doc, addDoc, setDoc, collection, deleteField } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

export type FieldConfig = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'image-gallery' | 'select';
  options?: { label: string; value: string }[];
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

export const getDisplayImageUrl = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return val.desktop || val.foldable || val.mobile || '';
  }
  return '';
};

// Fast 1-pass canvas resize for images > 2.5MB; instant bypass for images <= 2.5MB
const prepareImageQuickly = async (file: File): Promise<Blob | File> => {
  if (file.size <= 2.5 * 1024 * 1024) {
    return file;
  }
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const maxDim = 1920;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => resolve(blob || file),
          'image/jpeg',
          0.85
        );
      } else {
        resolve(file);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
    img.src = objectUrl;
  });
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

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {});
      activeDocId.current = docId || null;
      setError(null);
      setSaveStatus('idle');
      setUploadProgress({});
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
      }, 150);
    } catch (err: any) {
      console.error("Save failed:", err);
      setError(err.message || "Failed to save.");
      setSaveStatus('idle');
    }
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setError(null);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (file: File, fieldName: string, isGallery: boolean) => {
    try {
      setError(null);
      setUploadProgress(prev => ({ ...prev, [file.name]: 5 }));

      // Fast preparation (< 50ms)
      const fileToUpload = await prepareImageQuickly(file);

      // Real-time XMLHttpRequest upload for instant response
      const downloadURL = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://api.cloudinary.com/v1_1/dgssrfsli/image/upload', true);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 98);
            setUploadProgress(prev => ({ ...prev, [file.name]: Math.max(percent, 5) }));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              resolve(res.secure_url);
            } catch {
              reject(new Error('Invalid Cloudinary response'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));

        const formDataToUpload = new FormData();
        formDataToUpload.append('file', fileToUpload, file.name);
        formDataToUpload.append('upload_preset', 'vbassociate');
        xhr.send(formDataToUpload);
      });

      setUploadProgress(prev => {
        const next = { ...prev };
        delete next[file.name];
        return next;
      });

      if (isGallery) {
        setFormData((prev: any) => {
          const arr = prev[fieldName] ? (Array.isArray(prev[fieldName]) ? prev[fieldName] : [prev[fieldName]]) : [];
          return {
            ...prev,
            [fieldName]: [...arr, downloadURL]
          };
        });
      } else {
        setFormData((prev: any) => ({ ...prev, [fieldName]: downloadURL }));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Image upload failed');
      setUploadProgress(prev => { const n = {...prev}; delete n[file.name]; return n; });
    }
  };

  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, isGallery: boolean) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => {
        handleImageUpload(file, fieldName, isGallery);
      });
      e.target.value = '';
    }
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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

                  {field.name === 'status' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { value: 'Live', label: 'Live (Available)', color: 'border-[#1B3B2B] bg-[#1B3B2B]/10 text-[#1B3B2B] dark:text-emerald-400', dot: 'bg-[#1B3B2B] dark:bg-emerald-400' },
                        { value: 'Booked', label: 'Booked', color: 'border-[#5E2C14] bg-[#5E2C14]/10 text-[#5E2C14] dark:text-amber-500', dot: 'bg-[#5E2C14] dark:bg-amber-500' },
                        { value: 'Sold', label: 'Sold', color: 'border-[#4E121B] bg-[#4E121B]/10 text-[#4E121B] dark:text-red-400', dot: 'bg-[#4E121B] dark:bg-red-400' },
                        { value: 'none', label: 'Hide Stamp', color: 'border-outline/40 bg-surface-variant text-on-surface-variant', dot: 'bg-neutral-400' },
                      ].map((st) => {
                        const currentVal = formData['status'] !== undefined ? formData['status'] : 'Live';
                        const isSelected = currentVal.toLowerCase() === st.value.toLowerCase() ||
                          (st.value === 'none' && currentVal === 'none');
                        return (
                          <button
                            key={st.value}
                            type="button"
                            onClick={() => {
                              setFormData((prev: any) => ({ ...prev, status: st.value }));
                            }}
                            className={`flex items-center justify-between p-3 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
                              isSelected
                                ? `${st.color} shadow-sm ring-2 ring-primary/40 scale-[1.02]`
                                : 'border-outline/20 hover:border-outline/50 bg-surface-variant/40 text-on-surface/70'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${st.dot}`} />
                              <span>{st.label}</span>
                            </div>
                            {isSelected && <span className="text-xs font-black">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  ) : field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={formData[field.name] !== undefined ? formData[field.name] : ((field.options && field.options[0]?.value) || '')}
                      onChange={handleChange}
                      className="bg-surface-variant border border-outline/20 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer"
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-surface text-on-surface">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : null}

                  {/* Single Image Upload */}
                  {field.type === 'image' && (
                    <div className="flex flex-col gap-3">
                      {formData[field.name] && (
                        <div className="relative w-full h-52 rounded-xl overflow-hidden border border-outline/20 group bg-black/10">
                          <img
                            src={getDisplayImageUrl(formData[field.name])}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button 
                            type="button"
                            onClick={() => removeSingleImage(field.name)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg transition-transform hover:scale-110"
                            title="Remove Image"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      )}
                      
                      {/* Active Uploads for single image */}
                      {Object.entries(uploadProgress).map(([fileName, prog]) => (
                        <div key={fileName} className="w-full bg-surface-variant rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${prog}%` }}></div>
                        </div>
                      ))}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageSelection(e, field.name, false)}
                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Image Gallery Upload */}
                  {field.type === 'image-gallery' && (
                    <div className="flex flex-col gap-4">
                      {formData[field.name] && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {(Array.isArray(formData[field.name]) ? formData[field.name] : [formData[field.name]]).map((itemVal: any, i: number) => (
                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-outline/20 group">
                              <img src={getDisplayImageUrl(itemVal)} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={() => removeGalleryImage(field.name, i)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg transition-transform hover:scale-110"
                                title="Remove Image"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Active Uploads */}
                      {Object.entries(uploadProgress).map(([fileName, prog]) => (
                        <div key={fileName} className="w-full bg-surface-variant rounded-full h-2 mb-2">
                          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${prog}%` }}></div>
                        </div>
                      ))}

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageSelection(e, field.name, true)}
                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors cursor-pointer"
                      />
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
                {saveStatus === 'saving' ? 'Saving...' : Object.keys(uploadProgress).length > 0 ? 'Uploading...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ItemEditorModal;
