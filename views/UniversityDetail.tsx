import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronDown, Share2, MapPin, ArrowLeft, Image as ImageIcon, BookOpen, Lock, Layers, FileText, GraduationCap, Zap, ShieldAlert, Megaphone, ChevronRight, Clock, Award } from 'lucide-react';
import { PastQuestion, StudyDocument, User, University, Advertisement, Status } from '../types';
import { COMMON_FACULTIES } from '../constants';
import { CloudinaryService } from '../src/services/cloudinaryService';
import { SupabaseService } from '../src/services/supabaseService';
import StatusFeed from '../src/components/StatusFeed';

interface UniversityDetailProps {
  questions: PastQuestion[];
  user: User | null;
  universities: University[];
  universityColleges: Record<string, string[]>;
  collegeDepartments: Record<string, string[]>;
  globalAds: Advertisement[];
}

const UniversityDetail: React.FC<UniversityDetailProps> = ({ questions, user, universities, universityColleges, collegeDepartments, globalAds }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaculty, setActiveFaculty] = useState('All');
  const [activeDepartment, setActiveDepartment] = useState('All');
  const [statuses, setStatuses] = useState<Status[]>([]);

  useEffect(() => {
    fetchStatuses();

    // Real-time subscription for statuses
    const channel = SupabaseService.subscribeToTable('statuses', (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
        fetchStatuses();
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const fetchStatuses = async () => {
    const data = await SupabaseService.getStatuses();
    setStatuses(data);
  };

  const university = universities.find(u => u.id === id);
  
  const now = new Date();
  const hour = now.getHours();
  let currentTimeFrame: any = '12am-6am';
  if (hour >= 6 && hour < 12) currentTimeFrame = '6am-12pm';
  else if (hour >= 12 && hour < 18) currentTimeFrame = '12pm-6pm';
  else if (hour >= 18) currentTimeFrame = '6pm-12am';

  const approvedAds = globalAds.filter(ad => 
    ad.status === 'active' && 
    (!ad.expiryDate || ad.expiryDate > Date.now()) &&
    (ad.targetUniversity === 'all' || ad.targetUniversity === university?.id) &&
    ((ad.placements && ad.placements.includes('university')) || ad.placement === 'university') &&
    (!ad.timeFrames || ad.timeFrames.length === 0 || ad.timeFrames.includes(currentTimeFrame) || ad.timeFrames.includes('all-day'))
  );
  
  if (!university) {
    return (
      <div className="max-w-7xl auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Archives Unavailable</h1>
        <Link to="/universities" className="text-green-600 mt-4 inline-block font-bold hover:underline">Return to Federal Registry</Link>
      </div>
    );
  }

  const isAuthorized = !user || user.role === 'admin' || user.university === university.acronym;

  if (!isAuthorized) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-brand-card p-14 rounded-[4rem] shadow-2xl text-center border border-red-50 dark:border-red-900/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
          <div className="w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-2.5rem flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Lock className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">Identity Mismatch</h2>
          <p className="text-gray-500 dark:text-brand-muted font-medium mb-10 leading-relaxed text-sm">
            Access to this repository is restricted to verified nodes from <span className="text-green-600 font-black">{university.acronym}</span>. 
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="block w-full bg-gray-900 dark:bg-white dark:text-black text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all shadow-xl"
          >
            Access My Institution Vault
          </button>
        </div>
      </div>
    );
  }

  const unitLabel = university.id === 'funaab' ? 'College' : 'Faculty';
  const facultyCategories = ['All', ...(universityColleges[university.id] || COMMON_FACULTIES)];
  const departmentOptions = activeFaculty !== 'All' ? (collegeDepartments[activeFaculty] || []) : [];

  const handleFacultyChange = (val: string) => {
    setActiveFaculty(val);
    setActiveDepartment('All');
  };

  const filteredQuestions = questions.filter(q => {
    if (q.status !== 'approved') return false;
    const matchesUni = q.universityId.toLowerCase() === university.id.toLowerCase();
    const matchesSearch = q.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          q.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFaculty = activeFaculty === 'All' || q.faculty === activeFaculty;
    const matchesDept = activeDepartment === 'All' || q.department === activeDepartment;
    return matchesUni && matchesSearch && matchesFaculty && matchesDept;
  });

  const handleReadOnline = (q: PastQuestion) => {
    const savedDocs = JSON.parse(localStorage.getItem('proph_study_docs') || '[]');
    const docName = `${q.courseCode} - ${q.courseTitle}`;
    let existing = savedDocs.find((d: StudyDocument) => d.name === docName);
    if (!existing) {
      existing = {
        id: Math.random().toString(36).substr(2, 9),
        name: docName,
        url: q.fileUrl !== '#' ? q.fileUrl : undefined,
        data: q.fileUrl === '#' ? 'Placeholder' : undefined,
        type: q.type === 'image' ? 'image/png' : 'application/pdf',
        uploadedAt: Date.now()
      };
      localStorage.setItem('proph_study_docs', JSON.stringify([existing, ...savedDocs]));
    }
    localStorage.setItem('proph_last_viewed_doc', existing.id);
    navigate('/study-hub');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-12">
        <Link to="/universities" className="flex items-center gap-2 text-gray-400 hover:text-green-600 font-black text-[10px] uppercase tracking-[0.3em] mb-10 transition-all">
          <ArrowLeft className="w-4 h-4" /> Registry Explorer
        </Link>
        <div className="bg-white dark:bg-brand-card rounded-[4rem] p-12 md:p-16 shadow-2xl border border-gray-100 dark:border-brand-border flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
          <div className="w-36 h-36 md:w-48 md:h-48 bg-gray-50 dark:bg-brand-black rounded-[3rem] p-10 flex-shrink-0 flex items-center justify-center">
            <img src={CloudinaryService.getOptimizedUrl(university.logo)} alt={university.name} className="w-full h-full object-contain" />
          </div>
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-4xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">{university.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 text-gray-500 dark:text-brand-muted font-bold text-sm mt-6">
              <span className="flex items-center gap-2.5 bg-green-50 dark:bg-brand-proph/10 text-green-700 dark:text-brand-proph px-5 py-2.5 rounded-2xl border border-green-100 dark:border-brand-proph/20"><MapPin className="w-4 h-4" /> {university.location}</span>
            </div>
          </div>
        </div>
      </div>

      {user && (
        <div className="mb-12">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-proph" /> Student Status
          </h3>
          <StatusFeed 
            user={user} 
            statuses={statuses} 
            onStatusAdded={fetchStatuses} 
          />
        </div>
      )}

      {approvedAds.length > 0 && (
        <div className="mb-12">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-brand-proph" /> Promoted Intel
          </h3>
          <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x pb-4">
            {approvedAds.map(ad => (
              <a 
                key={ad.id} 
                href={ad.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white dark:bg-brand-card rounded-[2.5rem] border border-gray-100 dark:border-brand-border overflow-hidden group hover:border-brand-proph transition-all flex-shrink-0 w-[85vw] sm:w-[400px] snap-center shadow-2xl"
              >
                <div className="aspect-video bg-gray-100 dark:bg-brand-border relative">
                  {ad.type === 'video' ? (
                    <video src={ad.mediaUrl} className="w-full h-full object-cover" muted loop autoPlay />
                  ) : (
                    <img src={CloudinaryService.getOptimizedUrl(ad.mediaUrl)} className="w-full h-full object-cover" alt={ad.title} />
                  )}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">
                    Sponsored
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase italic truncate">{ad.title}</h3>
                  <div className="flex items-center gap-2 mt-2 text-brand-proph font-black text-[10px] uppercase tracking-widest">
                    Learn More <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="lg:col-span-1 space-y-10">
          <div className="bg-white dark:bg-brand-card p-10 rounded-[3.5rem] border border-gray-100 dark:border-brand-border shadow-2xl sticky top-24 space-y-12">
            <div>
              <h3 className="text-[10px] font-black text-gray-400 dark:text-brand-muted uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-green-600" /> {unitLabel}
              </h3>
              <select
                value={activeFaculty}
                onChange={(e) => handleFacultyChange(e.target.value)}
                className="w-full px-6 py-5 bg-gray-50 dark:bg-brand-black border border-gray-100 dark:border-brand-border rounded-[1.5rem] outline-none focus:ring-2 focus:ring-green-500 appearance-none font-black text-gray-800 dark:text-white text-xs shadow-sm"
              >
                {facultyCategories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'All' ? `All ${unitLabel}s` : cat}</option>
                ))}
              </select>
            </div>
            {activeFaculty !== 'All' && (
              <div>
                <h3 className="text-[10px] font-black text-gray-400 dark:text-brand-muted uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" /> Unit
                </h3>
                <select
                  value={activeDepartment}
                  onChange={(e) => setActiveDepartment(e.target.value)}
                  className="w-full px-6 py-5 bg-gray-50 dark:bg-brand-black border border-gray-100 dark:border-brand-border rounded-[1.5rem] outline-none focus:ring-2 focus:ring-green-500 appearance-none font-black text-gray-800 dark:text-white text-xs shadow-sm"
                >
                  <option value="All">All Departments</option>
                  {departmentOptions.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
            )}
            <button onClick={() => navigate('/ai-assistant')} className="w-full bg-gray-900 dark:bg-white dark:text-black text-white py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-600 transition-all">
               <Zap className="w-4 h-4" /> Launch AI Portal
            </button>
            {user && !user.isPremium && (
              <button onClick={() => navigate('/premium')} className="w-full bg-yellow-500 text-black py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-yellow-500/20">
                <Award className="w-4 h-4" /> Unlock Premium
              </button>
            )}
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="relative mb-12">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 dark:text-brand-muted w-7 h-7" />
            <input
              type="text"
              placeholder={`Search specific course codes in ${university.acronym} vault...`}
              className="w-full pl-16 pr-8 py-7 bg-white dark:bg-brand-card border border-gray-100 dark:border-brand-border rounded-[2.5rem] shadow-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-800 dark:text-white text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-32">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map(question => (
                <div key={question.id} className="bg-white dark:bg-brand-card p-10 rounded-[3.5rem] border border-gray-100 dark:border-brand-border shadow-sm hover:shadow-2xl transition-all flex flex-col h-full hover:border-b-green-600 border-b-[12px] border-b-transparent">
                  <div className="flex justify-between items-start mb-10">
                    <span className="bg-green-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase">{question.courseCode}</span>
                    <span className="text-[10px] text-gray-300 dark:text-brand-muted font-black uppercase">{question.year} SESSION</span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-6 tracking-tighter leading-tight">{question.courseTitle}</h3>
                  <p className="text-[11px] font-black text-gray-400 dark:text-brand-muted uppercase mb-2">{question.faculty}</p>
                  <p className="text-[11px] font-black text-green-600 uppercase mb-8">{question.department}</p>
                  <div className="flex items-center justify-between pt-10 border-t border-gray-50 dark:border-brand-border mt-auto">
                    <button onClick={() => handleReadOnline(question)} className="flex items-center gap-4 bg-gray-900 dark:bg-white dark:text-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all shadow-xl">
                      <BookOpen className="w-5 h-5" /> OPEN ARCHIVE
                    </button>
                    <button className="p-4 text-gray-300 dark:text-brand-muted hover:text-green-600 transition-all bg-gray-50 dark:bg-brand-border rounded-2xl"><Share2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-48 text-center bg-gray-50 dark:bg-brand-card rounded-[5rem] border-4 border-dashed border-gray-200 dark:border-brand-border">
                <ShieldAlert className="w-24 h-24 text-gray-100 dark:text-brand-border mx-auto mb-10" />
                <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tighter">Vault Match Error</h3>
                <Link to="/upload" className="mt-16 bg-green-600 text-white px-12 py-6 rounded-[2rem] font-black text-xs uppercase inline-block">Contribute Missing Intel</Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UniversityDetail;