import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UserRank {
  id: string;
  name: string;
  nickname: string;
  user_avatar?: string;
  post_count: number;
  total_points: number;
}

export const useRealtimeLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Fetch initial data from the refreshed materialized view
      const { data, error: fetchError } = await supabase
        .from('top_20_users')
        .select('*');

      if (fetchError) throw fetchError;
      setLeaderboard(data || []);
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Subscribe to changes in the users table specifically for points
    const channel = supabase
      .channel('leaderboard-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          // If monthly points changed, it triggers a refresh in the DB
          // We can refresh the view here too
          if (payload.new.monthly_points !== payload.old.monthly_points) {
            fetchLeaderboard();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { leaderboard, loading, error, refresh: fetchLeaderboard };
};

export const useTopEngagedUsers = () => {
  const [users, setUsers] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopUsers = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('id, name, nickname, engagement_score')
        .order('engagement_score', { ascending: false })
        .limit(20);

      if (fetchError) throw fetchError;
      setUsers(data?.map(u => ({
        id: u.id,
        name: u.name,
        nickname: u.nickname,
        post_count: 0, // Not needed for this view
        total_engagement: u.engagement_score || 0
      })) || []);
    } catch (err: any) {
      console.error('Error fetching top engaged users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopUsers();

    const channel = supabase
      .channel('users-engagement-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          if (payload.new.engagement_score !== payload.old.engagement_score) {
            fetchTopUsers();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { users, loading, error, refresh: fetchTopUsers };
};

export const useAlgorithmSettings = (settingId: string) => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('algorithm_settings')
        .select('weights')
        .eq('id', settingId)
        .single();

      if (!error && data) {
        setSettings(data.weights);
      }
      setLoading(false);
    };

    fetchSettings();

    // Real-time subscription to algorithm settings
    const channel = supabase
      .channel(`settings-${settingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'algorithm_settings',
          filter: `id=eq.${settingId}`,
        },
        (payload) => {
          setSettings(payload.new.weights);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [settingId]);

  return { settings, loading };
};
