
import React from 'react';
import { 
  GraduationCap, Award, Banknote, Calendar, 
  ChevronRight, Sparkles, Filter, Search, 
  Lock, AlertTriangle, ShieldCheck
} from 'lucide-react';

interface ScholarshipsProps {
  isEnabled: boolean;
}

const SCHOLARSHIPS = [
  {
    id: '1',
    title: 'Federal Government Bilateral Education Agreement (BEA)',
    provider: 'Federal Ministry of Education',
    amount: 'Full Tuition + Monthly Stipends',
    category: 'International',
    deadline: 'October 30, 2025'
  },
  {
    id: '2',
    title: 'MTN Foundation Science & Technology Scholarship',
    provider: 'MTN Nigeria',
    amount: '#200,000 Annually',
    category: 'Corporate',
    deadline: 'September 15, 2025'
  },
  {
    id: '3',
    title: 'NNPC/Chevron National University Scholarship',
    provider: 'Chevron Nigeria Limited',
    amount: '#150,000 Per Session',
    category: 'Oil & Gas',
    deadline: 'August 10, 2025'
  },
  {
    id: '4',
    title: 'Commonwealth Shared Scholarship Scheme',
    provider: 'Commonwealth Commission',
    amount: 'Fully Funded (Masters)',
    category: 'International',
    deadline: 'December 20, 2025'
  }
];

const Scholarships: React.FC<ScholarshipsProps> = ({ isEnabled }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 relative">
      {/* Locked Overlay */}
      {!isEnabled && (
        <div className="absolute inset-0 z-[100] bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-blue-50 max-w-xl w-full text-center animate-in zoom-in duration-500">
             <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
               <Lock className="w-12 h-12 text-blue-600" />
             </div>
             <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">Scholarship Portal Locked</h2>
             <p className="text-gray-500 font-medium text-lg leading-relaxed mb-10">
               Scholarship application portal is currently under review. Watch out for phase 2! 🎉
             </p>
             <div className="p-6 bg-blue-50 rounded-3xl flex items-center gap-4 text-left border border-blue-100">
                <ShieldCheck className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <p className="text-xs font-bold text-blue-800 uppercase tracking-tight">
                   The Federal Scholarship Board is updating its criteria. Archives will reopen soon.
                </p>
             </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-[0.2em]">
            <Award className="w-4 h-4" />
            <span>Academic Funding Hub</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter">
            Unlock Your <span className="text-blue-600">Future</span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-500 font-medium text-lg">
            A verified directory of local and international scholarship opportunities for students in Nigerian Federal Universities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Verified Grants', count: '142+', color: 'bg-blue-600' },
            { label: 'Total Value', count: '#250M+', color: 'bg-green-600' },
            { label: 'Active Deadlines', count: '12', color: 'bg-orange-600' },
            { label: 'Success Stories', count: '1.2k', color: 'bg-purple-600' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <span className={`text-3xl font-black mb-1 text-gray-900`}>{stat.count}</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           <aside className="lg:col-span-1 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                 <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Filter className="w-3.5 h-3.5 text-blue-600" /> Category
                    </h3>
                    <div className="space-y-2">
                       {['All Opportunities', 'International', 'Bilateral', 'Corporate', 'State Bursary'].map(cat => (
                         <button key={cat} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-all flex items-center justify-between group">
                            {cat}
                            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="pt-6 border-t border-gray-50">
                    <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white">
                       <Sparkles className="w-6 h-6 mb-4 text-blue-200" />
                       <h4 className="font-black text-sm mb-2">Proph Alert</h4>
                       <p className="text-[10px] leading-relaxed text-blue-50 font-medium">
                         Enable notifications in your dashboard to get real-time alerts when new federal grants are announced.
                       </p>
                    </div>
                 </div>
              </div>
           </aside>

           <main className="lg:col-span-3 space-y-6">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search scholarship by title or provider..." 
                  className="w-full pl-16 pr-6 py-5 bg-white border border-gray-200 rounded-[2rem] shadow-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {SCHOLARSHIPS.map(scholar => (
                   <div key={scholar.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full border-b-8 border-b-transparent hover:border-b-blue-600">
                      <div className="flex justify-between items-start mb-6">
                         <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                           {scholar.category}
                         </div>
                         <div className="flex items-center gap-1.5 text-orange-600">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-black uppercase">{scholar.deadline}</span>
                         </div>
                      </div>

                      <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight">{scholar.title}</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">{scholar.provider}</p>

                      <div className="mt-auto space-y-6">
                         <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <Banknote className="w-5 h-5 text-green-600" />
                            <div>
                               <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Award Value</p>
                               <p className="text-xs font-black text-gray-800">{scholar.amount}</p>
                            </div>
                         </div>
                         <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                           View Application <ChevronRight className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </main>
        </div>
      </div>
    </div>
  );
};

export default Scholarships;
