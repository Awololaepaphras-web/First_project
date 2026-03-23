
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Trash2, CheckCircle2 } from 'lucide-react';

interface AdminBrandingProps {
  onUpdateLogo: (logoUrl: string) => void;
}

const AdminBranding: React.FC<AdminBrandingProps> = ({ onUpdateLogo }) => {
  const [currentLogo, setCurrentLogo] = useState<string>(localStorage.getItem('proph_app_logo') || '/logo.png');
  const [previewLogo, setPreviewLogo] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (previewLogo) {
      localStorage.setItem('proph_app_logo', previewLogo);
      setCurrentLogo(previewLogo);
      onUpdateLogo(previewLogo);
      setPreviewLogo('');
      alert("App Logo Updated Successfully.");
    }
  };

  const handleRemove = () => {
    localStorage.removeItem('proph_app_logo');
    setCurrentLogo('');
    onUpdateLogo('');
    alert("App Logo Removed.");
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-4xl">
      <h1 className="text-4xl font-black tracking-tighter uppercase italic">App Branding</h1>
      
      <div className="bg-gray-900 p-10 rounded-[3rem] border border-gray-800 space-y-8 shadow-2xl">
        <div className="space-y-4">
          <h3 className="text-xl font-black text-white flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-blue-500" /> Application Logo
          </h3>
          <p className="text-gray-500 text-sm font-medium italic">
            This logo will appear in the footer and other key areas of the application.
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
                <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all">
                  <Upload className="w-5 h-5" />
                </button>
                <button onClick={handleRemove} className="p-3 bg-red-600/20 rounded-xl text-red-500 hover:bg-red-600 hover:text-white transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-grow space-y-6">
            <div className="p-6 bg-gray-950/50 rounded-2xl border border-gray-800 border-dashed">
              <p className="text-xs text-gray-400 font-medium mb-4 italic">Recommended: Square PNG or SVG with transparent background.</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 bg-gray-800 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" /> {previewLogo ? 'Change Selection' : 'Upload New Logo'}
              </button>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileSelect} />
            </div>

            {previewLogo && (
              <button 
                onClick={handleSave}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 animate-pulse"
              >
                <CheckCircle2 className="w-4 h-4" /> Apply Changes
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
