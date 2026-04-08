import React, { useState, useRef } from 'react';
import { 
  User as UserIcon, Camera, Save, ArrowLeft, ShieldCheck, 
  Mail, Phone, Building, AtSign, Loader2, Download,
  Bell, Lock, Smartphone, Database, HelpCircle, LogOut,
  ChevronRight, Palette, Globe, Moon, Sun
} from 'lucide-react';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import { CloudinaryService } from '../src/services/cloudinaryService';
import { usePWA } from '../src/hooks/usePWA';

interface SettingsProps {
  user: User;
  onUpdateUser: (updated: User) => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, onLogout }) => {
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
  const [activeSection, setActiveSection] = useState<'main' | 'profile' | 'account' | 'privacy' | 'chats' | 'notifications' | 'help'>('main');

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
      setActiveSection('main');
    }, 1000);
  };

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('proph_theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('proph_theme', 'dark');
    }
    window.location.reload();
  };

  const menuItems = [
    { id: 'account', label: 'Account', sub: 'Security notifications, change number', icon: <Lock className="w-5 h-5 text-gray-500" /> },
    { id: 'privacy', label: 'Privacy', sub: 'Block contacts, disappearing messages', icon: <ShieldCheck className="w-5 h-5 text-gray-500" /> },
    { id: 'chats', label: 'Chats', sub: 'Theme, wallpapers, chat history', icon: <Palette className="w-5 h-5 text-gray-500" /> },
    { id: 'notifications', label: 'Notifications', sub: 'Message, group & call tones', icon: <Bell className="w-5 h-5 text-gray-500" /> },
    { id: 'storage', label: 'Storage and Data', sub: 'Network usage, auto-download', icon: <Database className="w-5 h-5 text-gray-500" /> },
    { id: 'help', label: 'Help', sub: 'Help center, contact us, privacy policy', icon: <HelpCircle className="w-5 h-5 text-gray-500" /> },
  ];

  if (activeSection === 'profile') {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-brand-black">
        <header className="bg-brand-proph p-6 pt-12 flex items-center gap-6 text-black">
          <button onClick={() => setActiveSection('main')} className="p-1 hover:bg-black/10 rounded-full transition-all">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-black uppercase tracking-tight">Profile</h2>
        </header>

        <main className="max-w-xl mx-auto p-6 space-y-8">
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white dark:border-brand-card shadow-xl bg-gray-200 dark:bg-brand-card">
                {formData.profilePicture ? (
                  <img src={formData.profilePicture} className="w-full h-full object-cover" alt="" />
                ) : (
                  <UserIcon className="w-full h-full p-12 text-gray-400" />
                )}
              </div>
              <button 
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 p-4 bg-brand-proph text-black rounded-full shadow-xl hover:scale-110 transition-all disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
              </button>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-brand-card p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-4 text-brand-proph">
                <UserIcon className="w-5 h-5" />
                <div className="flex-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Name</label>
                  <input 
                    className="w-full bg-transparent border-none outline-none font-bold text-gray-900 dark:text-white p-0" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <Save className="w-4 h-4 opacity-50" />
              </div>
              <p className="text-[10px] text-gray-500 italic ml-9">This is not your username or pin. This name will be visible to your Proph contacts.</p>
            </div>

            <div className="bg-white dark:bg-brand-card p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-4 text-brand-proph">
                <AtSign className="w-5 h-5" />
                <div className="flex-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Nickname</label>
                  <input 
                    className="w-full bg-transparent border-none outline-none font-bold text-gray-900 dark:text-white p-0" 
                    value={formData.nickname} 
                    onChange={e => setFormData({...formData, nickname: e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '')})}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-brand-card p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-4 text-brand-proph">
                <Building className="w-5 h-5" />
                <div className="flex-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Academic Level</label>
                  <select 
                    className="w-full bg-transparent border-none outline-none font-bold text-gray-900 dark:text-white p-0 appearance-none" 
                    value={formData.level} 
                    onChange={e => setFormData({...formData, level: e.target.value})}
                  >
                    {['100', '200', '300', '400', '500', '600', 'Postgrad'].map(l => <option key={l} value={l}>{l} Level</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-4 bg-brand-proph text-black font-black rounded-2xl uppercase tracking-widest shadow-xl shadow-brand-proph/20 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {isSaving ? 'Synchronizing...' : 'Save Profile'}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-brand-black">
      <header className="bg-white dark:bg-brand-black border-b border-brand-border p-6 pt-12 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-brand-card rounded-full transition-all">
            <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
          </button>
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">Settings</h2>
        </div>
        {isInstallable && (
          <button onClick={installPWA} className="p-2 bg-brand-proph/10 text-brand-proph rounded-full hover:bg-brand-proph/20 transition-all">
            <Download className="w-5 h-5" />
          </button>
        )}
      </header>

      <main className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <button 
          onClick={() => setActiveSection('profile')}
          className="w-full p-6 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-brand-card transition-all border-b border-brand-border"
        >
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-brand-black border border-brand-border">
            {user.profilePicture ? (
              <img src={user.profilePicture} className="w-full h-full object-cover" alt="" />
            ) : (
              <UserIcon className="w-full h-full p-4 text-gray-400" />
            )}
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-black text-lg text-gray-900 dark:text-white">{user.name}</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest italic">@{user.nickname || 'node'}</p>
          </div>
          <div className="p-2 bg-brand-proph/10 text-brand-proph rounded-full">
            <ChevronRight className="w-5 h-5" />
          </div>
        </button>

        {/* Menu Items */}
        <div className="mt-2">
          {menuItems.map((item) => (
            <button 
              key={item.id}
              className="w-full p-6 flex items-center gap-6 hover:bg-gray-50 dark:hover:bg-brand-card transition-all group"
            >
              <div className="p-2 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{item.label}</h4>
                <p className="text-xs text-gray-500">{item.sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Theme Toggle */}
        <div className="mt-4 border-t border-brand-border">
          <button 
            onClick={toggleTheme}
            className="w-full p-6 flex items-center gap-6 hover:bg-gray-50 dark:hover:bg-brand-card transition-all"
          >
            <div className="p-2">
              {document.documentElement.classList.contains('dark') ? <Sun className="w-5 h-5 text-gray-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">Appearance</h4>
              <p className="text-xs text-gray-500">Switch between light and dark mode</p>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-all ${document.documentElement.classList.contains('dark') ? 'bg-brand-proph' : 'bg-gray-300'}`}>
              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${document.documentElement.classList.contains('dark') ? 'right-1' : 'left-1'}`} />
            </div>
          </button>
        </div>

        {/* Logout */}
        <div className="mt-4 border-t border-brand-border pb-20">
          <button 
            onClick={onLogout}
            className="w-full p-6 flex items-center gap-6 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-red-500"
          >
            <div className="p-2">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-black uppercase tracking-widest text-sm">Terminate Session</h4>
              <p className="text-[10px] opacity-70">Disconnect from the academic matrix</p>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
