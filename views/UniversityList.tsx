
import React, { useState } from 'react';
import { Search, MapPin, Building2, ChevronRight, Lock, ShieldCheck } from 'lucide-react';
import { UNIVERSITY_COLLEGES } from '../constants';
import { Link } from 'react-router-dom';
import { User, University } from '../types';

interface UniversityListProps {
  user: User | null;
  universities: University[];
}

const UniversityList: React.FC<UniversityListProps> = ({ user, universities }) => {
  const [search, setSearch] = useState('');
  
  // Restriction: If user is logged in, they ONLY see their university.
  // Exception for admins who see all.
  const filtered = universities.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                         u.acronym.toLowerCase().includes(search.toLowerCase());
    
    if (user && user.role !== 'admin') {
      return u.acronym === user.university && matchesSearch;
    }
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          {user && user.role !== 'admin' ? 'Institution Portal' : 'Federal Archives'}
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">
          {user && user.role !== 'admin' 
            ? `Authenticated access for ${user.university}. Only your institution's records are visible.`
            : 'Access the official past question repositories of all Nigerian Federal Universities.'}
        </p>
      </div>

      {(!user || user.role === 'admin') && (
        <div className="relative max-w-xl mx-auto mb-16">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search institution..."
            className="w-full pl-16 pr-6 py-5 bg-white border border-gray-200 rounded-[2rem] shadow-xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {user && user.role !== 'admin' && (
        <div className="max-w-md mx-auto mb-16 p-6 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-100">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active Bond</p>
            <p className="text-blue-700 font-bold text-sm">Identity strictly tied to {user.university}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filtered.map(uni => {
          const collegeCount = UNIVERSITY_COLLEGES[uni.id]?.length;
          const displayTerm = uni.id === 'funaab' ? 'Colleges' : 'Faculties';
          
          return (
            <Link key={uni.id} to={`/university/${uni.id}`} className="group">
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all h-full flex flex-col relative overflow-hidden">
                {user && user.university === uni.acronym && (
                  <div className="absolute top-0 right-0 bg-green-600 text-white px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest">
                    Verified Home
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-8">
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex-shrink-0 flex items-center justify-center p-4 group-hover:bg-green-50 transition-colors border border-gray-50 shadow-inner">
                    <img src={uni.logo} alt={uni.name} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500" />
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-green-600 transition-colors" />
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-3xl font-black text-gray-900 mb-2 group-hover:text-green-600 transition-colors tracking-tight">
                    {uni.acronym}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 font-medium line-clamp-2">{uni.name}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <div className="flex items-center gap-1.5 bg-gray-50 text-gray-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <MapPin className="w-3.5 h-3.5" />
                      {uni.location}
                    </div>
                    {collegeCount && (
                      <div className="bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {collegeCount} {displayTerm}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="pt-8 border-t border-gray-50 mt-auto flex items-center justify-between">
                  <span className="text-[11px] font-black text-green-600 uppercase tracking-widest group-hover:underline">
                    Access Repository &rarr;
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-32 bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-200">
          <Building2 className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-gray-900 mb-2">No Matching Archives</h3>
          <p className="text-gray-500 mb-10 max-w-sm mx-auto font-medium">Your institution is either restricted or not yet onboarded to our federal network.</p>
          <Link to="/" className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-800 transition-all shadow-xl">
            Return Home
          </Link>
        </div>
      )}
    </div>
  );
};

export default UniversityList;
