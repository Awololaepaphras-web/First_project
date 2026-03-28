
import React, { useState, useRef } from 'react';
import { User as UserIcon, Camera, Save, ArrowLeft, ShieldCheck, Mail, Phone, Building, AtSign, Loader2, Download } from 'lucide-react';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import { CloudinaryService } from '../src/services/cloudinaryService';
import { usePWA } from '../src/hooks/usePWA';

interface SettingsProps {
  user: User;
  onUpdateUser: (updated: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isInstallable, installPWA } = usePWA();
  const [formData, setFormData] = useState({
    name: user.name,
    nickname: user.nickname || '',
    level: user.level,
    profilePicture: user.profilePicture || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const imageUrl = await CloudinaryService.uploadFile(file, 'image');
        setFormData({ ...formData, profilePicture: imageUrl });
      } catch (error) {
        console.error('Profile picture upload failed:', error);
        alert('Failed to upload profile picture.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = () => {
    if (isUploading) return alert('Asset still synchronizing...');
    setIsSaving(true);
    setTimeout(() => {
      onUpdateUser({ ...user, ...formData });
      setIsSaving(false);
      alert("Matrix Signature Updated.");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-black py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-gray-900 dark:hover:text-white font-black text-[10px] uppercase tracking-widest" title="Go Back">
            <ArrowLeft className="w-4 h-4" /> Back to Core
          </button>
          
          {isInstallable && (
            <button 
              onClick={installPWA}
              className="flex items-center gap-2 bg-brand-proph/10 text-brand-proph px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-proph/20 transition-all"
              title="Download PWA"
            >
              <Download className="w-4 h-4" /> Download App
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-brand-card rounded-[3rem] shadow-2xl border border-gray-100 dark:border-brand-border overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-green-600 to-emerald-600 relative">
             <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 sm:left-10 sm:translate-x-0 p-1 bg-white dark:bg-brand-card rounded-full">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-brand-black group border-4 border-white dark:border-brand-card shadow-xl">
                   {formData.profilePicture ? <img src={formData.profilePicture} className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-8 text-gray-300 dark:text-brand-muted" />}
                   <button disabled={isUploading} onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white disabled:opacity-50" title="Change Avatar">
                     {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8" />}
                   </button>
                   <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                </div>
             </div>
          </div>

          <div className="pt-20 sm:pt-24 p-6 sm:p-10 space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
               <div>
                  <h2 className="text-3xl font-black text-black dark:text-white uppercase italic tracking-tighter">Account Configuration</h2>
                  <p className="text-gray-500 dark:text-brand-muted font-bold italic text-xs uppercase tracking-widest">Synchronize your scholarly identity.</p>
               </div>
               <button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto bg-green-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 shadow-xl flex items-center justify-center gap-2" title="Commit Changes">
                 {isSaving ? 'Processing...' : <><Save className="w-4 h-4" /> Save Identity</>}
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-black dark:text-white uppercase tracking-widest px-1">Display Node Name</label>
                    <input 
                      className="w-full bg-gray-50 dark:bg-brand-black border border-gray-200 dark:border-brand-border p-5 rounded-2xl outline-none focus:ring-1 focus:ring-green-500 font-bold text-black dark:text-white" 
                      value={formData.name} 
                      onChange={e => {
                        const val = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '');
                        setFormData({...formData, name: val});
                      }} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-black dark:text-white uppercase tracking-widest px-1 flex items-center gap-2"><AtSign className="w-3 h-3" /> Social Nickname</label>
                    <input 
                      className="w-full bg-gray-50 dark:bg-brand-black border border-gray-200 dark:border-brand-border p-5 rounded-2xl outline-none focus:ring-1 focus:ring-green-500 font-bold text-black dark:text-white" 
                      value={formData.nickname} 
                      placeholder="unique_node" 
                      onChange={e => {
                        const val = e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
                        setFormData({...formData, nickname: val});
                      }} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-black dark:text-white uppercase tracking-widest px-1">Academic Level Pointer</label>
                    <select className="w-full bg-gray-50 dark:bg-brand-black border border-gray-200 dark:border-brand-border p-5 rounded-2xl outline-none focus:ring-1 focus:ring-green-500 font-bold text-black dark:text-white text-xs uppercase appearance-none" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                      {['100', '200', '300', '400', '500', '600', 'Postgrad'].map(l => <option key={l} value={l} className="dark:bg-brand-black">{l} Level Node</option>)}
                    </select>
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="p-8 bg-gray-950 rounded-[2.5rem] border border-gray-800 space-y-6 shadow-inner">
                     <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Permanent Node Details</p>
                     <div className="space-y-4 text-white font-bold text-xs uppercase italic tracking-tighter">
                        <div className="flex items-center gap-4 text-gray-400"><Mail className="w-4 h-4 text-green-500" /> {user.email || 'N/A'}</div>
                        <div className="flex items-center gap-4 text-gray-400"><ShieldCheck className="w-4 h-4 text-green-500" /> Proph ID: {user.referralCode}</div>
                        <div className="flex items-center gap-4 text-gray-400"><Building className="w-4 h-4 text-green-500" /> {user.university} Integrated Node</div>
                     </div>
                  </div>

                  <div className="p-8 bg-brand-proph/10 rounded-[2.5rem] border border-brand-proph/20 space-y-4">
                     <p className="text-[10px] font-black text-brand-proph uppercase tracking-widest">Appearance</p>
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-widest dark:text-white">Light Mode</span>
                        <button 
                          onClick={() => {
                            const isDark = document.documentElement.classList.contains('dark');
                            if (isDark) {
                              document.documentElement.classList.remove('dark');
                              localStorage.setItem('proph_theme', 'light');
                            } else {
                              document.documentElement.classList.add('dark');
                              localStorage.setItem('proph_theme', 'dark');
                            }
                            // Force re-render if needed, but class manipulation is usually enough
                            window.location.reload(); // Simplest way to ensure all components react to theme change since we removed the state-based toggle from Layout
                          }}
                          className={`w-12 h-6 rounded-full transition-all relative ${!document.documentElement.classList.contains('dark') ? 'bg-brand-proph' : 'bg-gray-600'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${!document.documentElement.classList.contains('dark') ? 'left-7' : 'left-1'}`} />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
