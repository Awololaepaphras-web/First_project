import React, { useState, useRef, useEffect } from 'react';
import { 
  Wifi, Users, CloudUpload, Play, CheckCircle2, 
  X, ShieldCheck, Loader2, Sparkles, Wand2, 
  Wallet, AlertTriangle, ArrowRight, BookOpen,
  History, User as UserIcon, Swords, Zap, Award,
  Settings, Dice1, LayoutList
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import { CloudinaryService } from '../src/services/cloudinaryService';

interface GladiatorHubProps {
  user: User;
}

type SessionState = 'idle' | 'hosting' | 'joining' | 'lobby' | 'generating' | 'quiz' | 'verdict';
type QuestionMode = 'same' | 'different';

const LocalHub: React.FC<GladiatorHubProps> = ({ user }) => {
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [pointsToCommit, setPointsToCommit] = useState(200);
  const [questionMode, setQuestionMode] = useState<QuestionMode>('same');
  const [fileData, setFileData] = useState<{ data: string; name: string; type: string; url?: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [members, setMembers] = useState<{ name: string; status: 'ready' | 'pending'; score?: number }[]>([]);
  const [sessionCode, setSessionCode] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<string>('');
  const [isSelfReady, setIsSelfReady] = useState(false);
  const [bountyResult, setBountyResult] = useState<{ shared: boolean; amount: number } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleHost = () => {
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    setSessionCode(code);
    setSessionState('hosting');
    setMembers([{ name: user.name, status: 'pending' }]);
  };

  const handleJoinSession = () => {
    setSessionState('joining');
  };

  const confirmJoin = () => {
    if (!sessionCode.trim()) return;
    setSessionState('lobby');
    // Simulate peer detection
    setMembers([
      { name: "Host_Scholar", status: 'ready' },
      { name: user.name, status: 'pending' },
      { name: "Node_Explorer", status: 'ready' }
    ]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await CloudinaryService.uploadFile(file, 'auto');
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          setFileData({ data: base64, name: file.name, type: file.type, url });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Gladiator Hub upload failed:', error);
        alert('Failed to upload arena intel.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const setReady = () => {
    setIsSelfReady(true);
    setMembers(prev => prev.map(m => m.name === user.name ? { ...m, status: 'ready' } : m));
    
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
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = questionMode === 'same' 
        ? "Generate 5 unified exam questions for all gladiators based on this material. Format: Q1, Q2, etc."
        : "Generate 5 unique sets of questions so each gladiator faces a different trial based on this material.";
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: fileData!.data, mimeType: fileData!.type } },
            { text: prompt }
          ]
        }
      });
      setGeneratedQuestions(response.text || "Arena corruption detected.");
      setSessionState('quiz');
    } catch (error) {
      console.error(error);
      alert("Neural forging failed. Retreat to base.");
      setSessionState('hosting');
    }
  };

  const finalizeCombat = () => {
    // Simulate scoring logic
    const scores = members.map(m => ({ ...m, score: Math.floor(Math.random() * 20) + 80 }));
    
    // Force a tie for "Same Questions" demo if random matches
    const allSameMark = scores.every(s => s.score === scores[0].score);
    
    if (allSameMark && questionMode === 'same') {
      const shareAmount = Math.floor(1000 / members.length);
      setBountyResult({ shared: true, amount: shareAmount });
      // Update user points if they won/tied
      if (user) {
        // In a real app, this would be a server-side update
        // user.points = (user.points || 0) + shareAmount;
      }
    } else {
      setBountyResult({ shared: false, amount: 0 });
    }
    
    setMembers(scores);
    setSessionState('verdict');
  };

  return (
    <div className="min-h-screen bg-brand-black py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-500/20">
            <Swords className="w-4 h-4" />
            <span>Gladiator Neural Hub</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
            Arena <span className="text-green-500">Command</span>
          </h1>
          <p className="max-w-2xl mx-auto text-brand-muted font-medium text-lg italic">
            Synchronize your intelligence with the network. Battle for bounties and academic dominance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            {sessionState === 'idle' && (
              <div className="bg-brand-card rounded-[3rem] p-10 shadow-2xl border border-brand-border flex flex-col items-center text-center space-y-10 animate-in fade-in zoom-in">
                <div className="w-24 h-24 bg-green-500/10 rounded-[2.5rem] flex items-center justify-center border border-green-500/20 shadow-inner">
                   <Wifi className="w-10 h-10 text-green-500 animate-pulse" />
                </div>
                <div className="space-y-4">
                   <h2 className="text-2xl font-black text-white italic uppercase">Initialize Arena Protocol</h2>
                   <p className="text-brand-muted font-medium max-w-xs mx-auto text-sm italic">
                     Choose your operational role within the local gladiator network.
                   </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                   <button 
                    onClick={handleHost}
                    className="p-8 bg-green-600 text-white rounded-[2rem] shadow-xl hover:bg-green-700 transition-all flex flex-col items-center gap-4 group"
                   >
                     <div className="p-4 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform"><CloudUpload className="w-8 h-8" /></div>
                     <div className="text-left w-full">
                        <p className="font-black uppercase tracking-widest text-[10px]">Command</p>
                        <p className="text-lg font-black italic">Host Arena</p>
                     </div>
                   </button>
                   
                   <button 
                    onClick={handleJoinSession}
                    className="p-8 bg-gray-900 text-white rounded-[2rem] shadow-xl hover:bg-black transition-all flex flex-col items-center gap-4 group border border-brand-border"
                   >
                     <div className="p-4 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform"><Users className="w-8 h-8" /></div>
                     <div className="text-left w-full">
                        <p className="font-black uppercase tracking-widest text-[10px]">Gladiator</p>
                        <p className="text-lg font-black italic">Join Node</p>
                     </div>
                   </button>
                </div>

                <div className="pt-6 w-full border-t border-brand-border">
                   <button 
                    onClick={() => navigate('/gladiator-hub/competition')}
                    className="w-full py-5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:brightness-110 shadow-lg"
                   >
                      <Zap className="w-4 h-4 fill-current" /> High-Stakes Pool Arena <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
              </div>
            )}

            {sessionState === 'hosting' && (
              <div className="bg-brand-card rounded-[3rem] p-10 shadow-2xl border border-brand-border space-y-8 animate-in slide-in-from-bottom-4">
                 <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-white italic uppercase">Arena Configuration</h2>
                    <div className="bg-green-500/10 text-green-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-green-500/20">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" /> Synchronizing
                    </div>
                 </div>
                 
                 <div className="p-8 bg-green-500/10 rounded-[2rem] border border-green-500/20 text-center">
                    <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-2">Signature Access Key</p>
                    <p className="text-6xl font-black text-green-500 tracking-tighter font-mono">{sessionCode}</p>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4">Trial Methodology</h3>
                       <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => setQuestionMode('same')}
                            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${questionMode === 'same' ? 'bg-green-600 border-green-600 text-white shadow-xl' : 'bg-brand-black border-brand-border text-brand-muted hover:border-green-500/30'}`}
                          >
                             <LayoutList className="w-6 h-6" />
                             <div className="text-center">
                                <p className="font-black text-xs uppercase">Unified</p>
                                <p className="text-[10px] font-bold opacity-60">Same Questions</p>
                             </div>
                          </button>
                          <button 
                            onClick={() => setQuestionMode('different')}
                            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${questionMode === 'different' ? 'bg-green-600 border-green-600 text-white shadow-xl' : 'bg-brand-black border-brand-border text-brand-muted hover:border-green-500/30'}`}
                          >
                             <Dice1 className="w-6 h-6" />
                             <div className="text-center">
                                <p className="font-black text-xs uppercase">Individual</p>
                                <p className="text-[10px] font-bold opacity-60">Random Unique</p>
                             </div>
                          </button>
                       </div>
                    </div>

                    <div className="h-px bg-brand-border" />

                    <div>
                       <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4">Arena Intel</h3>
                       <div 
                         onClick={() => !isUploading && fileInputRef.current?.click()}
                         className={`border-2 border-dashed border-brand-border p-10 rounded-[2.5rem] text-center cursor-pointer hover:border-green-500 hover:bg-green-500/5 transition-all group ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                       >
                          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                          {isUploading ? (
                            <div className="space-y-3">
                               <Loader2 className="w-10 h-10 text-green-500 mx-auto animate-spin" />
                               <p className="font-bold text-green-500">Synchronizing Intel...</p>
                            </div>
                          ) : fileData ? (
                            <div className="flex items-center justify-center gap-4">
                               <div className="p-3 bg-green-500/10 rounded-2xl text-green-500"><CheckCircle2 className="w-6 h-6" /></div>
                               <div className="text-left">
                                  <p className="font-black text-white">{fileData.name}</p>
                                  <p className="text-[10px] font-bold text-brand-muted uppercase">Intel Ready</p>
                               </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                               <CloudUpload className="w-10 h-10 text-brand-muted mx-auto group-hover:scale-110 transition-transform" />
                               <p className="font-bold text-brand-muted">Deploy Challenge Material</p>
                            </div>
                          )}
                       </div>
                    </div>
                 </div>

                 <div className="pt-4 flex justify-between items-center">
                    <button onClick={() => setSessionState('idle')} className="text-brand-muted font-bold text-sm hover:text-red-500 transition-colors">Abort Protocol</button>
                    <button 
                      onClick={setReady}
                      disabled={!fileData || isSelfReady}
                      className="bg-green-600 text-white px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl disabled:opacity-50"
                    >
                      {isSelfReady ? 'Waiting for Gladiators...' : 'Initialize Hub'}
                    </button>
                 </div>
              </div>
            )}

            {sessionState === 'joining' && (
              <div className="bg-brand-card rounded-[3rem] p-10 shadow-2xl border border-brand-border space-y-8 animate-in zoom-in">
                 <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-brand-black rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border border-brand-border">
                       <ShieldCheck className="w-10 h-10 text-brand-muted" />
                    </div>
                    <h2 className="text-2xl font-black text-white italic uppercase">Arena Entry</h2>
                    <p className="text-brand-muted font-medium text-sm italic">Synchronize with a host's signature access key.</p>
                 </div>
                 
                 <div className="space-y-6">
                    <input 
                      maxLength={6}
                      className="w-full bg-brand-black border border-brand-border p-6 rounded-[2rem] text-center text-4xl font-black tracking-[0.5em] text-white uppercase font-mono outline-none focus:ring-1 focus:ring-green-500 transition-all"
                      placeholder="XXXXXX"
                      value={sessionCode}
                      onChange={e => setSessionCode(e.target.value.toUpperCase())}
                    />
                    
                    <button 
                      onClick={confirmJoin}
                      className="w-full bg-green-600 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-green-500/20 hover:bg-green-700 transition-all active:scale-95"
                    >
                      Authenticate Node
                    </button>
                    <button onClick={() => setSessionState('idle')} className="w-full text-brand-muted font-bold text-xs uppercase tracking-widest text-center hover:text-white">Retreat</button>
                 </div>
              </div>
            )}

            {sessionState === 'lobby' && (
              <div className="bg-brand-card rounded-[3rem] p-10 shadow-2xl border border-brand-border space-y-8 animate-fade-in">
                 <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-white italic uppercase">Arena Lobby</h2>
                    <span className="bg-green-600 text-white px-4 py-1 rounded-xl font-mono font-black text-lg">{sessionCode}</span>
                 </div>
                 
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Linked Scholars</p>
                    <div className="grid grid-cols-1 gap-3">
                       {members.map((m, i) => (
                         <div key={i} className="flex items-center justify-between p-6 bg-brand-black rounded-[2rem] border border-brand-border">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-brand-card rounded-2xl flex items-center justify-center text-brand-muted shadow-sm border border-brand-border">
                                  <UserIcon className="w-6 h-6" />
                                </div>
                               <span className="font-black text-white uppercase italic">{m.name}</span>
                            </div>
                            <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full border ${m.status === 'ready' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                               {m.status}
                            </span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="pt-6 border-t border-brand-border">
                    <button 
                      onClick={setReady}
                      disabled={isSelfReady}
                      className="w-full bg-green-600 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl disabled:opacity-50"
                    >
                      {isSelfReady ? 'Armed & Ready' : 'Acknowledge Readiness'}
                    </button>
                 </div>
              </div>
            )}

            {sessionState === 'quiz' && (
              <div className="bg-brand-card rounded-[3rem] p-10 shadow-2xl border border-brand-border space-y-8 animate-in zoom-in">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400"><Wand2 className="w-6 h-6" /></div>
                        <h2 className="text-2xl font-black text-white uppercase italic">Combat Phase</h2>
                    </div>
                    <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-1 rounded-full text-[10px] font-black uppercase border border-red-500/20">
                       <Zap className="w-3 h-3 fill-current" /> Active Duel
                    </div>
                 </div>
                 
                 <div className="prose prose-sm max-w-none bg-brand-black p-10 rounded-[2.5rem] border border-brand-border text-brand-muted font-medium leading-[1.8] whitespace-pre-wrap italic">
                    {generatedQuestions}
                 </div>

                 <div className="pt-6 w-full">
                    <button 
                      onClick={finalizeCombat}
                      className="w-full bg-white text-black py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-brand-proph transition-all shadow-2xl"
                    >
                       Finalize Results
                    </button>
                 </div>
              </div>
            )}

            {sessionState === 'verdict' && (
              <div className="bg-brand-card rounded-[3rem] p-10 shadow-2xl border border-brand-border space-y-10 animate-in zoom-in">
                 <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-green-500/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border border-green-500/20">
                       <Award className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-black text-white italic uppercase">Arena Verdict</h2>
                    {bountyResult?.shared && (
                      <div className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 text-yellow-500 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 animate-bounce">
                         <Zap className="w-4 h-4 fill-current" /> Tie Detected! 1000pt Bounty Shared Once Daily
                      </div>
                    )}
                 </div>

                 <div className="space-y-4">
                    {members.map((m, i) => (
                      <div key={i} className={`p-6 rounded-[2.5rem] border flex items-center justify-between ${m.name === user.name ? 'bg-green-500/10 border-green-500/30 ring-2 ring-green-500/20' : 'bg-brand-black border-brand-border'}`}>
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand-card rounded-2xl flex items-center justify-center font-black text-brand-muted border border-brand-border">
                               {m.name.charAt(0)}
                            </div>
                            <div>
                               <p className="font-black text-white uppercase italic">{m.name}</p>
                               {bountyResult?.shared && <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">+{bountyResult.amount} PT Bounty</p>}
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-2xl font-black text-white">{m.score}%</p>
                            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Neural Accuracy</p>
                         </div>
                      </div>
                    ))}
                 </div>

                 <button 
                  onClick={() => setSessionState('idle')}
                  className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase text-sm tracking-widest hover:bg-brand-proph transition-all"
                 >
                    Exit Arena Dashboard
                 </button>
              </div>
            )}

            {sessionState === 'generating' && (
              <div className="bg-brand-card rounded-[3rem] p-20 shadow-2xl border border-brand-border text-center space-y-8">
                 <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping" />
                    <div className="relative w-full h-full bg-green-600 rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-green-500/20">
                       <Loader2 className="w-12 h-12 text-white animate-spin" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white italic uppercase">Forging Challenge</h3>
                    <p className="text-brand-muted font-medium uppercase tracking-widest text-[10px] italic">Synchronizing trials with curriculum standards...</p>
                 </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-brand-card p-8 rounded-[2.5rem] border border-brand-border shadow-sm space-y-8">
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-2">
                    <Wallet className="w-3.5 h-3.5 text-green-500" /> Purse Context
                  </h3>
                  <div className="p-5 bg-brand-black rounded-3xl border border-brand-border flex justify-between items-center">
                     <div>
                        <p className="text-[8px] font-black text-brand-muted uppercase">War Chest</p>
                        <p className="text-2xl font-black text-white">{user.points || 0}</p>
                     </div>
                     <div className="w-10 h-10 bg-brand-card rounded-xl flex items-center justify-center shadow-sm border border-brand-border">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                     </div>
                  </div>
               </div>

               <div className="pt-8 border-t border-brand-border">
                  <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4">Arena Rules</h3>
                  <ul className="space-y-4">
                    {[
                      'Unified challenges allow bounty splits',
                      'Individual trials test personal grit',
                      'Ties split the 1000pt house pool',
                      'Bounty shared limit: 1 per day',
                      'Arena results linked to node reputation'
                    ].map((step, idx) => (
                      <li key={idx} className="flex gap-3">
                         <span className="w-5 h-5 rounded-lg bg-brand-black flex-shrink-0 flex items-center justify-center text-[10px] font-black text-brand-muted border border-brand-border">{idx + 1}</span>
                         <span className="text-[11px] text-brand-muted font-bold leading-tight italic">{step}</span>
                      </li>
                    ))}
                  </ul>
               </div>

               <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] text-white border border-brand-border">
                  <ShieldCheck className="w-6 h-6 text-green-400 mb-4" />
                  <h4 className="font-black text-[10px] uppercase tracking-widest mb-2 italic">Secured Integrity</h4>
                  <p className="text-[10px] leading-relaxed text-gray-400 font-medium italic">
                    The Gladiator Hub uses institutional verification to ensure results are earned through genuine scholarly effort.
                  </p>
               </div>
            </div>
          </aside>
          
        </div>
      </div>
    </div>
  );
};

export default LocalHub;