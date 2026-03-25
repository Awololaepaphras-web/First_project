
import React, { useState, useRef } from 'react';
import { 
  Upload, FilePlus, ShieldCheck, CheckCircle2, ArrowLeft, Info, 
  Database, Globe, BookOpen, Trophy, Zap, Lock, ShieldAlert, 
  Camera, FileText, Image as ImageIcon, X, Smartphone, Trash2, ChevronDown,
  AlertTriangle, UserPlus
} from 'lucide-react';
import { PastQuestion } from '../types';
import { UNIVERSITIES, COMMON_FACULTIES } from '../constants';
import { useNavigate, Link } from 'react-router-dom';
import { CloudinaryService } from '../src/services/cloudinaryService';
import { Loader2 } from 'lucide-react';

interface AnonymousUploadProps {
  isEnabled: boolean;
  onUpload: (q: PastQuestion) => void;
  universityColleges: Record<string, string[]>;
  collegeDepartments: Record<string, string[]>;
}

const AnonymousUpload: React.FC<AnonymousUploadProps> = ({ isEnabled, onUpload, universityColleges, collegeDepartments }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<{ data: string; file: File; name: string; type: string }[]>([]);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success'>('idle');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2010 + 1 }, (_, i) => currentYear - i);

  const [formData, setFormData] = useState({
    universityId: 'ui',
    courseCode: '',
    courseTitle: '',
    year: currentYear,
    semester: 'First' as 'First' | 'Second',
    faculty: '', 
    department: '',
    level: '100',
    description: '',
    type: 'document' as 'document' | 'image'
  });

  const isSpecializedUni = !!universityColleges[formData.universityId];
  const unitLabel = formData.universityId === 'funaab' ? 'College' : 'Faculty';
  const facultyOptions = isSpecializedUni ? universityColleges[formData.universityId] || [] : COMMON_FACULTIES;
  const departmentOptions = formData.faculty ? collegeDepartments[formData.faculty] || [] : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFiles(prev => [...prev, { data: reader.result as string, file, name: file.name, type: file.type }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFacultyChange = (val: string) => {
    setFormData({ ...formData, faculty: val, department: '' });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEnabled) return;
    if (selectedFiles.length === 0) return alert('Material Missing: Attach file or snap document.');
    if (!formData.faculty || !formData.department) return alert('Unit Sync Required: Select Faculty and Dept.');

    setStatus('uploading');

    try {
      // Upload to Cloudinary
      const uploadPromises = selectedFiles.map(fileObj => 
        CloudinaryService.uploadFile(fileObj.file, formData.type === 'image' ? 'image' : 'raw')
      );
      
      const uploadedUrls = await Promise.all(uploadPromises);

      const newQuestion: PastQuestion = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        fileUrl: uploadedUrls[0], 
        status: 'approved', // Forceful visibility
        visibility: 'public', // Forceful visibility
        uploadedBy: 'anonymous',
        createdAt: Date.now()
      };

      onUpload(newQuestion);
      setStatus('success');
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please check your connection and try again.');
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white py-16 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto space-y-12">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 text-brand-muted hover:text-brand-proph font-black text-[11px] uppercase tracking-[0.2em] transition-all" title="Return Home">
          <ArrowLeft className="w-4 h-4" /> Return Home
        </button>

        <div className="bg-brand-card rounded-[4rem] shadow-2xl overflow-hidden border border-brand-border">
          <div className="bg-yellow-500 p-12 text-black relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-black/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex items-center gap-6 mb-6">
              <div className="bg-black/10 p-4 rounded-3xl backdrop-blur-xl border border-black/10">
                <Database className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight uppercase italic leading-none">Anonymous Submission</h1>
                <p className="font-bold opacity-80 italic">Contribute to the federal academic grid anonymously.</p>
              </div>
            </div>
            <div className="bg-black/10 p-5 rounded-2xl border border-black/10 flex items-center gap-3">
               <AlertTriangle className="w-5 h-5 text-black" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em]">Public Data-Entry Port (No Rewards)</p>
            </div>
          </div>

          <div className="p-12">
            {status === 'uploading' ? (
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-brand-proph/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-brand-proph/20 shadow-inner">
                  <Loader2 className="w-16 h-16 text-brand-proph animate-spin" />
                </div>
                <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic">Uploading Intel</h2>
                <p className="text-brand-muted font-medium text-lg max-w-sm mx-auto italic">Synchronizing with Cloudinary nodes. Please wait...</p>
              </div>
            ) : status === 'success' ? (
              <div className="text-center py-20 animate-zoom-in">
                <div className="w-32 h-32 bg-brand-proph/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-brand-proph/20 shadow-inner">
                  <CheckCircle2 className="w-16 h-16 text-brand-proph animate-bounce" />
                </div>
                <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic">Asset Synchronized</h2>
                <p className="text-brand-muted font-medium text-lg max-w-sm mx-auto italic">Thank you for your contribution! Intel pending board verification.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Warning Note */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6">
                  <div className="bg-yellow-500/20 p-4 rounded-2xl">
                    <ShieldAlert className="w-8 h-8 text-yellow-500" />
                  </div>
                  <div className="flex-grow text-center md:text-left">
                    <p className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-1">Attention Contributor</p>
                    <p className="text-brand-muted text-sm font-medium italic">
                      No rewards or points will be awarded for anonymous submissions. To earn rewards for your contributions, please <Link to="/login" className="text-brand-proph underline font-black">Login</Link> or <Link to="/signup" className="text-brand-proph underline font-black">Create an Account</Link>.
                    </p>
                  </div>
                  <Link to="/signup" className="bg-yellow-500 text-black font-black px-8 py-4 rounded-full text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-xl flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Get Rewards
                  </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">Target Institution</label>
                      <select className="w-full bg-brand-black border border-brand-border p-5 rounded-2xl font-black uppercase text-xs text-white outline-none focus:ring-1 focus:ring-brand-proph transition-all" value={formData.universityId} onChange={e => setFormData({...formData, universityId: e.target.value, faculty: '', department: ''})}>
                        {UNIVERSITIES.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">Format Node</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setFormData({...formData, type: 'document'})} className={`p-5 rounded-2xl flex flex-col items-center gap-2 transition-all border-2 ${formData.type === 'document' ? 'bg-brand-proph text-black border-brand-proph shadow-xl shadow-brand-proph/20' : 'bg-brand-black text-brand-muted border-brand-border hover:border-brand-proph/30'}`} title="PDF Submission">
                            <FileText className="w-7 h-7" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Handout PDF</span>
                        </button>
                        <button type="button" onClick={() => setFormData({...formData, type: 'image'})} className={`p-5 rounded-2xl flex flex-col items-center gap-2 transition-all border-2 ${formData.type === 'image' ? 'bg-brand-proph text-black border-brand-proph shadow-xl shadow-brand-proph/20' : 'bg-brand-black text-brand-muted border-brand-border hover:border-brand-proph/30'}`} title="Image Capture">
                            <ImageIcon className="w-7 h-7" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Snap Capture</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">{unitLabel}</label>
                      <select required className="w-full bg-brand-black border border-brand-border p-5 rounded-2xl font-black uppercase text-xs text-white outline-none focus:ring-1 focus:ring-brand-proph" value={formData.faculty} onChange={e => handleFacultyChange(e.target.value)}>
                        <option value="">Select {unitLabel}</option>
                        {facultyOptions.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">Specialized Unit</label>
                      <select required disabled={!formData.faculty} className="w-full bg-brand-black border border-brand-border p-5 rounded-2xl font-black uppercase text-xs text-white outline-none focus:ring-1 focus:ring-brand-proph disabled:opacity-30" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                        <option value="">Select Department</option>
                        {departmentOptions.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">Intel Signature (Course Code)</label>
                      <input required placeholder="e.g. CSC 201" className="w-full bg-brand-black border border-brand-border p-5 rounded-2xl outline-none focus:ring-1 focus:ring-brand-proph font-black uppercase text-sm tracking-[0.2em]" value={formData.courseCode} onChange={e => setFormData({...formData, courseCode: e.target.value.toUpperCase()})} />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">Academic Session</label>
                      <select className="w-full bg-brand-black border border-brand-border p-5 rounded-2xl outline-none focus:ring-1 focus:ring-brand-proph font-black text-xs" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}>
                        {years.map(y => <option key={y} value={y}>{y} / {y+1} Session</option>)}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">Level</label>
                      <select className="w-full bg-brand-black border border-brand-border p-5 rounded-2xl outline-none focus:ring-1 focus:ring-brand-proph font-black text-xs" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                        <option value="100">100 Level</option>
                        <option value="200">200 Level</option>
                        <option value="300">300 Level</option>
                        <option value="400">400 Level</option>
                        <option value="500">500 Level</option>
                        <option value="600">600 Level</option>
                        <option value="700">700 Level</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-grow flex items-center justify-center gap-3 p-6 bg-white text-black rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-proph transition-all shadow-2xl" title="Open Local Storage">
                        <Upload className="w-5 h-5" /> Browse Neural Files
                      </button>
                      {formData.type === 'image' && (
                        <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex items-center justify-center gap-3 p-6 bg-brand-proph text-black rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-2xl shadow-brand-proph/20" title="Direct Camera Link">
                          <Camera className="w-5 h-5" /> Capture Physical Node
                        </button>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} hidden multiple={formData.type === 'image'} accept={formData.type === 'document' ? '.pdf' : 'image/*'} onChange={handleFileChange} />
                    <input type="file" ref={cameraInputRef} hidden capture="environment" accept="image/*" onChange={handleFileChange} />

                    {selectedFiles.length > 0 && (
                      <div className="bg-brand-black/50 p-8 rounded-[3rem] border border-brand-border space-y-6">
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em] px-2 flex items-center justify-between">Verification Buffer <span>({selectedFiles.length} ASSETS READY)</span></p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {selectedFiles.map((file, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-3xl overflow-hidden border-2 border-brand-border bg-brand-card shadow-inner">
                               {file.type.startsWith('image/') ? <img src={file.data} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center p-4"><FileText className="w-10 h-10 text-brand-muted mb-2" /><p className="text-[9px] font-black truncate w-full uppercase text-center">{file.name}</p></div>}
                               <button type="button" onClick={() => removeFile(idx)} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all active:scale-90" title="Purge Asset"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-10 border-t border-brand-border">
                    <button type="submit" disabled={!isEnabled || selectedFiles.length === 0} className="w-full bg-brand-proph text-black py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:scale-[1.02] transition-all shadow-2xl shadow-brand-proph/30 disabled:opacity-50" title="Commit to Registry">
                      DEPLOY TO GRID <CheckCircle2 className="w-7 h-7" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnonymousUpload;
