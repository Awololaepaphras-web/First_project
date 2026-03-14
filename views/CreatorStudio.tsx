
import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, Users, Video, BarChart2, Award, 
  Settings, ArrowUpRight, ArrowDownRight, Clock, PlusCircle,
  Eye, ThumbsUp, MessageCircle, Share2, Play, Calendar
} from 'lucide-react';
import { User, Video as VideoType } from '../types';

interface CreatorStudioProps {
  user: User;
  videos: VideoType[];
}

const CreatorStudio: React.FC<CreatorStudioProps> = ({ user, videos }) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const userVideos = videos.filter(v => v.userId === user.id);
  const totalViews = userVideos.reduce((acc, v) => acc + v.views, 0);
  const estimatedRevenue = totalViews * 0.05; // #0.05 per view simulation

  const stats = [
    { label: 'Total Views', value: totalViews.toLocaleString(), icon: <Users className="w-5 h-5" />, trend: '+12.5%', isUp: true },
    { label: 'Estimated Revenue', value: `#${estimatedRevenue.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, trend: '+8.2%', isUp: true },
    { label: 'Watch Time', value: '452 hrs', icon: <Clock className="w-5 h-5" />, trend: '-2.1%', isUp: false },
    { label: 'Active Videos', value: userVideos.length, icon: <Video className="w-5 h-5" />, trend: 'New', isUp: true },
  ];

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-600 rounded-2xl text-white shadow-xl shadow-red-100">
                 <BarChart2 className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Creator Studio</h1>
           </div>
           <p className="text-gray-500 font-medium">Analytics & management for your content ecosystem.</p>
        </div>
        
        <button className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-black transition-all shadow-xl">
           <PlusCircle className="w-5 h-5" /> Upload New Video
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
             <div className="flex justify-between items-start">
                <div className="p-3 bg-gray-50 rounded-2xl text-gray-400">{stat.icon}</div>
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
                   {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                   {stat.trend}
                </div>
             </div>
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden">
               <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="text-xl font-black text-gray-900">Content Library</h3>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500">Uploads</button>
                    <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400">Live</button>
                  </div>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                     <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <tr>
                           <th className="p-6">Video</th>
                           <th className="p-6">Status</th>
                           <th className="p-6">Performance</th>
                           <th className="p-6 text-right">Revenue</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                       {userVideos.length > 0 ? userVideos.map(video => (
                         <tr 
                          key={video.id} 
                          onClick={() => setSelectedVideo(video)}
                          className={`cursor-pointer transition-colors ${selectedVideo?.id === video.id ? 'bg-red-50' : 'hover:bg-gray-50/50'}`}
                         >
                           <td className="p-6 flex items-center gap-4">
                              <div className="w-24 aspect-video rounded-xl bg-gray-100 overflow-hidden relative group">
                                 <img src={video.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Play className="w-6 h-6 text-white" />
                                 </div>
                              </div>
                              <div className="max-w-[150px]">
                                 <p className="font-black text-gray-900 truncate">{video.title}</p>
                                 <p className="text-[10px] text-gray-400 font-bold uppercase">{video.category}</p>
                              </div>
                           </td>
                           <td className="p-6">
                              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">Public</span>
                           </td>
                           <td className="p-6">
                              <div className="flex items-center gap-4">
                                <div>
                                  <p className="font-black text-gray-900">{video.views.toLocaleString()}</p>
                                  <p className="text-[9px] font-bold text-gray-400 uppercase">Views</p>
                                </div>
                                <div className="h-8 w-px bg-gray-100" />
                                <div>
                                  <p className="font-black text-gray-900">{video.likes}</p>
                                  <p className="text-[9px] font-bold text-gray-400 uppercase">Likes</p>
                                </div>
                              </div>
                           </td>
                           <td className="p-6 text-right font-black text-gray-900">
                              #{ (video.views * 0.05).toLocaleString() }
                           </td>
                         </tr>
                       )) : (
                         <tr>
                           <td colSpan={4} className="py-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">No videos found. Start creating today!</td>
                         </tr>
                       )}
                     </tbody>
                  </table>
               </div>
            </div>

            {selectedVideo && (
              <div className="bg-gray-900 rounded-[3rem] p-10 text-white space-y-8 animate-fade-in">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black italic uppercase tracking-tight">Video Analytics: {selectedVideo.title}</h3>
                    <p className="text-gray-400 text-sm font-medium">Detailed performance breakdown for this asset.</p>
                  </div>
                  <button onClick={() => setSelectedVideo(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Real-time Views</p>
                    <p className="text-2xl font-black italic text-white">{Math.floor(selectedVideo.views * 0.1).toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-green-500 uppercase">+48h</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Avg. View Duration</p>
                    <p className="text-2xl font-black italic text-white">2:45</p>
                    <p className="text-[9px] font-bold text-gray-500 uppercase">65.2%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Impressions</p>
                    <p className="text-2xl font-black italic text-white">{(selectedVideo.views * 12).toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-gray-500 uppercase">CTR: 8.4%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Unique Viewers</p>
                    <p className="text-2xl font-black italic text-white">{(selectedVideo.views * 0.8).toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-gray-500 uppercase">New Nodes</p>
                  </div>
                </div>

                <div className="h-48 bg-black/40 rounded-3xl border border-white/5 flex items-end p-6 gap-2">
                  {[40, 70, 45, 90, 65, 80, 50, 85, 60, 95, 75, 100].map((h, i) => (
                    <div key={i} className="flex-grow bg-red-600/20 rounded-t-lg relative group">
                      <div className="absolute bottom-0 left-0 right-0 bg-red-600 rounded-t-lg transition-all duration-1000" style={{ height: `${h}%` }} />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {Math.floor(selectedVideo.views * (h/100))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
         </div>

         <div className="bg-gray-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <Award className="w-48 h-48" />
            </div>
            <h3 className="text-2xl font-black mb-6">Monetization Checklist</h3>
            <div className="space-y-8 relative z-10">
               {[
                 { label: 'Followers (min 1,000)', val: 240, target: 1000 },
                 { label: 'Watch Hours (min 4,000)', val: 452, target: 4000 },
                 { label: 'Unique Uploads (min 10)', val: userVideos.length, target: 10 }
               ].map((c, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span>{c.label}</span>
                       <span className="text-gray-400">{c.val} / {c.target}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${Math.min(100, (c.val/c.target)*100)}%` }} />
                    </div>
                 </div>
               ))}
               
               <div className="pt-8 border-t border-white/10">
                  <p className="text-xs text-gray-400 leading-relaxed font-medium">
                    You'll be automatically notified via the Institutional Command portal once your account qualifies for the Revenue Share program.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CreatorStudio;
