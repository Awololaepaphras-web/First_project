import React from 'react';
import { useRealtimeLeaderboard, useTopEngagedUsers } from '../src/hooks/useRealtimeRanking';
import { Award, TrendingUp, Users, Loader2, Star } from 'lucide-react';

const LeaderboardView: React.FC = () => {
  const { leaderboard, loading: leaderboardLoading, error: leaderboardError } = useRealtimeLeaderboard();
  const { users: topUsers, loading: topUsersLoading, error: topUsersError } = useTopEngagedUsers();

  const loading = leaderboardLoading || topUsersLoading;
  const error = leaderboardError || topUsersError;

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-16">
        <header className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-proph rounded-2xl shadow-xl shadow-brand-proph/20">
              <Award className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Engagement Hub</h1>
          </div>
          <p className="text-gray-500 font-medium italic max-w-2xl">
            Real-time ranking of the most active scholars in the matrix.
          </p>
        </header>

        {/* Top 10 All-Time Engaged (New Section) */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-brand-proph" />
            <h2 className="text-2xl font-black uppercase italic tracking-tight">Top 10 All-Time Engaged</h2>
          </div>
          
          {topUsersLoading ? (
            <div className="flex items-center gap-3 py-10">
              <Loader2 className="w-6 h-6 text-brand-proph animate-spin" />
              <span className="text-xs font-black uppercase tracking-widest text-gray-500 italic">Syncing All-Time Data...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topUsers.map((user, index) => (
                <div key={user.id} className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl flex items-center justify-between group hover:border-brand-proph transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic ${
                      index === 0 ? 'bg-brand-proph text-black' : 'bg-gray-800 text-gray-500'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-black italic text-white group-hover:text-brand-proph transition-colors">{user.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">@{user.nickname}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black italic text-brand-proph">{user.total_engagement.toLocaleString()}</p>
                    <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Score</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 24h Leaderboard */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-brand-proph" />
            <h2 className="text-2xl font-black uppercase italic tracking-tight">24h Matrix Pulse</h2>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-12 h-12 text-brand-proph animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Synchronizing Matrix Data...</p>
            </div>
          ) : error ? (
            <div className="p-8 bg-red-600/10 border border-red-500/20 rounded-[2rem] text-center">
              <p className="text-red-500 font-black uppercase italic">Matrix Sync Error: {error}</p>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-[3rem] border border-gray-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-800 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <tr>
                      <th className="p-8">Rank</th>
                      <th className="p-8">Scholar</th>
                      <th className="p-8">Activity</th>
                      <th className="p-8 text-right">Engagement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {leaderboard.map((user, index) => (
                      <tr key={user.id} className="hover:bg-white/5 transition-all group">
                        <td className="p-8">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic text-xl ${
                            index === 0 ? 'bg-brand-proph text-black shadow-lg shadow-brand-proph/30' :
                            index === 1 ? 'bg-gray-300 text-black' :
                            index === 2 ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'
                          }`}>
                            #{index + 1}
                          </div>
                        </td>
                        <td className="p-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-black text-brand-proph">
                              {user.name[0]}
                            </div>
                            <div>
                              <p className="font-black italic text-lg text-white group-hover:text-brand-proph transition-colors">{user.name}</p>
                              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">@{user.nickname}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-8">
                          <div className="flex items-center gap-2 text-gray-400">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs font-black uppercase">{user.post_count} Posts</span>
                          </div>
                        </td>
                        <td className="p-8 text-right">
                          <p className="text-3xl font-black italic text-brand-proph">{user.total_engagement.toLocaleString()}</p>
                          <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Engagement Points</p>
                        </td>
                      </tr>
                    ))}
                    {leaderboard.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-20 text-center">
                          <div className="space-y-4">
                            <Users className="w-12 h-12 text-gray-800 mx-auto" />
                            <p className="text-gray-600 font-black italic uppercase text-sm">No active nodes detected in the last 24 hours</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <footer className="p-8 bg-gray-900/50 rounded-[2.5rem] border border-gray-800">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-600/10 rounded-xl text-blue-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">How it works</p>
              <p className="text-xs text-gray-500 leading-relaxed font-medium italic">
                The hub tracks both all-time engagement scores and real-time 24h pulse. All-time scores are cumulative, while the 24h pulse focuses on recent activity using a weighted matrix of likes, replies, and shares.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LeaderboardView;
