import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import { db } from '../../firebase';
import { doc, addDoc, setDoc, collection, deleteField } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

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
      console.log("Saving formData to Firestore:", formData);
      const targetId = activeDocId.current || docId;
      console.log("targetId:", targetId);
      
      const savePromise = (async () => {
        if (targetId) {
          await setDoc(doc(db, collectionName, targetId), formData, { merge: true });
          if (!activeDocId.current) activeDocId.current = targetId;
        } else {
          const newDoc = await addDoc(collection(db, collectionName), formData);
          activeDocId.current = newDoc.id;
          console.log("Created new doc:", newDoc.id);
        }
      })();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Save operation timed out. Please check your Firebase Firestore rules and ensure your database is created.")), 8000);
      });

      await Promise.race([savePromise, timeoutPromise]);

      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
        if(onSuccess) onSuccess();
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

  const handleImageUpload = async (file: File, fieldName: string, isGallery: boolean) => {
    try {
      setError(null);
      setUploadProgress(prev => ({ ...prev, [file.name]: 10 }));

      // Compress image before upload
      const options = {
        maxSizeMB: 1, // Compress to max 1MB
        maxWidthOrHeight: 1920, // Max HD resolution
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(file, options);

      const formDataToUpload = new FormData();
      formDataToUpload.append('file', compressedFile);
      formDataToUpload.append('upload_preset', 'vbassociate');

      // Simulate upload progress since fetch doesn't support progress events natively
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[file.name] || 10;
          return current >= 90 ? prev : { ...prev, [file.name]: current + 15 };
        });
      }, 300);

      const response = await fetch(`https://api.cloudinary.com/v1_1/dgssrfsli/image/upload`, {
        method: 'POST',
        body: formDataToUpload,
      });

      clearInterval(interval);

      if (!response.ok) {
        throw new Error('Failed to upload image.');
      }

      const data = await response.json();
      const downloadURL = data.secure_url;

      setUploadProgress(prev => { const n = {...prev}; delete n[file.name]; return n; });
      
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-outline/20 overflow-hidden flex flex-col max-h-[90vh]"
          >
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

                  {field.type === 'image' && (
                    <div className="flex flex-col gap-3">
                      {formData[field.name] && (
                        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-outline/20 group">
                          <img src={formData[field.name]} alt="Preview" className="w-full h-full object-cover" />
                          <button 
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

                  {field.type === 'image-gallery' && (
                    <div className="flex flex-col gap-4">
                      {formData[field.name] && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {(Array.isArray(formData[field.name]) ? formData[field.name] : [formData[field.name]]).map((url: string, i: number) => (
                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-outline/20 group">
                              <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                              <button 
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
