
import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, Square, Download, Play, 
  Trash2, Monitor, AlertCircle, CheckCircle2,
  ArrowRight, ExternalLink, Info, ShieldCheck,
  Image as ImageIcon, FileText, Upload, MousePointer2,
  Zap, Share2, Eye
} from 'lucide-react';
import { User } from '../types';
import { Link } from 'react-router-dom';

interface ScreenRecorderProps {
  user: User | null;
}

type VerificationMode = 'record' | 'screenshot' | 'document';

const ScreenRecorder: React.FC<ScreenRecorderProps> = ({ user }) => {
  const [mode, setMode] = useState<VerificationMode>('record');
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string; type: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    setVideoUrl(null);
    setRecordedChunks([]);
    setUploadedFile(null);
    
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9'
      });

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setRecordedChunks((prev) => [...prev, e.data]);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        setRecording(false);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      };

      mediaRecorder.start();
      setRecording(true);
      setTimer(0);
      
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error("Error starting screen recording:", err);
      setError("Permission denied or browser not supported for screen capture.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedFile({ name: file.name, url, type: file.type });
      setVideoUrl(null);
      setRecordedChunks([]);
      setError(null);
    }
  };

  const handleDownload = () => {
    if (mode === 'record' && recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Proph_Recording_${user?.name.replace(/\s+/g, '_') || 'Student'}_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (uploadedFile) {
      const a = document.createElement('a');
      a.href = uploadedFile.url;
      a.download = uploadedFile.name;
      a.click();
    }
  };

  useEffect(() => {
    if (recordedChunks.length > 0 && !recording) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      setVideoUrl(URL.createObjectURL(blob));
    }
  }, [recordedChunks, recording]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const clearAssets = () => {
    setVideoUrl(null);
    setUploadedFile(null);
    setRecordedChunks([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>Achievement Verification Hub</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">
            Verify Your <span className="text-blue-600">Results</span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-500 font-medium text-lg leading-relaxed">
            Choose your preferred method to show your academic achievements, mock test scores, or official results.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center">
          <div className="inline-flex bg-white p-2 rounded-[2rem] shadow-xl border border-gray-100 gap-2">
            {[
              { id: 'record', label: 'Screen Record', icon: <Monitor className="w-4 h-4" /> },
              { id: 'screenshot', label: 'Screenshot', icon: <ImageIcon className="w-4 h-4" /> },
              { id: 'document', label: 'Document', icon: <FileText className="w-4 h-4" /> }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => { setMode(m.id as VerificationMode); clearAssets(); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${mode === m.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Action Display */}
            <div className="bg-gray-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden aspect-video flex flex-col items-center justify-center border border-gray-800 group">
               {/* Mode: RECORD */}
               {mode === 'record' && (
                 <>
                   {recording ? (
                     <div className="text-center space-y-8 animate-in fade-in">
                        <div className="relative">
                          <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center animate-pulse">
                            <div className="w-12 h-12 bg-red-600 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)]" />
                          </div>
                          <div className="absolute -top-2 -right-2 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Live</div>
                        </div>
                        <div className="space-y-2">
                           <p className="text-5xl font-black text-white font-mono tracking-tighter">{formatTime(timer)}</p>
                           <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Capturing Screen Content...</p>
                        </div>
                        <button 
                          onClick={stopRecording}
                          className="bg-white text-gray-900 px-10 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-gray-100 transition-all shadow-xl"
                        >
                          <Square className="w-4 h-4 fill-current" /> Stop Recording
                        </button>
                     </div>
                   ) : videoUrl ? (
                     <div className="w-full h-full flex flex-col animate-in zoom-in duration-500 relative">
                        <video src={videoUrl} controls className="w-full h-full rounded-2xl object-contain bg-black shadow-inner" />
                        <div className="absolute top-6 right-6 flex gap-3">
                           <button onClick={clearAssets} className="p-3 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 transition-all">
                             <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                   ) : (
                     <div className="text-center space-y-8">
                        <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/10 mx-auto group-hover:scale-110 transition-transform duration-500">
                           <Monitor className="w-10 h-10 text-blue-500" />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-xl font-black text-white">Live Screen Capture</h3>
                           <p className="text-gray-500 text-sm font-medium">Record your active session to prove results in real-time.</p>
                        </div>
                        <button 
                          onClick={startRecording}
                          className="bg-blue-600 text-white px-10 py-5 rounded-[1.5rem] font-black flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/40 active:scale-95"
                        >
                          <Play className="w-4 h-4 fill-current" /> Initialize Recording
                        </button>
                     </div>
                   )}
                 </>
               )}

               {/* Mode: SCREENSHOT & DOCUMENT */}
               {(mode === 'screenshot' || mode === 'document') && (
                 <>
                   {uploadedFile ? (
                     <div className="w-full h-full flex flex-col items-center justify-center space-y-6 animate-in zoom-in">
                       {mode === 'screenshot' ? (
                         <div className="relative w-full h-full p-4">
                           <img src={uploadedFile.url} className="w-full h-full object-contain rounded-2xl bg-white/5 shadow-inner" alt="Verification" />
                         </div>
                       ) : (
                         <div className="text-center space-y-6">
                            <div className="w-24 h-24 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto border border-red-500/20">
                               <FileText className="w-10 h-10 text-red-500" />
                            </div>
                            <div>
                               <p className="text-white font-black text-xl truncate max-w-[300px]">{uploadedFile.name}</p>
                               <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">PDF Evidence Linked</p>
                            </div>
                         </div>
                       )}
                       <div className="absolute top-6 right-6">
                          <button onClick={clearAssets} className="p-3 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 transition-all">
                            <Trash2 className="w-5 h-5" />
                          </button>
                       </div>
                     </div>
                   ) : (
                     <div 
                      className="text-center space-y-8 cursor-pointer group/upload"
                      onClick={() => fileInputRef.current?.click()}
                     >
                        <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/10 mx-auto group-hover/upload:scale-110 group-hover/upload:border-blue-500/50 transition-all duration-500">
                           {mode === 'screenshot' ? <ImageIcon className="w-10 h-10 text-green-500" /> : <FileText className="w-10 h-10 text-red-500" />}
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-xl font-black text-white">Upload {mode === 'screenshot' ? 'Snapshot' : 'Academic File'}</h3>
                           <p className="text-gray-500 text-sm font-medium">Select a {mode === 'screenshot' ? 'JPG/PNG' : 'PDF'} of your result.</p>
                        </div>
                        <button 
                          className="bg-gray-800 text-white px-10 py-5 rounded-[1.5rem] font-black flex items-center gap-3 border border-gray-700 hover:bg-gray-700 transition-all active:scale-95"
                        >
                          <Upload className="w-4 h-4" /> Browse Local Files
                        </button>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept={mode === 'screenshot' ? 'image/*' : '.pdf'} 
                          onChange={handleFileUpload} 
                        />
                     </div>
                   )}
                 </>
               )}

               {error && (
                 <div className="absolute bottom-6 left-6 right-6 p-4 bg-red-950/50 border border-red-900/50 rounded-2xl flex items-center gap-3 text-red-400 animate-shake">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
                 </div>
               )}
            </div>

            {/* Action Bar */}
            {(videoUrl || uploadedFile) && !recording && (
              <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-4">
                 <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-xl">
                       <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                       <p className="text-sm font-black text-gray-900 uppercase">Verification Asset Ready</p>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Optimized for Secure Verification</p>
                    </div>
                 </div>
                 <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={handleDownload}
                      className="flex-grow sm:flex-grow-0 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-lg"
                    >
                      <Download className="w-4 h-4" /> Download Asset
                    </button>
                    <button 
                      className="bg-green-600 text-white p-4 rounded-2xl hover:bg-green-700 transition-all shadow-lg"
                      title="Share to Community"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                 </div>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
               <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Info className="w-3.5 h-3.5 text-blue-600" /> Instructions
                  </h3>
                  <ol className="space-y-4">
                    {mode === 'record' ? [
                      'Launch result page in a separate tab',
                      'Click "Initialize Recording"',
                      'Select the result tab and perform actions',
                      'Stop and download your proof'
                    ].map((step, idx) => (
                      <li key={idx} className="flex gap-3">
                         <span className="w-5 h-5 rounded-lg bg-gray-50 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-gray-400 border border-gray-100">{idx + 1}</span>
                         <span className="text-xs text-gray-600 font-medium leading-relaxed">{step}</span>
                      </li>
                    )) : [
                      `Open your ${mode} on your device`,
                      `Click "Browse Local Files" or drag here`,
                      `Ensure all details are clearly visible`,
                      `Click Download to save the verified copy`
                    ].map((step, idx) => (
                      <li key={idx} className="flex gap-3">
                         <span className="w-5 h-5 rounded-lg bg-gray-50 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-gray-400 border border-gray-100">{idx + 1}</span>
                         <span className="text-xs text-gray-600 font-medium leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
               </div>

               <div className="pt-8 border-t border-gray-50 space-y-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <Zap className="w-3.5 h-3.5 text-orange-500" /> Power Shortcuts
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                     <Link to="/dashboard" className="p-4 bg-gray-50 rounded-2xl text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-between group">
                        Return to Dashboard
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                     </Link>
                     <Link to="/income-analysis" className="p-4 bg-gray-50 rounded-2xl text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-between group">
                        Performance Insights
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                     </Link>
                  </div>
               </div>

               <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] text-white shadow-xl shadow-blue-100">
                  <ShieldCheck className="w-8 h-8 text-blue-200 mb-4" />
                  <h4 className="font-black text-sm mb-2 uppercase tracking-tight">Security Protocol</h4>
                  <p className="text-[10px] leading-relaxed text-blue-50 font-medium">
                    All assets are processed locally on your hardware. Proph never captures or stores sensitive identifying data without explicit consent.
                  </p>
               </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ScreenRecorder;
