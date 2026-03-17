import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, ShieldCheck, Zap, ArrowRight, Star, 
  GraduationCap, Users, Database, PlayCircle, Globe,
  Search, Building2, MapPin, ChevronRight, Lock, Download
} from 'lucide-react';
import { UNIVERSITIES } from '../constants';
import { User } from '../types';

interface HomeProps {
  user: User | null;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.setItem('has_visited_home', 'true');
  }, []);

  const filteredUnis = UNIVERSITIES.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.acronym.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 4);

  const handleUniversityClick = (path: string) => {
    if (user) {
      navigate(path);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="overflow-hidden bg-white dark:bg-brand-black min-h-screen text-black dark:text-white transition-colors">
      {/* Dynamic Immersive Hero Section - The very first thing a user sees */}
      <section className="relative pt-24 pb-20 lg:pt-48 lg:pb-40 px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-proph/20 rounded-full blur-[140px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-brand-primary/20 rounded-full blur-[140px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 dark:opacity-10"></div>
        </div>

        <div className="max-w-[1600px] mx-auto text-center space-y-10 relative">
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-brand-proph/10 text-brand-proph text-xs font-black uppercase tracking-[0.3em] border border-brand-proph/20 shadow-[0_0_20px_rgba(0,186,124,0.1)]">
              <Star className="w-4 h-4 fill-current animate-spin-slow" />
              <span>The Federal Network Alpha Node 2.0</span>
            </div>
            
            <button 
              onClick={() => {
                const link = document.createElement('a');
                link.href = '#';
                link.download = 'ProphCore_Alpha_Node.apk';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.alert('Initializing Academic Node Download... Please check your downloads folder.');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-lg"
            >
              <Download className="w-3 h-3" /> Download Mobile App
            </button>
          </div>
          
          <h1 className="text-[clamp(3.5rem,12vw,8rem)] font-black tracking-tighter leading-[0.9] italic uppercase text-gray-900 dark:text-white">
            FEDERAL <br />
            <span className="text-brand-proph text-transparent bg-clip-text bg-gradient-to-r from-brand-proph to-emerald-400">ARCHIVES</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-600 dark:text-brand-muted font-medium leading-relaxed italic">
            Unlock the collective intelligence of 50+ Federal Universities. Powered by Gemini Pro for extreme study synthesis.
          </p>

          {/* Quick Finder - Immediate functionality on first page */}
          <div className="max-w-2xl mx-auto relative mt-12 group">
             <div className="absolute -inset-1 bg-gradient-to-r from-brand-proph to-brand-primary rounded-[2rem] blur opacity-10 dark:opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
             <div className="relative flex items-center bg-gray-50 dark:bg-brand-card border border-brand-border rounded-[2rem] overflow-hidden p-2">
                <Search className="ml-6 text-gray-400 dark:text-brand-muted w-6 h-6" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Find your institution (e.g. UNILAG, UI)..." 
                  className="flex-grow bg-transparent border-none outline-none py-4 px-6 text-lg font-bold placeholder:text-gray-400 dark:placeholder:text-brand-muted/50 text-gray-900 dark:text-white"
                />
                {user && (
                  <button 
                    onClick={() => handleUniversityClick('/universities')}
                    className="bg-brand-proph text-black px-10 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-sm hover:brightness-110 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                  >
                    Enter
                  </button>
                )}
             </div>
             
             {searchTerm && (
               <div className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-brand-card border border-brand-border rounded-[2.5rem] shadow-2xl p-6 z-50 animate-fade-in">
                  <div className="space-y-4">
                     {filteredUnis.map(uni => (
                       <div 
                        key={uni.id} 
                        onClick={() => handleUniversityClick(`/university/${uni.id}`)} 
                        className="flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-colors group/item cursor-pointer"
                       >
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-brand-border flex items-center justify-center font-black overflow-hidden">
                                <img src={uni.logo} className="w-full h-full object-cover" alt={uni.acronym} />
                             </div>
                             <div className="text-left">
                                <p className="font-black italic text-brand-proph">{uni.acronym}</p>
                                <p className="text-[10px] font-bold text-gray-500 dark:text-brand-muted uppercase truncate max-w-[150px]">{uni.name}</p>
                             </div>
                          </div>
                          {user ? <ChevronRight className="w-5 h-5 text-gray-400 dark:text-brand-muted group-hover/item:text-brand-proph transition-colors" /> : <Lock className="w-4 h-4 text-gray-400 dark:text-brand-muted group-hover/item:text-brand-proph transition-colors" />}
                       </div>
                     ))}
                     {filteredUnis.length === 0 && <p className="py-4 text-gray-500 dark:text-brand-muted italic font-medium">No institutions linked to "{searchTerm}"</p>}
                  </div>
               </div>
             )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
            {!user && (
              <Link to="/signup" className="w-full sm:w-auto px-14 py-6 bg-black dark:bg-white text-white dark:text-black rounded-full font-black text-lg uppercase tracking-widest hover:bg-brand-proph hover:text-white transition-all hover:scale-105 shadow-xl active:scale-95">
                Sync Identity
              </Link>
            )}
            {user && (
              <button 
                onClick={() => handleUniversityClick('/universities')}
                className="w-full sm:w-auto px-14 py-6 bg-transparent text-gray-900 dark:text-white border-2 border-brand-border rounded-full font-black text-lg uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                Vault Access <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {user && (
            <div className="pt-8">
              <Link to="/anonymous-upload" className="text-gray-500 dark:text-brand-muted hover:text-brand-proph font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 group">
                <Database className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Contribute Intel Anonymously (No Rewards)
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Institutional Statistics */}
      <section className="py-20 border-y border-brand-border bg-gray-50 dark:bg-brand-black">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
             {[
               { label: 'FEDERAL NODES', val: '52+', icon: <Globe className="w-5 h-5 text-brand-proph" /> },
               { label: 'ARCHIVED ASSETS', val: '250K', icon: <Database className="w-5 h-5 text-brand-primary" /> },
               { label: 'ACTIVE SCHOLARS', val: '1.2M', icon: <Users className="w-5 h-5 text-yellow-500" /> },
               { label: 'AI SYNTHESES', val: '5M+', icon: <Zap className="w-5 h-5 text-emerald-400" /> }
             ].map(s => (
               <div key={s.label} className="space-y-2 group">
                  <div className="flex justify-center mb-2 opacity-50 group-hover:opacity-100 transition-opacity">{s.icon}</div>
                  <p className="text-4xl md:text-6xl font-black italic tracking-tighter text-gray-900 dark:text-white">{s.val}</p>
                  <p className="text-[10px] font-black text-gray-500 dark:text-brand-muted uppercase tracking-[0.3em]">{s.label}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* High-Concept Features Section */}
      <section className="py-32 bg-white dark:bg-brand-card relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4 leading-none text-gray-900 dark:text-white">THE SCHOLAR'S <br /><span className="text-brand-proph">ECOSYSTEM</span></h2>
            <div className="w-32 h-1.5 bg-brand-proph mx-auto rounded-full shadow-[0_0_15px_#00ba7c]"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-gray-50 dark:bg-brand-black p-12 rounded-[3.5rem] border border-brand-border hover:border-brand-proph transition-all group relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity"><BookOpen className="w-48 h-48" /></div>
              <div className="w-16 h-16 bg-brand-proph/10 text-brand-proph rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase italic text-gray-900 dark:text-white">Global Vault</h3>
              <p className="text-gray-600 dark:text-brand-muted font-medium leading-relaxed italic">Access multi-decade archives of past questions from every federal college, department, and faculty in Nigeria.</p>
            </div>

            <div className="bg-gray-50 dark:bg-brand-black p-12 rounded-[3.5rem] border border-brand-border hover:border-brand-primary transition-all group relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity"><Zap className="w-48 h-48" /></div>
              <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase italic text-gray-900 dark:text-white">Gemini 3 Flash</h3>
              <p className="text-gray-600 dark:text-brand-muted font-medium leading-relaxed italic">Direct AI reasoning on your specific university handouts. Proph AI learns your curriculum standards to forge precise mock exams.</p>
            </div>

            <div className="bg-gray-50 dark:bg-brand-black p-12 rounded-[3.5rem] border border-brand-border hover:border-gray-400 dark:hover:border-white transition-all group relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity"><ShieldCheck className="w-48 h-48" /></div>
              <div className="w-16 h-16 bg-gray-200 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase italic text-gray-900 dark:text-white">Node Rewards</h3>
              <p className="text-gray-600 dark:text-brand-muted font-medium leading-relaxed italic">Monetize your academic contributions. Earn points for uploads and successful peer links, convertible to verified institutional bounties.</p>
            </div>
          </div>
        </div>
      </section>

      {/* University Node Grid */}
      <section className="py-32 border-t border-brand-border bg-white dark:bg-brand-black">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="text-left space-y-4">
              <h2 className="text-[clamp(2.5rem,8vw,5rem)] font-black uppercase italic tracking-tighter leading-none text-gray-900 dark:text-white">SYNCED <span className="text-brand-proph">VAULTS</span></h2>
              <p className="text-gray-600 dark:text-brand-muted font-medium text-lg italic">Explore specific institutional repositories currently online.</p>
            </div>
            {user && (
              <button 
                onClick={() => handleUniversityClick('/universities')}
                className="group flex items-center gap-4 bg-gray-50 dark:bg-white/5 border border-brand-border px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-proph hover:text-black dark:hover:text-black transition-all text-gray-900 dark:text-white"
              >
                All Federal Nodes <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {UNIVERSITIES.slice(0, 4).map((uni) => (
              <div 
                key={uni.id} 
                onClick={() => handleUniversityClick(`/university/${uni.id}`)} 
                className="group cursor-pointer"
              >
                <div className="bg-gray-50 dark:bg-brand-card rounded-[3rem] p-12 text-center border border-brand-border group-hover:border-brand-proph transition-all shadow-2xl hover:-translate-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <PlayCircle className="w-6 h-6 text-brand-proph" />
                  </div>
                  <div className="w-24 h-24 rounded-[2rem] mx-auto mb-8 bg-white dark:bg-brand-black p-4 border border-brand-border group-hover:border-brand-proph/30 transition-colors shadow-inner">
                    <img src={uni.logo} alt={uni.name} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <h4 className="font-black text-2xl italic uppercase tracking-tighter text-gray-900 dark:text-white group-hover:text-brand-proph transition-colors">{uni.acronym}</h4>
                  <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 dark:text-brand-muted text-[10px] font-black uppercase tracking-widest">
                     <MapPin className="w-3 h-3" /> {uni.location}
                  </div>
                  <div className="mt-8 pt-8 border-t border-brand-border/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                     <span className="text-[10px] font-black text-brand-proph uppercase tracking-[0.2em]">{user ? 'Open Archives' : 'Login to Enter'}</span>
                     {!user && <Lock className="w-3 h-3 text-brand-proph" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-32 border-t border-brand-border text-center bg-gray-50 dark:bg-brand-card relative overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-proph to-transparent opacity-30"></div>
         <div className="flex flex-col items-center gap-12">
            <Link to="/" className="flex items-center gap-4 group">
               <div className="bg-brand-proph p-3 rounded-2xl group-hover:rotate-12 transition-transform shadow-[0_0_20px_rgba(0,186,124,0.3)]">
                  <GraduationCap className="w-10 h-10 text-black" />
               </div>
               <span className="text-4xl font-black italic tracking-tighter text-gray-900 dark:text-white">PROPH</span>
            </Link>
            <div className="flex flex-wrap justify-center gap-12 grayscale opacity-30">
               <span className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-900 dark:text-white">Neural Intelligence</span>
               <span className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-900 dark:text-white">Federal Protocol</span>
               <span className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-900 dark:text-white">Open Academic Stream</span>
            </div>
            <p className="text-gray-500 dark:text-brand-muted text-[11px] font-black uppercase tracking-[0.4em] max-w-lg mx-auto leading-loose">
               &copy; 2025 THE PROPH PROJECT ALPHA NODE. <br /> 
               REIMAGINING NIGERIAN HIGHER EDUCATION THROUGH COLLECTIVE KNOWLEDGE.
            </p>
         </div>
      </footer>
    </div>
  );
};

export default Home;