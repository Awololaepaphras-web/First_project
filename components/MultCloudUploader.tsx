import React, { useState } from 'react';
import { Upload, Cloud, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface MultCloudUploaderProps {
  userId: string;
}

const MultCloudUploader: React.FC<MultCloudUploaderProps> = ({ userId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus(null);

    try {
      // 1. Upload to temporary Supabase bucket
      const tempPath = `temp/${userId}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('temp_uploads')
        .upload(tempPath, file);

      if (uploadError) throw uploadError;

      // 2. Call Supabase Edge Function to transfer to MultCloud
      const { data: functionData, error: functionError } = await supabase.functions.invoke('multcloud-storage-bridge', {
        body: {
          bucket: 'temp_uploads',
          path: tempPath,
          destination: 'google_drive:/proph_uploads' // Example destination
        }
      });

      if (functionError) throw functionError;

      setStatus({ type: 'success', message: 'File successfully transferred to MultCloud!' });
      setFile(null);
    } catch (err: any) {
      console.error('Upload Error:', err);
      setStatus({ type: 'error', message: err.message || 'Failed to transfer file.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-900 rounded-[3rem] border border-gray-800 space-y-6 shadow-2xl">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500">
          <Cloud className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">MultCloud Bridge</h3>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Scalable Storage Integration</p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block w-full p-10 border-2 border-dashed border-gray-800 rounded-[2rem] hover:border-blue-500/50 transition-all cursor-pointer text-center group">
          <input 
            type="file" 
            className="hidden" 
            onChange={(e) => setFile(e.target.files?.[0] || null)} 
          />
          <div className="space-y-2">
            <Upload className="w-10 h-10 text-gray-600 mx-auto group-hover:text-blue-500 transition-colors" />
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
              {file ? file.name : 'Select Asset for Matrix Transfer'}
            </p>
          </div>
        </label>

        {file && (
          <button 
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Transferring to MultCloud...
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4" />
                Initiate Bridge Transfer
              </>
            )}
          </button>
        )}

        {status && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 animate-fade-in ${
            status.type === 'success' ? 'bg-green-600/10 text-green-500 border border-green-500/20' : 'bg-red-600/10 text-red-500 border border-red-500/20'
          }`}>
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <p className="text-[10px] font-black uppercase tracking-widest">{status.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultCloudUploader;
