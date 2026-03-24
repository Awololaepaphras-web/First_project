
import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Trash2, CheckCircle2, Loader2, Shield } from 'lucide-react';
import { CloudinaryService } from '../src/services/cloudinaryService';

interface AdminBrandingProps {
  onUpdateLogo: (logoUrl: string) => void;
  onUpdateIcon: (iconUrl: string) => void;
}

const AdminBranding: React.FC<AdminBrandingProps> = ({ onUpdateLogo, onUpdateIcon }) => {
  const [currentLogo, setCurrentLogo] = useState<string>(localStorage.getItem('proph_app_logo') || '');
  const [currentIcon, setCurrentIcon] = useState<string>(localStorage.getItem('proph_app_icon') || '');
  const [previewLogo, setPreviewLogo] = useState<string>('');
  const [previewIcon, setPreviewIcon] = useState<string>('');
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [selectedIconFile, setSelectedIconFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewIcon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLogo = async () => {
    if (selectedLogoFile) {
      setIsUploadingLogo(true);
      try {
        const logoUrl = await CloudinaryService.uploadFile(selectedLogoFile, 'image');
        localStorage.setItem('proph_app_logo', logoUrl);
        setCurrentLogo(logoUrl);
        onUpdateLogo(logoUrl);
        setPreviewLogo('');
        setSelectedLogoFile(null);
        alert("App Logo Updated Successfully.");
      } catch (error) {
        console.error('Logo upload failed:', error);
        alert('Failed to upload logo. Please try again.');
      } finally {
        setIsUploadingLogo(false);
      }
    }
  };

  const handleSaveIcon = async () => {
    if (selectedIconFile) {
      setIsUploadingIcon(true);
      try {
        const iconUrl = await CloudinaryService.uploadFile(selectedIconFile, 'image');
        localStorage.setItem('proph_app_icon', iconUrl);
        setCurrentIcon(iconUrl);
        onUpdateIcon(iconUrl);
        setPreviewIcon('');
        setSelectedIconFile(null);
        alert("App Icon Updated Successfully.");
      } catch (error) {
        console.error('Icon upload failed:', error);
        alert('Failed to upload icon. Please try again.');
      } finally {
        setIsUploadingIcon(false);
      }
    }
  };

  const handleRemoveLogo = () => {
    localStorage.removeItem('proph_app_logo');
    setCurrentLogo('');
    onUpdateLogo('');
    alert("App Logo Removed.");
  };

  const handleRemoveIcon = () => {
    localStorage.removeItem('proph_app_icon');
    setCurrentIcon('');
    onUpdateIcon('');
    alert("App Icon Removed.");
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-4xl pb-20">
      <h1 className="text-4xl font-black tracking-tighter uppercase italic">App Branding</h1>
      
      {/* Logo Section */}
      <div className="bg-gray-900 p-10 rounded-[3rem] border border-gray-800 space-y-8 shadow-2xl">
        <div className="space-y-4">
          <h3 className="text-xl font-black text-white flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-blue-500" /> Application Logo
          </h3>
          <p className="text-gray-500 text-sm font-medium italic">
            This logo will appear in the header and other key areas of the application.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-48 h-48 bg-gray-950 rounded-full border border-gray-800 flex items-center justify-center overflow-hidden relative group">
            {previewLogo || currentLogo ? (
              <img src={previewLogo || currentLogo} alt="App Logo" className="w-full h-full object-contain p-4" />
            ) : (
              <div className="text-gray-700 flex flex-col items-center gap-2">
                <ImageIcon className="w-12 h-12" />
                <span className="text-[10px] font-black uppercase">No Logo</span>
              </div>
            )}
            {(previewLogo || currentLogo) && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button onClick={() => logoInputRef.current?.click()} className="p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all">
                  <Upload className="w-5 h-5" />
                </button>
                <button onClick={handleRemoveLogo} className="p-3 bg-red-600/20 rounded-xl text-red-500 hover:bg-red-600 hover:text-white transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-grow space-y-6">
            <div className="p-6 bg-gray-950/50 rounded-2xl border border-gray-800 border-dashed">
              <p className="text-xs text-gray-400 font-medium mb-4 italic">Recommended: Square PNG or SVG with transparent background.</p>
              <button 
                onClick={() => logoInputRef.current?.click()}
                className="w-full py-4 bg-gray-800 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" /> {previewLogo ? 'Change Selection' : 'Upload New Logo'}
              </button>
              <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={handleLogoSelect} />
            </div>

            {previewLogo && (
              <button 
                onClick={handleSaveLogo}
                disabled={isUploadingLogo}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 animate-pulse disabled:opacity-50 disabled:animate-none"
              >
                {isUploadingLogo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Synchronizing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Apply Logo Changes
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Icon Section */}
      <div className="bg-gray-900 p-10 rounded-[3rem] border border-gray-800 space-y-8 shadow-2xl">
        <div className="space-y-4">
          <h3 className="text-xl font-black text-white flex items-center gap-3">
            <Shield className="w-5 h-5 text-purple-500" /> Application Icon (Favicon)
          </h3>
          <p className="text-gray-500 text-sm font-medium italic">
            This icon will appear in the browser tab and as the home screen icon on mobile devices.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-32 h-32 bg-gray-950 rounded-2xl border border-gray-800 flex items-center justify-center overflow-hidden relative group">
            {previewIcon || currentIcon ? (
              <img src={previewIcon || currentIcon} alt="App Icon" className="w-full h-full object-contain p-2" />
            ) : (
              <div className="text-gray-700 flex flex-col items-center gap-2">
                <Shield className="w-8 h-8" />
                <span className="text-[8px] font-black uppercase">No Icon</span>
              </div>
            )}
            {(previewIcon || currentIcon) && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button onClick={() => iconInputRef.current?.click()} className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all">
                  <Upload className="w-4 h-4" />
                </button>
                <button onClick={handleRemoveIcon} className="p-2 bg-red-600/20 rounded-lg text-red-500 hover:bg-red-600 hover:text-white transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-grow space-y-6">
            <div className="p-6 bg-gray-950/50 rounded-2xl border border-gray-800 border-dashed">
              <p className="text-xs text-gray-400 font-medium mb-4 italic">Recommended: 192x192 or 512x512 PNG.</p>
              <button 
                onClick={() => iconInputRef.current?.click()}
                className="w-full py-4 bg-gray-800 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" /> {previewIcon ? 'Change Selection' : 'Upload New Icon'}
              </button>
              <input type="file" ref={iconInputRef} hidden accept="image/*" onChange={handleIconSelect} />
            </div>

            {previewIcon && (
              <button 
                onClick={handleSaveIcon}
                disabled={isUploadingIcon}
                className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 animate-pulse disabled:opacity-50 disabled:animate-none"
              >
                {isUploadingIcon ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Synchronizing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Apply Icon Changes
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-600/10 p-8 rounded-[2rem] border border-blue-500/20">
        <h4 className="text-blue-400 font-black uppercase text-xs mb-2">Branding Tip</h4>
        <p className="text-gray-400 text-xs font-medium italic leading-relaxed">
          Consistent branding builds trust. Ensure your logo is clear and legible at small sizes, as it will be used in the footer navigation.
        </p>
      </div>
    </div>
  );
};

export default AdminBranding;
