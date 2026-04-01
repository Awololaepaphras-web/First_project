
import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, Search, Grid, List, Plus, Upload, 
  Globe, FileText, Image as ImageIcon, Trash2, 
  ArrowRight, BookOpen, Clock, Tag, MoreVertical,
  ChevronRight, Sparkles, Filter, X, Download, HardDrive,
  Swords, Shield, Zap, Brain, Loader2
} from 'lucide-react';
import { PastQuestion, User } from '../types';
import { useNavigate } from 'react-router-dom';
import { CloudinaryService } from '../src/services/cloudinaryService';
import { Database as DB } from '../src/services/database';

interface MemoryBankProps {
  user: User;
  questions: PastQuestion[];
  onAction: (count: number) => void;
}

const MemoryBank: React.FC<MemoryBankProps> = ({ user, questions, onAction }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pdf' | 'image' | 'url'>('all');
  const [showAddUrl, setShowAddUrl] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userDocuments = questions.filter(q => q.uploadedBy === user.id);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await CloudinaryService.uploadFile(file, 'auto');
        
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          const newDoc: PastQuestion = {
            id: Math.random().toString(36).substr(2, 9),
            courseCode: file.name.split('.')[0],
            courseTitle: file.name,
            fileUrl: url,
            data: base64Data,
            type: file.type.startsWith('image/') ? 'image' : 'document',
            visibility: 'private',
            status: 'approved', // Personal documents are auto-approved for self
            uploadedBy: user.id,
            createdAt: Date.now()
          };
          await DB.saveDocument(newDoc);
          onAction(1);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Memory Bank upload failed:', error);
        alert('Failed to archive material.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleUrlAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    const newDoc: PastQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      courseCode: 'REMOTE',
      courseTitle: urlInput.split('/').pop()?.replace(/[-_]/g, ' ') || 'Remote Node',
      fileUrl: urlInput,
      type: urlInput.toLowerCase().endsWith('.pdf') ? 'document' : 'document',
      visibility: 'private',
      status: 'approved',
      uploadedBy: user.id,
      createdAt: Date.now()
    };
    await DB.saveDocument(newDoc);
    setUrlInput('');
    setShowAddUrl(false);
    onAction(1);
  };

  const filteredDocs = userDocuments.filter(doc => {
    const matchesSearch = (doc.courseTitle || '').toLowerCase().includes(search.toLowerCase()) || (doc.courseCode || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'pdf' && doc.type === 'document') || (filter === 'image' && doc.type === 'image') || (filter === 'url' && !!doc.fileUrl);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 pb-32">
      {/* Neural Hub Modules - ONLY ACCESS HERE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-gradient-to-r from-brand-proph to-green-600 rounded-[3rem] p-10 text-black flex justify-between items-center shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-700"><Swords className="w-48 h-48" /></div>
            <div className="space-y-4 relative z-10">
               <h2 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3"><Shield className="w-8 h-8" /> Gladiator Hub</h2>
               <p className="text-sm font-bold max-w-xs">Enter specialized study arenas and challenge federal peers.</p>
               <button onClick={() => navigate('/gladiator-hub')} className="bg-black text-white px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl" title="Open Hub">Launch Arena</button>
            </div>
         </div>

         <div className="bg-gradient-to-r from-brand-proph to-green-600 rounded-[3rem] p-10 text-black flex justify-between items-center shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-700"><Brain className="w-48 h-48" /></div>
            <div className="space-y-4 relative z-10">
               <h2 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3"><Zap className="w-8 h-8" /> Study Hub</h2>
               <p className="text-sm font-bold max-w-xs">Advanced neural synthesis of stored academic materials.</p>
               <button onClick={() => navigate('/study-hub')} className="bg-black text-white px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl" title="Initialize Session">Begin Study</button>
            </div>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-brand-proph rounded-2xl shadow-xl shadow-brand-proph/20"><Database className="w-6 h-6 text-black" /></div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic uppercase">Memory Bank</h1>
          </div>
          <p className="text-gray-500 font-medium">Your personalized repository for federal study assets.</p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button disabled={isUploading} onClick={() => setShowAddUrl(!showAddUrl)} className={`p-4 rounded-2xl transition-all ${showAddUrl ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600 hover:bg-green-100'} disabled:opacity-50`} title="Link Remote URL"><Globe className="w-5 h-5" /></button>
          <button disabled={isUploading} onClick={() => fileInputRef.current?.click()} className="flex-grow bg-gray-900 dark:bg-white dark:text-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-proph transition-all shadow-lg disabled:opacity-50" title="Store New Intel">
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {isUploading ? 'Synchronizing...' : 'Archive Material'}
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        </div>
      </div>

      {showAddUrl && (
        <form onSubmit={handleUrlAdd} className="bg-brand-proph p-10 rounded-[2.5rem] text-black shadow-2xl animate-fade-in flex flex-col md:flex-row gap-4 items-center">
           <input required type="url" placeholder="https://external-resource-link.pdf" className="flex-grow bg-white/10 border border-white/20 px-6 py-4 rounded-2xl outline-none focus:bg-white/20 transition-all font-bold placeholder:text-black/50" value={urlInput} onChange={e => setUrlInput(e.target.value)} />
           <button type="submit" className="w-full md:w-auto bg-white text-brand-proph px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-2" title="Link Asset">Add Link <ArrowRight className="w-5 h-5" /></button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredDocs.length > 0 ? filteredDocs.map(doc => (
           <div key={doc.id} onClick={() => { localStorage.setItem('proph_last_viewed_doc', doc.id); navigate('/study-hub'); }} className="bg-white dark:bg-brand-card rounded-[2.5rem] border border-brand-border shadow-sm hover:shadow-2xl transition-all cursor-pointer group flex flex-col overflow-hidden">
             <div className="h-40 bg-gray-50 dark:bg-brand-black relative overflow-hidden flex items-center justify-center border-b border-brand-border">
                <FileText className="w-12 h-12 opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-brand-black/90 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-300 backdrop-blur-sm">{!!doc.fileUrl ? 'Remote' : 'Local'}</div>
                <button onClick={(e) => { e.stopPropagation(); if(confirm('Purge material?')) DB.deleteDocument(doc.id); }} className="absolute top-4 right-4 p-2 bg-red-600/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" title="Purge Intel"><Trash2 className="w-4 h-4" /></button>
             </div>
              <div className="p-6">
                <h4 className="font-black text-gray-900 dark:text-white truncate group-hover:text-brand-proph transition-colors uppercase italic text-sm">
                  {doc.courseCode}: {doc.courseTitle}
                </h4>
                {doc.semester && (
                  <div className="mt-2 text-[10px] font-black text-brand-proph uppercase tracking-widest">
                    {doc.semester} Semester
                  </div>
                )}
                <div className="mt-4 flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                  <Clock className="w-3 h-3" /> ARCHIVED {new Date(doc.createdAt).toLocaleDateString()}
                </div>
              </div>
           </div>
        )) : <div className="col-span-full py-40 text-center opacity-40"><Database className="w-20 h-20 mx-auto mb-6" /><h3 className="text-2xl font-black uppercase italic">Vault Depleted</h3></div>}
      </div>
    </div>
  );
};

export default MemoryBank;
