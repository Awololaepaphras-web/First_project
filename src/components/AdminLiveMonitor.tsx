import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, UserPlus, Zap, Upload, Settings, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatePresence } from 'framer-motion';

interface AppEvent {
  id: string;
  event_type: string;
  payload: any;
  created_at: string;
}

const AdminLiveMonitor: React.FC = () => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initial fetch of recent events
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('app_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (!error && data) {
        setEvents(data);
      }
    };

    fetchEvents();

    // Subscribe to new events
    const channel = supabase
      .channel('admin-live-monitor')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'app_events'
        },
        (payload) => {
          console.log('New app event:', payload);
          setEvents(prev => [payload.new as AppEvent, ...prev.slice(0, 19)]);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'signup': return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'viral_post': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'upload': return <Upload className="w-4 h-4 text-green-500" />;
      case 'weight_change': return <Settings className="w-4 h-4 text-purple-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatPayload = (payload: any) => {
    if (!payload) return '';
    if (payload.name) return `User: ${payload.name}`;
    if (payload.admin_id) return `Admin: ${payload.admin_id.slice(0, 8)}...`;
    return JSON.stringify(payload).slice(0, 50) + '...';
  };

  return (
    <div className="bg-black border border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-proph/10 rounded-xl text-brand-proph">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Live App Logs</h3>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Real-time Activity Stream</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar space-y-3">
        <AnimatePresence initial={false}>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-600">
              <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest">No recent activity</p>
            </div>
          ) : (
            events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-gray-900/30 border border-gray-800/50 rounded-2xl flex items-start gap-4 hover:bg-gray-900/50 transition-all group"
              >
                <div className="p-2 bg-gray-800 rounded-xl group-hover:scale-110 transition-transform">
                  {getEventIcon(event.event_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">
                      {event.event_type.replace('_', ' ')}
                    </span>
                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-2 h-2" />
                      {new Date(event.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium truncate">
                    {formatPayload(event.payload)}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-gray-900/50 border-t border-gray-800 text-center">
        <button className="text-[10px] font-black text-brand-proph uppercase tracking-widest hover:underline">
          View Full Audit Log
        </button>
      </div>
    </div>
  );
};

export default AdminLiveMonitor;
