
import React, { useState } from 'react';
import { 
  Terminal, Copy, CheckCircle2, Database, Shield, 
  Zap, Globe, Lock, Code2, ExternalLink, Cpu,
  Layers, Server, Activity
} from 'lucide-react';

const VercelSqlView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const sqlCode = `-- ==========================================
-- PROPH UNIVERSITY FEED SCHEMA
-- ==========================================

-- 1. POSTS TABLE DEFINITION
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL,
    user_nickname TEXT NOT NULL,
    user_avatar TEXT,
    user_university TEXT,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT,
    likes UUID[] DEFAULT '{}',
    reposts UUID[] DEFAULT '{}',
    comments JSONB DEFAULT '[]',
    parent_id UUID REFERENCES public.posts(id),
    tags TEXT[] DEFAULT '{}',
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'node_only', 'private')),
    is_edited BOOLEAN DEFAULT false,
    stats JSONB DEFAULT '{"linkClicks": 0, "profileClicks": 0, "mediaViews": 0, "detailsExpanded": 0, "impressions": 0}',
    created_at BIGINT NOT NULL
);

-- 2. PERFORMANCE INDEXING
-- Optimized for University-Specific Feed Filtering
CREATE INDEX IF NOT EXISTS idx_posts_university 
ON public.posts(user_university) 
WHERE user_university IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_posts_created_at 
ON public.posts(created_at DESC);

-- 3. REALTIME SYNCHRONIZATION
-- Enable Postgres Changes for Live University Feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;

-- 4. SECURITY PROTOCOL (RLS)
-- Strictly syncs feed visibility to university nodes
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "University Node Strict Access" 
ON public.posts FOR SELECT 
USING (
  visibility = 'public' OR 
  (visibility = 'node_only' AND user_university = (
    SELECT university FROM public.users WHERE id = auth.uid()
  ))
);

CREATE POLICY "Node Content Creation" 
ON public.posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 5. ANALYTICS VIEW
CREATE OR REPLACE VIEW university_feed_stats AS
SELECT 
    user_university,
    COUNT(*) as total_posts,
    SUM(array_length(likes, 1)) as total_likes
FROM public.posts
GROUP BY user_university;`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white">
      {/* Vercel-style Navigation Bar */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-black mb-0.5"></div>
              </div>
              <span className="font-bold tracking-tight text-lg">Vercel</span>
            </div>
            <div className="h-6 w-px bg-white/20"></div>
            <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
              <span className="text-white">Proph HQ</span>
              <span className="text-gray-600">/</span>
              <span>university-feed-sql</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-1.5 bg-white text-black rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
              Deploy
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-500 text-xs font-bold uppercase tracking-widest">
            <Database className="w-4 h-4" />
            <span>Database Schema</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter">University Feed <span className="text-gray-500">SQL Engine</span></h1>
          <p className="text-xl text-gray-400 max-w-3xl font-medium leading-relaxed">
            The architectural blueprint for the Proph University Feed. Optimized for high-concurrency university nodes and strictly synced via Postgres RLS.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Status', value: 'Ready', icon: Activity, color: 'text-green-500' },
            { label: 'Engine', value: 'PostgreSQL', icon: Cpu, color: 'text-blue-500' },
            { label: 'Sync Mode', value: 'Strict', icon: Globe, color: 'text-purple-500' },
            { label: 'Security', value: 'RLS Active', icon: Shield, color: 'text-red-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* SQL Code Block Section */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
            {/* Window Header */}
            <div className="bg-white/[0.03] border-b border-white/10 px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
                <div className="h-4 w-px bg-white/10"></div>
                <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>university_feed_setup.sql</span>
                </div>
              </div>
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Content */}
            <div className="p-8 overflow-x-auto font-mono text-sm leading-relaxed">
              <pre className="text-gray-300">
                {sqlCode.split('\n').map((line, i) => (
                  <div key={i} className="flex gap-8 group/line">
                    <span className="w-8 text-gray-700 text-right select-none group-hover/line:text-gray-500 transition-colors">{(i + 1).toString().padStart(2, '0')}</span>
                    <span className={
                      line.startsWith('--') ? 'text-gray-600 italic' :
                      line.includes('CREATE') || line.includes('ALTER') || line.includes('TABLE') || line.includes('POLICY') || line.includes('INDEX') || line.includes('VIEW') ? 'text-blue-400 font-bold' :
                      line.includes('REFERENCES') || line.includes('NOT NULL') || line.includes('DEFAULT') || line.includes('PRIMARY KEY') ? 'text-purple-400' :
                      line.includes('SELECT') || line.includes('FROM') || line.includes('WHERE') || line.includes('GROUP BY') ? 'text-yellow-400' :
                      'text-gray-300'
                    }>
                      {line}
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white font-bold">
              <Lock className="w-5 h-5 text-blue-500" />
              <span>Strict RLS Sync</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Row Level Security ensures that "node_only" content is strictly isolated to users within the same university. No data leaks across institutional boundaries.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white font-bold">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Realtime Publication</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              The schema enables the \`supabase_realtime\` publication for the posts table, allowing for sub-millisecond feed updates across the network.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white font-bold">
              <Layers className="w-5 h-5 text-purple-500" />
              <span>Optimized Indexing</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              B-Tree indexing on \`user_university\` and \`created_at\` ensures that feed queries remain performant even as the network scales to millions of posts.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between py-12 text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
          <span>Proph Infrastructure v4.0</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
            <a href="#" className="hover:text-white transition-colors">API Status</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VercelSqlView;
