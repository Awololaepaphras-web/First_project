
import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, BookOpen, Wand2, Sparkles, Loader2, 
  Trash2, ChevronRight, MonitorPlay, ArrowLeft,
  Send, CheckCircle2, ScrollText, MessageSquare,
  X, Volume2, Zap, Brain, ListMusic, Languages, Moon, Sun, Coffee,
  Maximize2, LayoutGrid, Image as ImageIcon, Type as LucideType, Play,
  List, Swords, Star, Shield
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { StudyDocument, AIMessage } from '../types';
import { useNavigate } from 'react-router-dom';

interface StudyHubProps {
  onAction: (actions: number) => void;
}

interface ExtractedPart {
  id: string;
  type: 'text' | 'diagram' | 'formula';
  title: string;
  content: string;
}

const StudyHub: React.FC<StudyHubProps> = ({ onAction }) => {
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [extractionMode, setExtractionMode] = useState(false);
  const [extractedParts, setExtractedParts] = useState<ExtractedPart[]>([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('proph_study_docs');
    if (saved) setDocuments(JSON.parse(saved));
    const lastViewed = localStorage.getItem('proph_last_viewed_doc');
    if (lastViewed) { setActiveDocId(lastViewed); localStorage.removeItem('proph_last_viewed_doc'); }
  }, []);

  const activeDoc = documents.find(d => d.id === activeDocId);

  const handleDeepExtract = async () => {
    if (!activeDoc) return;
    setIsLoading(true);
    setExtractionMode(true);
    onAction(1);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Deconstruct this academic document into key learning segments. Return a JSON array of objects with title, type ('text' or 'diagram'), and content.`;
      const contents = activeDoc.data 
        ? { parts: [{ inlineData: { data: activeDoc.data, mimeType: activeDoc.type } }, { text: prompt }] }
        : prompt;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: contents, config: { responseMimeType: 'application/json' } });
      const data = JSON.parse(response.text || '[]');
      setExtractedParts(data.map((p: any) => ({ ...p, id: Math.random().toString(36).substr(2, 9) })));
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden flex flex-col bg-gray-50 dark:bg-brand-black">
      <header className="h-16 flex-shrink-0 bg-white dark:bg-brand-card border-b border-brand-border px-6 flex justify-between items-center z-40 shadow-sm">
        <div className="flex items-center gap-6 overflow-hidden">
          <button onClick={() => navigate('/memory-bank')} className="flex items-center gap-2 text-brand-muted hover:text-brand-proph font-black text-[10px] uppercase tracking-widest transition-colors" title="Back"><ArrowLeft className="w-4 h-4" /> Bank</button>
          {activeDoc && <div className="flex items-center gap-3 overflow-hidden"><div className="bg-brand-proph p-2 rounded-xl text-black"><BookOpen className="w-4 h-4" /></div><h2 className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[200px]">{activeDoc.name}</h2></div>}
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => navigate('/ai-assistant')} className="bg-brand-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2" title="AI Assistant"><Brain className="w-4 h-4" /> Study Buddy</button>
           <button onClick={handleDeepExtract} disabled={isLoading} className="bg-brand-proph text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg flex items-center gap-2" title="Extract Intel"><Zap className="w-4 h-4" /> {isLoading ? 'Thinking...' : 'Extract'}</button>
        </div>
      </header>

      <div className="flex-grow flex w-full overflow-hidden">
        <aside className="hidden sm:flex w-72 flex-shrink-0 bg-white dark:bg-brand-card border-r border-brand-border flex-col overflow-hidden">
          <div className="p-6 border-b border-brand-border"><h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Active Archives</h3></div>
          <div className="flex-grow overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {documents.map(doc => <div key={doc.id} onClick={() => setActiveDocId(doc.id)} className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center gap-4 ${activeDocId === doc.id ? 'bg-brand-proph/10 border-brand-proph text-brand-proph' : 'bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5'}`} title={doc.name}><div className="p-2 rounded-xl bg-gray-100 dark:bg-brand-border"><FileText className="w-4 h-4" /></div><span className="text-xs font-bold truncate dark:text-white">{doc.name}</span></div>)}
          </div>
        </aside>

        <main className="flex-grow relative overflow-hidden flex flex-col bg-gray-100 dark:bg-brand-black p-4 sm:p-8">
          {activeDoc ? (
            <div className="w-full h-full bg-white dark:bg-brand-card rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden border border-brand-border flex flex-col">
               <div className="flex-grow p-4 sm:p-10 overflow-y-auto custom-scrollbar">
                  {extractionMode ? (
                     <div className="max-w-3xl mx-auto space-y-8 py-10 animate-fade-in">
                        {extractedParts.map(p => (
                          <div key={p.id} className="p-8 bg-gray-50 dark:bg-brand-border/50 rounded-3xl border border-brand-border">
                             <h4 className="font-black text-lg text-gray-900 dark:text-white uppercase italic mb-4">{p.title}</h4>
                             <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 font-medium">{p.content}</p>
                          </div>
                        ))}
                     </div>
                  ) : (
                    <iframe src={activeDoc.data ? `data:${activeDoc.type};base64,${activeDoc.data}#toolbar=0` : activeDoc.url} className="w-full h-full border-none rounded-xl" title={activeDoc.name} />
                  )}
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-10"><div className="w-24 h-24 bg-brand-proph/10 rounded-full flex items-center justify-center mb-6"><MonitorPlay className="w-10 h-10 text-brand-proph" /></div><h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase italic">Awaiting Synchronous Node</h3><p className="text-brand-muted max-w-xs mb-8">Select an archive from your bank to begin analysis.</p></div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudyHub;
