
import React, { useState, useMemo } from 'react';
import { 
  Trophy, Heart, UserPlus, UserCheck, 
  Search, Globe, Award, Star, TrendingUp,
  ArrowUpRight, Users, Sparkles
} from 'lucide-react';
import { User, Post } from '../types';

interface LeaderboardProps {
  user: User;
  allUsers: User[];
  posts: Post[];
  onFollow: (userId: string) => void;
}

type SortBy = 'followers' | 'likes';

const Leaderboard: React.FC<LeaderboardProps> = ({ user, allUsers, posts, onFollow }) => {
  const [sortBy, setSortBy] = useState<SortBy>('followers');
  const [search, setSearch] = useState('');

  const rankings = useMemo(() => {
    return allUsers.map(u => {
      // Calculate followers: how many users follow this user
      const followersCount = allUsers.filter(other => other.following?.includes(u.id)).length;
      
      // Calculate total likes: sum of likes on all their posts + all their comments
      const userPosts = posts.filter(p => p.userId === u.id);
      const postLikes = userPosts.reduce((acc, p) => acc + (p.likes?.length || 0), 0);
      
      // Sum likes on comments made by this user in ANY post
      const commentLikes = posts.reduce((acc, p) => {
        const userComments = p.comments?.filter(c => c.userId === u.id) || [];
        return acc + userComments.reduce((sum, c) => sum + (c.likes?.length || 0), 0);
      }, 0);

      return {
        ...u,
        followersCount,
        totalLikes: postLikes + commentLikes
      };
    });
  }, [allUsers, posts]);

  const filteredRankings = useMemo(() => {
    return rankings
      .filter(r => 
        r.name.toLowerCase().includes(search.toLowerCase()) || 
        r.university.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'followers') return b.followersCount - a.followersCount;
        return b.totalLikes - a.totalLikes;
      });
  }, [rankings, search, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest mb-4">
              <TrendingUp className="w-4 h-4" /> Real-time Social Index
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Social Rankings</h1>
            <p className="text-gray-500 font-medium mt-2">Recognizing students who drive academic conversation and peer support.</p>
          </div>
          
          <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
            <button 
              onClick={() => setSortBy('followers')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'followers' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Most Followed
            </button>
            <button 
              onClick={() => setSortBy('likes')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'likes' ? 'bg-white text-red-500 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Most Liked
            </button>
          </div>
        </div>

        {/* Stats Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                <Users className="w-24 h-24" />
              </div>
              <h3 className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">Network Reach</h3>
              <p className="text-3xl font-black">{rankings.reduce((a, b) => a + b.followersCount, 0)}</p>
              <p className="text-xs text-blue-100 font-medium mt-1">Total Connections across Federal Network</p>
           </div>
           
           <div className="bg-gradient-to-br from-red-500 to-rose-600 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Heart className="w-24 h-24" />
              </div>
              <h3 className="text-[10px] font-black text-red-100 uppercase tracking-widest mb-2">Appreciation Volume</h3>
              <p className="text-3xl font-black">{rankings.reduce((a, b) => a + b.totalLikes, 0)}</p>
              <p className="text-xs text-red-50 font-medium mt-1">Hearts awarded for insightful contributions</p>
           </div>

           <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                <input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Find a peer..."
                  className="w-full bg-gray-50 border border-gray-100 pl-12 pr-4 py-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
              </div>
           </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="p-8">Rank & Identity</th>
                  <th className="p-8">University Link</th>
                  <th className="p-8 text-center">Social Impact</th>
                  <th className="p-8 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRankings.length > 0 ? filteredRankings.map((ranker, index) => {
                  const isFollowing = user.following?.includes(ranker.id);
                  const isSelf = user.id === ranker.id;

                  return (
                    <tr key={ranker.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-8">
                        <div className="flex items-center gap-6">
                           <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center font-black text-lg ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : 'text-gray-200'}`}>
                              {index + 1}
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-gray-100 rounded-[1.5rem] flex items-center justify-center text-gray-400 font-black text-xl border border-gray-200 shadow-inner group-hover:bg-white group-hover:border-green-100 transition-colors">
                                 {ranker.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-black text-gray-900 text-lg leading-none">{ranker.name}</p>
                                  {index < 3 && <Star className={`w-4 h-4 ${index === 0 ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />}
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">{ranker.role}</p>
                              </div>
                           </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <span className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-800 group-hover:bg-green-600 transition-colors">
                          {ranker.university}
                        </span>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center justify-center gap-8">
                           <div className="text-center group-hover:scale-110 transition-transform">
                              <p className="text-xl font-black text-gray-900">{ranker.followersCount}</p>
                              <p className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">Followers</p>
                           </div>
                           <div className="text-center group-hover:scale-110 transition-transform">
                              <p className="text-xl font-black text-gray-900">{ranker.totalLikes}</p>
                              <p className="text-[9px] font-black text-red-400 uppercase tracking-tighter">Total Likes</p>
                           </div>
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        {!isSelf ? (
                          <button 
                            onClick={() => onFollow(ranker.id)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isFollowing ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-blue-600 text-white shadow-xl shadow-blue-100 hover:bg-blue-700'}`}
                          >
                            {isFollowing ? <><UserCheck className="w-4 h-4 inline mr-2" /> Linked</> : <><UserPlus className="w-4 h-4 inline mr-2" /> Link</>}
                          </button>
                        ) : (
                          <div className="flex justify-end gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest pr-4">
                             <Sparkles className="w-4 h-4" /> You
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} className="py-32 text-center text-gray-300">
                       <Globe className="w-16 h-16 mx-auto mb-4 opacity-10" />
                       <p className="text-xs font-black uppercase tracking-widest">No matching students found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Hall of Fame Tip */}
        <div className="bg-gray-900 p-10 rounded-[3.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
           <div className="absolute left-0 top-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[60px]" />
           <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-[2rem] flex items-center justify-center backdrop-blur-md">
                 <Award className="w-8 h-8 text-yellow-500" />
              </div>
              <div>
                 <h3 className="text-xl font-black mb-1">Elite Pioneer Recognition</h3>
                 <p className="text-sm text-gray-400 font-medium">Top 5 students globally at the end of each session receive special point bounties.</p>
              </div>
           </div>
           <button className="bg-white text-gray-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2 group">
              View Rewards <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
