
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Tv, CheckCircle2, ArrowLeft, Video as VideoIcon, Image as ImageIcon, DollarSign, FileText } from 'lucide-react';
import { User, Video } from '../types';

interface VideoUploadProps {
  user: User;
  onUpload: (video: Video) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ user, onUpload }) => {
  const navigate = useNavigate();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    dolzTag: '',
    videoUrl: '',
    thumbnailUrl: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'thumb') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'video') setFormData({...formData, videoUrl: reader.result as string});
        else setFormData({...formData, thumbnailUrl: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.videoUrl || !formData.thumbnailUrl) return alert("All transmissions require media assets.");
    
    // Ensure dolzTag has $
    const tag = formData.dolzTag.startsWith('$') ? formData.dolzTag : `$${formData.dolzTag}`;

    const newVideo: Video = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      title: formData.title,
      thumbnailUrl: formData.thumbnailUrl,
      videoUrl: formData.videoUrl,
      duration: 120, // Simulated duration
      views: 0,
      likes: [],
      shares: 0,
      dolzTag: tag,
      description: formData.description,
      createdAt: Date.now(),
      category: formData.category
    };

    onUpload(newVideo);
    setStatus('success');
    setTimeout(() => navigate('/video-hub'), 2000);
  };

  return (
    <div className="bg-brand-black min-h-screen text-white py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-brand-muted hover:text-white font-black text-[11px] uppercase tracking-widest transition-all">
          <ArrowLeft className="w-4 h-4" /> Node Return
        </button>

        <div className="bg-brand-card rounded-[4rem] border border-brand-border overflow-hidden shadow-2xl">
           <div className="bg-brand-proph p-12 text-black flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10"><Tv className="w-64 h-64" /></div>
              <div className="relative z-10">
                 <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Initialize TV Transmission</h1>
                 <p className="font-bold opacity-80 mt-2 italic">Broadcast scholarly visual intel across the grid.</p>
              </div>
              <div className="bg-black/10 p-5 rounded-3xl border border-black/10 relative z-10">
                 <VideoIcon className="w-10 h-10" />
              </div>
           </div>

           <div className="p-12">
             {status === 'success' ? (
               <div className="py-20 text-center animate-zoom-in space-y-6">
                  <div className="w-24 h-24 bg-brand-proph/20 rounded-full flex items-center justify-center mx-auto border border-brand-proph/30">
                    <CheckCircle2 className="w-12 h-12 text-brand-proph animate-bounce" />
                  </div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">Transmission Synced</h2>
                  <p className="text-brand-muted font-medium italic">Asset deployed to Proph TV grid.</p>
               </div>
             ) : (
               <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Transmission Title</label>
                           <input required className="w-full bg-brand-black border border-brand-border p-5 rounded-2xl focus:ring-1 focus:ring-brand-proph outline-none font-bold italic" placeholder="e.g. MAT 101: Linear Algebra Breakdown" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Archive Segment</label>
                           <select className="w-full bg-brand-black border border-brand-border p-5 rounded-2xl font-black uppercase text-xs outline-none focus:ring-1 focus:ring-brand-proph" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                              {['General', 'Mathematics', 'Engineering', 'Campus Life', 'Social', 'Medicine'].map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1 flex items-center gap-2"><DollarSign className="w-3 h-3" /> Dolz Creator Tag</label>
                           <input required className="w-full bg-brand-black border border-brand-border p-5 rounded-2xl focus:ring-1 focus:ring-brand-proph outline-none font-black tracking-widest" placeholder="e.g. elite_scholar" value={formData.dolzTag} onChange={e => setFormData({...formData, dolzTag: e.target.value})} />
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1 flex items-center gap-2"><FileText className="w-3 h-3" /> Description</label>
                           <textarea rows={6} className="w-full bg-brand-black border border-brand-border p-5 rounded-2xl focus:ring-1 focus:ring-brand-proph outline-none font-medium italic resize-none" placeholder="Elaborate on the academic content..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <button type="button" onClick={() => videoInputRef.current?.click()} className={`p-10 border-2 border-dashed rounded-[3rem] transition-all flex flex-col items-center gap-4 ${formData.videoUrl ? 'border-brand-proph bg-brand-proph/5 text-brand-proph' : 'border-brand-border text-brand-muted hover:bg-white/5'}`}>
                        <VideoIcon className="w-10 h-10" />
                        <span className="font-black uppercase text-[10px] tracking-widest">{formData.videoUrl ? 'Video Stream Synced' : 'Select Video Source'}</span>
                        <input type="file" ref={videoInputRef} hidden accept="video/*" onChange={e => handleFileChange(e, 'video')} />
                     </button>
                     <button type="button" onClick={() => thumbInputRef.current?.click()} className={`p-10 border-2 border-dashed rounded-[3rem] transition-all flex flex-col items-center gap-4 ${formData.thumbnailUrl ? 'border-brand-proph bg-brand-proph/5 text-brand-proph' : 'border-brand-border text-brand-muted hover:bg-white/5'}`}>
                        <ImageIcon className="w-10 h-10" />
                        <span className="font-black uppercase text-[10px] tracking-widest">{formData.thumbnailUrl ? 'Thumbnail Snapshot Locked' : 'Upload Display Frame'}</span>
                        <input type="file" ref={thumbInputRef} hidden accept="image/*" onChange={e => handleFileChange(e, 'thumb')} />
                     </button>
                  </div>

                  <button type="submit" className="w-full bg-brand-proph text-black py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-xl hover:brightness-110 active:scale-95 transition-all">
                     Deploy Transmission
                  </button>
               </form>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;
