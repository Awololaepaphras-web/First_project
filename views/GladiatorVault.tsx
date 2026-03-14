
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Filter, Trash2, Play, Calendar, FileText, Swords, MoreVertical, Star, ChevronRight } from 'lucide-react';
import { GladiatorVaultItem, User } from '../types';
import { Database as DB } from '../src/services/database';

interface GladiatorVaultProps {
  user: User;
}

const GladiatorVault: React.FC<GladiatorVaultProps> = ({ user }) => {
  const [items, setItems] = useState<GladiatorVaultItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const gladiatorData = await DB.getGladiatorData();
      const saved = gladiatorData.vault || [];
      if (saved.length > 0) {
        setItems(saved);
      } else {
        const mockItems: GladiatorVaultItem[] = [
          { id: 'v1', name: 'GST 101 Use of English', type: 'application/pdf', uploadedBy: user.id, uploadedAt: Date.now() - 86400000, category: 'General', textPreview: 'Fundamental English syntax and grammar concepts for university entry...', arenaHistory: ['arena_123'] },
          { id: 'v2', name: 'CSC 201 Programming Fundamentals', type: 'text/plain', uploadedBy: user.id, uploadedAt: Date.now() - 172800000, category: 'Engineering', textPreview: 'Logic, loops, and introductory programming logic for computer scientists...', arenaHistory: [] }
        ];
        setItems(mockItems);
        await DB.saveGladiatorData({ ...gladiatorData, vault: mockItems });
      }
    };
    loadData();
  }, []);

  const categories = ['All', 'General', 'Science', 'Engineering', 'Social Sciences', 'Arts'];

  const filteredItems = items.filter(item => 
    (activeCategory === 'All' || item.category === activeCategory) &&
    (item.name.toLowerCase().includes(search.toLowerCase()))
  );

  const reuseInArena = (item: GladiatorVaultItem) => {
    localStorage.setItem('gladiator_active_reuse', JSON.stringify(item));
    navigate('/gladiator-hub/arena');
  };

  return (
    <div className="min-h-screen bg-brand-black text-white py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
           <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest mb-4 border border-green-500/20">
                 <BookOpen className="w-4 h-4" /> Academic Repository
              </div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Study Vault</h1>
              <p className="text-brand-muted font-medium italic">Your personal archival storage for competitive study material.</p>
           </div>
           
           <div className="flex bg-brand-card p-1.5 rounded-2xl border border-brand-border overflow-x-auto no-scrollbar max-w-full">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-green-600 text-white shadow-lg shadow-green-500/20' : 'text-brand-muted hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>

        <div className="bg-brand-card p-4 rounded-[2rem] border border-brand-border flex flex-col md:flex-row gap-4 shadow-sm">
           <div className="relative flex-grow">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted w-5 h-5" />
              <input 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Locate a specific scroll..." 
                className="w-full bg-brand-black border border-brand-border pl-16 pr-6 py-4 rounded-[1.5rem] text-sm font-bold focus:ring-1 focus:ring-green-500 outline-none transition-all text-white"
              />
           </div>
           <button 
            onClick={() => navigate('/gladiator-hub/arena')}
            className="px-10 bg-white text-black rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-xl"
           >
              Host New Scroll <Swords className="w-4 h-4" />
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filteredItems.map(item => (
             <div key={item.id} className="bg-brand-card rounded-[3.5rem] border border-brand-border overflow-hidden group hover:border-green-500/30 transition-all flex flex-col shadow-xl">
                <div className="p-10 space-y-6 flex-grow">
                   <div className="flex justify-between items-start">
                      <div className="w-14 h-14 bg-green-500/10 rounded-[1.5rem] border border-green-500/20 flex items-center justify-center text-green-500">
                         <FileText className="w-7 h-7" />
                      </div>
                      <span className="bg-brand-black text-brand-muted px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-brand-border">{item.category}</span>
                   </div>
                   
                   <div>
                      <h3 className="text-xl font-black italic uppercase leading-tight group-hover:text-green-500 transition-colors text-white">{item.name}</h3>
                      <p className="text-[10px] text-brand-muted font-bold uppercase mt-2 flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Linked {new Date(item.uploadedAt).toLocaleDateString()}
                      </p>
                   </div>

                   <div className="p-6 bg-brand-black rounded-2xl border border-brand-border">
                      <p className="text-[11px] text-brand-muted font-medium italic line-clamp-3">"{item.textPreview}"</p>
                   </div>
                </div>

                <div className="p-10 pt-0 mt-auto">
                   <div className="flex items-center justify-between pt-8 border-t border-brand-border">
                      <div className="flex items-center gap-4 text-[10px] font-black text-brand-muted uppercase tracking-widest">
                         <span className="flex items-center gap-1 text-green-500"><Swords className="w-3 h-3" /> {item.arenaHistory.length} Arenas</span>
                      </div>
                      <button 
                        onClick={() => reuseInArena(item)}
                        className="flex items-center gap-2 text-green-500 font-black text-[10px] uppercase tracking-[0.2em] hover:text-green-400 transition-colors"
                      >
                        Launch Hub <ChevronRight className="w-4 h-4" />
                      </button>
                   </div>
                </div>
             </div>
           ))}

           {filteredItems.length === 0 && (
             <div className="col-span-full py-40 text-center bg-brand-card rounded-[5rem] border-4 border-dashed border-brand-border">
                <BookOpen className="w-20 h-20 text-brand-border mx-auto mb-6" />
                <h3 className="text-2xl font-black text-brand-muted italic uppercase">Vault Empty</h3>
                <p className="text-brand-muted mt-2 font-medium italic">No archived materials matching your current filters.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default GladiatorVault;
