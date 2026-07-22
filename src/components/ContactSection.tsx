import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import InlineEditControls from './admin/InlineEditControls';
import ItemEditorModal from './admin/ItemEditorModal';
import type { FieldConfig } from './admin/ItemEditorModal';

const fallbackContactInfo = {
  address: "Level 88, Monolith Tower\nFinancial District\nLondon, EC2V 5AH",
  phoneDisplay: "+91 86789 10444",
  email: "office@vbassociates.com",
  whatsappPhone: "918678910444",
  facebookUrl: "https://www.facebook.com",
  whatsappUrl: "https://wa.me/918678910444",
  instagramUrl: "https://www.instagram.com/_vickybond_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
};

const contactFields: FieldConfig[] = [
  { name: 'address', label: 'Address', type: 'textarea', required: true },
  { name: 'phoneDisplay', label: 'Display Phone Number', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'text', required: true },
  { name: 'whatsappPhone', label: 'WhatsApp Number (for form submission, no spaces or +)', type: 'text', required: true },
  { name: 'facebookUrl', label: 'Facebook URL', type: 'text' },
  { name: 'whatsappUrl', label: 'WhatsApp URL', type: 'text' },
  { name: 'instagramUrl', label: 'Instagram URL', type: 'text' },
];

const ContactSection: React.FC = () => {
  const { isAdmin } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [inquiry, setInquiry] = useState('');

  const [contactInfo, setContactInfo] = useState<any>(fallbackContactInfo);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'contact', 'info'), (docSnap) => {
      if (docSnap.exists()) {
        setContactInfo({ ...fallbackContactInfo, ...docSnap.data() });
      }
    });
    return () => unsub();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneNumber = contactInfo.whatsappPhone;
    const message = `*New Brief Received*\n*Name:* ${name}\n*Email:* ${email}\n*Inquiry:*\n${inquiry}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEdit = () => {
    setModalOpen(true);
  };

  return (
    <section id="contact" className="relative py-24 md:py-section-gap px-margin-mobile md:px-margin-desktop bg-transparent overflow-hidden">
      <div className="relative z-10 max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-start">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl w-full"
        >
          <h2 className="font-headline-lg text-4xl md:text-headline-lg-mobile lg:text-headline-lg mb-8 md:mb-12 uppercase text-on-surface">CONNECT WITH <span className="text-primary block md:inline">THE BOARD</span></h2>
          <form className="space-y-12" onSubmit={handleSubmit}>
            <div className="relative">
              <label className="block font-label-caps text-2xl text-on-surface-variant mb-4 uppercase">FULL NAME</label>
              <input 
                className="w-full bg-transparent border-0 border-b border-outline py-4 px-0 focus:ring-0 focus:border-primary transition-all text-on-surface font-body-lg placeholder:text-outline focus:outline-none" 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <label className="block font-label-caps text-2xl text-on-surface-variant mb-4 uppercase">CORPORATE EMAIL</label>
              <input 
                className="w-full bg-transparent border-0 border-b border-outline py-4 px-0 focus:ring-0 focus:border-primary transition-all text-on-surface font-body-lg placeholder:text-outline focus:outline-none" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <label className="block font-label-caps text-2xl text-on-surface-variant mb-4 uppercase">NATURE OF INQUIRY</label>
              <textarea 
                className="w-full bg-transparent border-0 border-b border-outline py-4 px-0 focus:ring-0 focus:border-primary transition-all text-on-surface font-body-lg placeholder:text-outline focus:outline-none" 
                rows={3}
                value={inquiry}
                onChange={(e) => setInquiry(e.target.value)}
                required
              ></textarea>
            </div>
            <button className="group flex items-center gap-4 bg-primary text-on-primary px-16 py-6 font-label-caps text-label-caps uppercase hover:bg-primary-hover transition-colors tactical-mask" type="submit">
              SEND BRIEF
              <span className="material-symbols-outlined vertical-drive-arrow">send</span>
            </button>
          </form>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mt-24 md:mt-0 space-y-12 relative group"
        >
          {isAdmin && (
            <div className="absolute -top-12 right-0 z-50">
              <InlineEditControls 
                onEdit={handleEdit} 
              />
            </div>
          )}
          <div className="border border-transparent hover:border-outline/50 p-4 -m-4 rounded-xl transition-colors">
            <div className="mb-12">
              <p className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase">GLOBAL HEADQUARTERS</p>
              <p className="font-body-lg text-body-lg text-on-surface max-w-[280px]">
                {contactInfo.address.split('\n').map((line: string, i: number) => (
                  <React.Fragment key={i}>
                    {line}<br/>
                  </React.Fragment>
                ))}
              </p>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase">CONTACT</p>
              <p className="font-body-lg text-body-lg text-on-surface">
                T: {contactInfo.phoneDisplay}<br/>
                E: {contactInfo.email}
              </p>
            </div>
            <div className="flex gap-6 pt-6 items-center">
              <a className="text-on-surface-variant hover:text-primary transition-all duration-300 flex items-center justify-center w-12 h-12 rounded-full hover:bg-primary/10" href={contactInfo.facebookUrl} target="_blank" rel="noopener noreferrer" title="Facebook">
                <svg viewBox="0 0 320 512" fill="currentColor" className="h-[22px] w-auto">
                  <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
                </svg>
              </a>
              <a className="text-on-surface-variant hover:text-primary transition-all duration-300 flex items-center justify-center w-12 h-12 rounded-full hover:bg-primary/10" href={contactInfo.whatsappUrl} target="_blank" rel="noopener noreferrer" title="WhatsApp">
                <svg viewBox="0 0 448 512" fill="currentColor" className="h-[28px] w-auto">
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                </svg>
              </a>
              <a className="text-on-surface-variant hover:text-primary transition-all duration-300 flex items-center justify-center w-12 h-12 rounded-full hover:bg-primary/10" href={contactInfo.instagramUrl} target="_blank" rel="noopener noreferrer" title="Instagram">
                <svg viewBox="0 0 448 512" fill="currentColor" className="h-[28px] w-auto">
                  <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <ItemEditorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Edit Contact Info"
        collectionName="contact"
        docId="info"
        initialData={contactInfo}
        fields={contactFields}
      />
    </section>
  );
};

export default ContactSection;
