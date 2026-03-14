
import React, { useState, useRef, useEffect } from 'react';
import { 
  Wifi, Users, CloudUpload, Play, CheckCircle2, 
  X, ShieldCheck, Loader2, Sparkles, Wand2, 
  Wallet, AlertTriangle, ArrowRight, BookOpen,
  History, User as UserIcon
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { User } from '../types';
import { useNavigate } from 'react-router-dom';

interface LocalHubProps {
  user: User;
  onJoin: (points: number) => void;
}

type SessionState = 'idle' | 'hosting' | 'joining' | 'lobby' | 'generating' | 'quiz';

const LocalHub: React.FC<LocalHubProps> = ({ user, onJoin }) => {
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [pointsToCommit, setPointsToCommit] = useState(200);
  const [fileData, setFileData] = useState<{ data: string; name: string; type: string } | null>(null);
  const [members, setMembers] = useState<{ name: string; status: 'ready' | 'pending' }[]>([]);
  const [sessionCode, setSessionCode] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<string>('');
  const [isSelfReady, setIsSelfReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleHost = () => {
    if ((user.points || 0) < pointsToCommit) {
      alert("Insufficient points to host a session.");
      return;
    }
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    setSessionCode(code);
    setSessionState('hosting');
    setMembers([{ name: user.name, status: 'pending' }]);
  };

  const handleJoinSession = () => {
    if ((user.points || 0) < pointsToCommit) {
      alert("Insufficient points. Minimum 200 required.");
      return;
    }
    setSessionState('joining');
  };

  const confirmJoin = () => {
    if (!sessionCode.trim()) return;
    onJoin(pointsToCommit);
    setSessionState('lobby');
    setMembers([
      { name: "Session Host", status: 'ready' },
      { name: user.name, status: 'pending' },
      { name: "Student_X", status: 'ready' }
    ]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setFileData({ data: base64, name: file.name, type: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const setReady = () => {
    setIsSelfReady(true);
    setMembers(prev => prev.map(m => m.name === user.name ? { ...m, status: 'ready' } : m));
    
    // Simulate other members becoming ready after a delay
    if (sessionState === 'hosting') {
      setTimeout(() => {
        setMembers(prev => prev.map(m => m.name !== user.name ? { ...m, status: 'ready' } : m));
      }, 1500);
    }
  };

  useEffect(() => {
    const allReady = members.length > 1 && members.every(m => m.status === 'ready');
    if (allReady && sessionState === 'hosting' && fileData) {
      generateQuiz();
    }
  }, [members]);

  const generateQuiz = async () => {
    setSessionState('generating');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = "Generate 5 unique exam questions based on this study material. Format them clearly for a group quiz.";
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: fileData!.data, mimeType: fileData!.type } },
            { text: prompt }
          ]
        }
      });
      setGeneratedQuestions(response.text || "No questions could be generated.");
      setSessionState('quiz');
    } catch (error) {
      console.error(error);
      alert("Error generating quiz material.");
      setSessionState('hosting');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest">
            <Wifi className="w-4 h-4" />
            <span>Gladiator Peer Network</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter">
            Gladiator <span className="text-green-600">Hub</span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-500 font-medium text-lg">
            Connect with nearby peers over Wi-Fi. Host a session, share materials, and challenge each other in the arena.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {sessionState === 'idle' && (
              <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-100 flex flex-col items-center text-center space-y-10 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center border border-green-100 shadow-inner">
                   <Wifi className="w-10 h-10 text-green-600 animate-pulse" />
                </div>
                <div className="space-y-4">
                   <h2 className="text-2xl font-black text-gray-900">Choose Your Role</h2>
                   <p className="text-gray-500 font-medium max-w-xs mx-auto text-sm">
                     To enter the arena, ensure you are connected to the host's Hotspot or local network.
                   </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                   <button 
                    onClick={handleHost}
                    className="p-8 bg-green-600 text-white rounded-[2rem] shadow-xl shadow-green-200 hover:bg-green-700 transition-all flex flex-col items-center gap-4 group"
                   >
                     <div className="p-4 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform"><CloudUpload className="w-8 h-8" /></div>
                     <div className="text-left w-full">
                        <p className="font-black uppercase tracking-widest text-[10px]">Host</p>
                        <p className="text-lg font-black">Open Arena</p>
                     </div>
                   </button>
                   
                   <button 
                    onClick={handleJoinSession}
                    className="p-8 bg-gray-900 text-white rounded-[2rem] shadow-xl shadow-gray-200 hover:bg-black transition-all flex flex-col items-center gap-4 group"
                   >
                     <div className="p-4 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform"><Users className="w-8 h-8" /></div>
                     <div className="text-left w-full">
                        <p className="font-black uppercase tracking-widest text-[10px]">Gladiator</p>
                        <p className="text-lg font-black">Join Hub</p>
                     </div>
                   </button>
                </div>
              </div>
            )}

            {sessionState === 'hosting' && (
              <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-100 space-y-8 animate-in slide-in-from-bottom-4">
                 <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-gray-900">Arena Broadcast</h2>
                    <div className="bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" /> Live Arena
                    </div>
                 </div>
                 
                 <div className="p-8 bg-green-50 rounded-[2rem] border border-green-100 text-center">
                    <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-2">Access Key</p>
                    <p className="text-6xl font-black text-green-600 tracking-tighter font-mono">{sessionCode}</p>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shared Intel</h3>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 p-10 rounded-[2.5rem] text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all group"
                    >
                       <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                       {fileData ? (
                         <div className="flex items-center justify-center gap-4">
                            <div className="p-3 bg-green-100 rounded-2xl text-green-600"><CheckCircle2 className="w-6 h-6" /></div>
                            <div className="text-left">
                               <p className="font-black text-gray-900">{fileData.name}</p>
                               <p className="text-[10px] font-bold text-gray-400 uppercase">Deployed to arena</p>
                            </div>
                         </div>
                       ) : (
                         <div className="space-y-3">
                            <CloudUpload className="w-10 h-10 text-gray-300 mx-auto group-hover:scale-110 transition-transform" />
                            <p className="font-bold text-gray-500">Upload Challenge Document</p>
                         </div>
                       )}
                    </div>
                 </div>

                 <div className="pt-4 flex justify-between items-center">
                    <button onClick={() => setSessionState('idle')} className="text-gray-400 font-bold text-sm hover:text-red-500 transition-colors">Close Arena</button>
                    <button 
                      onClick={setReady}
                      disabled={!fileData || isSelfReady}
                      className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-100 disabled:opacity-50"
                    >
                      {isSelfReady ? 'Awaiting Gladiators...' : 'Mark Ready'}
                    </button>
                 </div>
              </div>
            )}

            {sessionState === 'joining' && (
              <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-100 space-y-8 animate-in zoom-in">
                 <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-gray-100 rounded-[2rem] flex items-center justify-center mx-auto">
                       <ShieldCheck className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">Arena Verification</h2>
                    <p className="text-gray-500 font-medium text-sm">Enter the secret key shown on the host's screen.</p>
                 </div>
                 
                 <div className="space-y-6">
                    <input 
                      maxLength={6}
                      className="w-full bg-gray-50 border border-gray-100 p-6 rounded-[2rem] text-center text-4xl font-black tracking-[0.5em] text-gray-900 uppercase font-mono outline-none focus:ring-4 focus:ring-green-100 transition-all"
                      placeholder="XXXXXX"
                      value={sessionCode}
                      onChange={e => setSessionCode(e.target.value.toUpperCase())}
                    />
                    
                    <div className="p-6 bg-orange-50 rounded-[2rem] border border-orange-100 flex items-start gap-4">
                       <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                       <div>
                          <p className="text-sm font-black text-orange-900">Points Commitment</p>
                          <p className="text-xs text-orange-800 font-medium mt-1">Entering the arena will lock <span className="font-black">{pointsToCommit} points</span>. These are returned upon completion of the study challenge.</p>
                       </div>
                    </div>

                    <button 
                      onClick={confirmJoin}
                      className="w-full bg-green-600 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-green-100 hover:bg-green-700 transition-all active:scale-95"
                    >
                      Enter Hub
                    </button>
                    <button onClick={() => setSessionState('idle')} className="w-full text-gray-400 font-bold text-xs uppercase tracking-widest text-center hover:text-gray-600">Retreat</button>
                 </div>
              </div>
            )}

            {sessionState === 'lobby' && (
              <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-100 space-y-8">
                 <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Arena Lobby</h2>
                    <span className="bg-green-600 text-white px-3 py-1 rounded-lg font-mono font-black text-sm">{sessionCode}</span>
                 </div>
                 
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Gladiators</p>
                    <div className="grid grid-cols-1 gap-3">
                       {members.map((m, i) => (
                         <div key={i} className="flex items-center justify-between p-5 bg-gray-50 rounded-3xl border border-gray-100">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
                                  <UserIcon className="w-5 h-5" />
                               </div>
                               <span className="font-black text-gray-900">{m.name}</span>
                            </div>
                            <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${m.status === 'ready' ? 'bg-green-100 text-green-600 border-green-200' : 'bg-orange-100 text-orange-600 border-orange-200'}`}>
                               {m.status}
                            </span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="pt-6 border-t border-gray-50">
                    <button 
                      onClick={setReady}
                      disabled={isSelfReady}
                      className="w-full bg-green-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl disabled:opacity-50"
                    >
                      {isSelfReady ? 'Ready & Armed' : 'Confirm Readiness'}
                    </button>
                 </div>
              </div>
            )}

            {sessionState === 'generating' && (
              <div className="bg-white rounded-[3rem] p-20 shadow-2xl border border-gray-100 text-center space-y-8">
                 <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping" />
                    <div className="relative w-full h-full bg-green-600 rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-green-200">
                       <Loader2 className="w-12 h-12 text-white animate-spin" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black text-gray-900">Forging Challenge</h3>
                    <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">Proph AI is creating the gladiator quiz...</p>
                 </div>
              </div>
            )}

            {sessionState === 'quiz' && (
              <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-100 space-y-8 animate-in zoom-in duration-500">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-2xl text-purple-600"><Wand2 className="w-6 h-6" /></div>
                    <h2 className="text-2xl font-black text-gray-900">Hub Arena Challenge</h2>
                 </div>
                 
                 <div className="prose prose-sm max-w-none bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 text-gray-700 font-medium leading-[1.8] whitespace-pre-wrap">
                    {generatedQuestions}
                 </div>

                 <div className="flex gap-4">
                    <button 
                      onClick={() => navigate('/study-hub')}
                      className="flex-grow bg-gray-900 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                    >
                       <BookOpen className="w-5 h-5" /> Analyze in Study Hub
                    </button>
                    <button 
                      onClick={() => setSessionState('idle')}
                      className="px-10 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all"
                    >
                       Exit Arena
                    </button>
                 </div>
              </div>
            )}

          </div>

          {/* Sidebar / Requirements */}
          <aside className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Wallet className="w-3.5 h-3.5 text-green-600" /> Purse Context
                  </h3>
                  <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 flex justify-between items-center">
                     <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase">War Chest</p>
                        <p className="text-2xl font-black text-gray-900">{user.points || 0}</p>
                     </div>
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                     </div>
                  </div>
               </div>

               <div className="pt-8 border-t border-gray-50">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Gladiator Protocols</h3>
                  <ul className="space-y-4">
                    {[
                      '200 point arena commitment',
                      'Connected to Arena Hotspot',
                      'Intel uploaded by Arena Host',
                      'Gladiator quiz for all peers'
                    ].map((step, idx) => (
                      <li key={idx} className="flex gap-3">
                         <span className="w-5 h-5 rounded-lg bg-gray-50 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-gray-400 border border-gray-100">{idx + 1}</span>
                         <span className="text-[11px] text-gray-600 font-bold leading-tight">{step}</span>
                      </li>
                    ))}
                  </ul>
               </div>

               <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] text-white">
                  <ShieldCheck className="w-6 h-6 text-green-400 mb-4" />
                  <h4 className="font-black text-xs uppercase tracking-tighter mb-2">Arena Security</h4>
                  <p className="text-[10px] leading-relaxed text-gray-400 font-medium">
                    The Gladiator Hub is a localized experience. Your data stays in the hub, except for encrypted AI challenge forging.
                  </p>
               </div>
            </div>

            <div className="bg-green-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-green-100 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                  <Wand2 className="w-20 h-20" />
               </div>
               <h4 className="font-black text-lg mb-2">Champion Host</h4>
               <p className="text-xs text-green-100 font-medium leading-relaxed mb-6">
                 Champions who host successful arenas earn +5 bonus points for every gladiator peer who completes the quiz.
               </p>
               <button 
                onClick={handleHost}
                className="w-full bg-white text-green-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-50 transition-colors"
               >
                 Open New Arena
               </button>
            </div>
          </aside>
          
        </div>
      </div>
    </div>
  );
};

export default LocalHub;
